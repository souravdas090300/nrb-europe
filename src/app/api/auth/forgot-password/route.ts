/**
 * @file POST /api/auth/forgot-password — Password reset request
 *
 * Accepts an email address and (if the account exists and uses credentials)
 * generates a password-reset token valid for 1 hour.
 *
 * Security measures:
 *  - Strict rate limit: 5 requests/min per IP
 *  - Always returns the same success message regardless of whether the email
 *    exists (prevents email enumeration)
 *  - Artificial random delay (500–1000 ms) to defeat timing attacks
 *  - Only sends reset emails to credential-based accounts (not OAuth-only)
 *  - Deletes any existing tokens before creating a new one
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'
import { strictLimiter } from '@/lib/security/rate-limit'
import { sanitizeEmail } from '@/lib/security/sanitize'

export async function POST(request: NextRequest) {
  // Strict rate limit: 5 reset requests per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateLimitResult = strictLimiter.check(ip)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)) },
      }
    )
  }

  try {
    const body = await request.json()
    const email = sanitizeEmail(body.email || '')

    if (!email) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (user && user.password) {
      // Only send reset for users with password (not OAuth-only)
      // Delete any existing tokens for this user
      await prisma.verificationToken.deleteMany({
        where: { identifier: `reset:${email}` },
      })

      const token = crypto.randomBytes(32).toString('hex')
      const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.verificationToken.create({
        data: {
          identifier: `reset:${email}`,
          token,
          expires,
        },
      })

      await sendPasswordResetEmail(email, user.name || '', token)
    }

    // Artificial delay to prevent timing-based email enumeration
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))

    return NextResponse.json(
      { message: 'If an account with that email exists, a password reset link has been sent.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
