import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { strictLimiter } from '@/lib/security/rate-limit'
import { validateLength } from '@/lib/security/sanitize'

export async function POST(request: NextRequest) {
  // Rate limit: 5 password change attempts per minute per IP
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!newPassword || !validateLength(newPassword, 8, 128)) {
      return NextResponse.json(
        { error: 'New password must be between 8 and 128 characters' },
        { status: 400 }
      )
    }

    // Password strength check
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumber = /\d/.test(newPassword)
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    // If user has an existing password, verify current password
    if (user?.password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        )
      }

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
    }

    // Hash with higher cost factor (12 rounds)
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
