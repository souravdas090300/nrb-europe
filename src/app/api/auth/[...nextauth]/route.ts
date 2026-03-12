import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// NextAuth + Prisma adapter must run on Node.js runtime.
export const runtime = 'nodejs'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
