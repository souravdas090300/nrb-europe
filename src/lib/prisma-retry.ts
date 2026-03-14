import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

const TRANSIENT_PRISMA_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017'])
const TRANSIENT_MESSAGE_PATTERNS = [
  'can\'t reach database server',
  'server has closed the connection',
  'connection closed',
  'connection terminated',
  'timeout',
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isTransientPrismaError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return true
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRANSIENT_PRISMA_CODES.has(error.code)
  }

  if (typeof error === 'object' && error !== null) {
    const candidate = error as { code?: string; message?: string }
    if (candidate.code && TRANSIENT_PRISMA_CODES.has(candidate.code)) {
      return true
    }

    const message = candidate.message?.toLowerCase() ?? ''
    return TRANSIENT_MESSAGE_PATTERNS.some((pattern) => message.includes(pattern))
  }

  return false
}

export async function withPrismaRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let attempt = 0
  let lastError: unknown

  while (attempt < attempts) {
    try {
      if (attempt > 0) {
        await prisma.$disconnect().catch(() => undefined)
        await prisma.$connect()
      }

      return await operation()
    } catch (error) {
      lastError = error
      if (!isTransientPrismaError(error) || attempt === attempts - 1) {
        throw error
      }

      await sleep(250 * (attempt + 1))
      attempt += 1
    }
  }

  throw lastError
}