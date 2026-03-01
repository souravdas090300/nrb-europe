import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { checkBruteForce, recordFailedAttempt, recordSuccessfulLogin } from './security/brute-force'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // Extract IP for brute-force tracking
        const forwarded = req?.headers?.['x-forwarded-for']
        const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded?.[0]) || 'unknown'
        const email = credentials.email.toLowerCase().trim()

        // Check brute-force lockout
        const bruteForceCheck = checkBruteForce(ip, email)
        if (!bruteForceCheck.allowed) {
          throw new Error(`Too many login attempts. Please try again in ${bruteForceCheck.retryAfter} seconds.`)
        }

        // Add progressive delay
        if (bruteForceCheck.delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, bruteForceCheck.delay))
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          recordFailedAttempt(ip, email)
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          recordFailedAttempt(ip, email)
          return null
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error('Please verify your email before signing in. Check your inbox.')
        }

        // Success — reset brute-force counters
        recordSuccessfulLogin(ip, email)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // For OAuth sign-ins, fetch role from DB since it's not on the user object
        if (account?.provider !== 'credentials') {
          const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
          token.role = dbUser?.role ?? 'subscriber'
        } else {
          token.role = (user as any).role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
