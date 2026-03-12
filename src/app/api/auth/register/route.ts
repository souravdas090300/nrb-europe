/**
 * @file POST /api/auth/register — User registration endpoint
 *
 * Flow:
 *  1. Rate-limit check (10 attempts / 15 min per IP)
 *  2. Input sanitisation & validation (email, name, password strength)
 *  3. Check for existing user (generic error to prevent email enumeration)
 *  4. Hash password with bcrypt (12 rounds)
 *  5. Create User record in PostgreSQL
 *  6. Generate 32-byte verification token (24h expiry)
 *  7. Send verification email via Resend
 *
 * If the email send fails, the user is still created and a 201 is returned
 * with an informative message so the user can request a new verification.
 *
 * @security Rate-limited via `authLimiter`, input sanitised via `sanitizeEmail`/`sanitizeString`
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import * as Sentry from '@sentry/nextjs'
import { sendVerificationEmail } from '@/lib/email'
import { authLimiter } from '@/lib/security/rate-limit'
import { sanitizeString, sanitizeEmail, validateLength } from '@/lib/security/sanitize'

export async function POST(request: NextRequest) {
  // Rate limit: 10 registration attempts per 15 minutes per IP
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

  let body: { email?: unknown; name?: unknown; password?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    const rawEmail = body.email
    const rawName = body.name
    const rawPassword = body.password

    // Sanitize inputs
    const email = sanitizeEmail(typeof rawEmail === 'string' ? rawEmail : '')
    const name = sanitizeString(typeof rawName === 'string' ? rawName : '')
    const password = typeof rawPassword === 'string' ? rawPassword : '' // Don't sanitize passwords — they can contain special chars

    if (!email) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    if (!name || !validateLength(name, 1, 100)) {
      return NextResponse.json({ error: 'Name is required (max 100 characters)' }, { status: 400 })
    }

    if (!password || !validateLength(password, 8, 128)) {
      return NextResponse.json(
        { error: 'Password must be between 8 and 128 characters' },
        { status: 400 }
      )
    }

    // Password strength check
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Don't reveal whether email exists — use generic message
      return NextResponse.json(
        { error: 'Unable to create account. If you already have an account, try signing in.' },
        { status: 409 }
      )
    }

    // Hash with higher cost factor (12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12)

    let user: { id: string }
    try {
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'subscriber',
          // Auto-verify in development: Resend sandbox only sends to the account owner's email,
          // so enforce email verification only when a verified sending domain is configured.
          ...(process.env.NODE_ENV === 'development' && { emailVerified: new Date() }),
        },
        select: { id: true },
      })
    } catch (createError: any) {
      // P2002 = unique constraint violation (race condition: two simultaneous registrations)
      if (createError?.code === 'P2002') {
        return NextResponse.json(
          { error: 'Unable to create account. If you already have an account, try signing in.' },
          { status: 409 }
        )
      }
      throw createError
    }

    // Generate verification token (still useful even in dev for future prod use)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    })

    // In development, email is auto-verified so skip the send
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { message: 'Account created successfully. You can now sign in.', userId: user.id },
        { status: 201 }
      )
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, name, verificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // User was created but email failed — inform them
      return NextResponse.json(
        { message: 'Account created but we could not send the verification email. Please contact support or try again later.', userId: user.id },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { message: 'Account created. Please check your email to verify your account.', userId: user.id },
      { status: 201 }
    )
  } catch (error: any) {
    // P1001/P1008/P1017: DB unreachable (Neon cold-start, connection closed, etc.)
    if (error?.code?.startsWith('P1')) {
      console.error('Database connection error during registration:', error)
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }
    Sentry.captureException(error)
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
