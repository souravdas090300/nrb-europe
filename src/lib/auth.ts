/**
 * @file auth.ts — NextAuth v4 configuration for NRB Europe
 *
 * Authentication strategy: JWT (stateless sessions stored in cookies).
 *
 * Providers:
 *  1. **Google OAuth** — social sign-in, auto-creates user via PrismaAdapter.
 *  2. **Credentials** — email + password login with brute-force protection,
 *     progressive delays, and email-verification enforcement.
 *
 * Callbacks extend the default JWT/session objects with `id` and `role` so
 * they are available on the client via `useSession()` and on the server via
 * `getServerSession(authOptions)`.
 *
 * @see {@link src/lib/security/brute-force.ts} for lockout logic
 * @see {@link src/types/next-auth.d.ts} for augmented Session/JWT types
 */

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { withPrismaRetry } from './prisma-retry'
import { checkBruteForce, recordFailedAttempt, recordSuccessfulLogin } from './security/brute-force'

/**
 * Central NextAuth configuration object.
 * Imported by API route `/api/auth/[...nextauth]` and by any server-side
 * code that calls `getServerSession(authOptions)`.
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    // --- Credentials provider (email + password) ---
    // Includes brute-force protection: progressive delays after 3 failures,
    // account lockout after 5 failures per email or 20 per IP.
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

        const user = await withPrismaRetry(() => prisma.user.findUnique({
          where: { email },
        })).catch((dbError) => {
          console.error('Database error during credential lookup:', dbError)
          throw new Error('Authentication service is temporarily unavailable. Please try again.')
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

        // Check if email is verified (skip in development — no sending domain configured)
        if (process.env.NODE_ENV !== 'development' && !user.emailVerified) {
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
  // --- Callbacks ---
  // Extend the default JWT and Session objects with custom fields (`id`, `role`).
  callbacks: {
    /** Persist user `id` and `role` into the JWT on first sign-in. */
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // For OAuth sign-ins, fetch role from DB since it's not on the user object
        if (account?.provider !== 'credentials') {
          const dbUser = await withPrismaRetry(() => prisma.user.findUnique({ where: { id: user.id } }))
          token.role = dbUser?.role ?? 'subscriber'
        } else {
          token.role = (user as any).role
        }
      }
      return token
    },
    /** Expose `id` and `role` from the JWT to the client-side session. */
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
