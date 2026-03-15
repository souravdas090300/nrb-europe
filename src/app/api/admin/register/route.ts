import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { isTransientPrismaError } from '@/lib/prisma-retry'
import { authLimiter } from '@/lib/security/rate-limit'
import { registerAccount } from '@/lib/register-account'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateLimitResult = authLimiter.check(ip)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)) },
      }
    )
  }

  let body: { email?: unknown; name?: unknown; password?: unknown; adminSetupCode?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const result = await registerAccount({
      email: body.email,
      name: body.name,
      password: body.password,
      role: 'admin',
      adminSetupCode: body.adminSetupCode,
    })

    return NextResponse.json(result.body, { status: result.status })
  } catch (error: any) {
    if (isTransientPrismaError(error)) {
      console.error('Prisma initialization error during admin registration:', error)
      return NextResponse.json(
        { error: 'Authentication service is temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2021' || error.code === 'P2022')) {
      console.error('Prisma schema mismatch during admin registration:', error)
      return NextResponse.json(
        { error: 'Service configuration issue detected. Please contact support.' },
        { status: 503 }
      )
    }

    Sentry.captureException(error)
    console.error('Admin registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin account. Please try again.' },
      { status: 500 }
    )
  }
}