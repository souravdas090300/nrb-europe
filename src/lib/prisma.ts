/**
 * @file prisma.ts — Singleton PrismaClient for NRB Europe
 *
 * Uses the global-singleton pattern recommended by Prisma for Next.js:
 * during development, the client is stored on `globalThis` so that
 * hot-reloads do not create additional database connections.
 *
 * In production only `error` logs are emitted; in development `query`,
 * `warn`, and `error` are all enabled for easier debugging.
 *
 * @see {@link prisma/schema.prisma} for the database schema
 */

import { PrismaClient } from '@prisma/client'

/** Extend globalThis to hold the Prisma singleton across hot-reloads. */
const globalForPrisma = global as unknown as { prisma: PrismaClient }

/**
 * Singleton PrismaClient instance.
 * Import this from anywhere in the app to run database queries.
 *
 * @example
 * ```ts
 * import { prisma } from '@/lib/prisma'
 * const users = await prisma.user.findMany()
 * ```
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  })

// Persist in globalThis during development to survive HMR
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
