import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { withPrismaRetry } from '@/lib/prisma-retry'
import { sanitizeEmail, sanitizeString, validateLength } from '@/lib/security/sanitize'

type RegisterRole = 'subscriber' | 'admin'

type RegisterAccountInput = {
  email: unknown
  name: unknown
  password: unknown
  role: RegisterRole
  adminSetupCode?: unknown
}

type RegisterAccountResult = {
  status: number
  body: Record<string, unknown>
}

function validateAdminSetupCode(adminSetupCode: unknown): RegisterAccountResult | null {
  const ownerSetupSecret = process.env.ADMIN_SETUP_SECRET
  if (!ownerSetupSecret) {
    return {
      status: 503,
      body: { error: 'Admin registration is not configured. Set ADMIN_SETUP_SECRET in environment variables.' },
    }
  }

  const normalizedCode = typeof adminSetupCode === 'string' ? adminSetupCode.trim() : ''
  if (!normalizedCode || normalizedCode !== ownerSetupSecret) {
    return {
      status: 403,
      body: { error: 'Invalid owner setup code for admin registration.' },
    }
  }

  return null
}

export async function registerAccount({ email: rawEmail, name: rawName, password: rawPassword, role, adminSetupCode }: RegisterAccountInput): Promise<RegisterAccountResult> {
  const email = sanitizeEmail(typeof rawEmail === 'string' ? rawEmail : '')
  const name = sanitizeString(typeof rawName === 'string' ? rawName : '')
  const password = typeof rawPassword === 'string' ? rawPassword : ''

  if (role === 'admin') {
    const adminValidation = validateAdminSetupCode(adminSetupCode)
    if (adminValidation) {
      return adminValidation
    }
  }

  if (!email) {
    return { status: 400, body: { error: 'Valid email is required' } }
  }

  if (!name || !validateLength(name, 1, 100)) {
    return { status: 400, body: { error: 'Name is required (max 100 characters)' } }
  }

  if (!password || !validateLength(password, 8, 128)) {
    return { status: 400, body: { error: 'Password must be between 8 and 128 characters' } }
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return {
      status: 400,
      body: { error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
    }
  }

  const existingUser = await withPrismaRetry(() => prisma.user.findUnique({ where: { email } }))
  if (existingUser) {
    return {
      status: 409,
      body: { error: 'Unable to create account. If you already have an account, try signing in.' },
    }
  }

  const emailVerificationEnabled =
    process.env.NODE_ENV !== 'development' &&
    Boolean(process.env.RESEND_API_KEY && process.env.NEXTAUTH_URL)

  const hashedPassword = await bcrypt.hash(password, 12)

  let user: { id: string }
  try {
    user = await withPrismaRetry(() => prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        ...(!emailVerificationEnabled && { emailVerified: new Date() }),
      },
      select: { id: true },
    }))
  } catch (createError: any) {
    if (createError?.code === 'P2002') {
      return {
        status: 409,
        body: { error: 'Unable to create account. If you already have an account, try signing in.' },
      }
    }
    throw createError
  }

  if (!emailVerificationEnabled) {
    return {
      status: 201,
      body: { message: 'Account created successfully. You can now sign in.', userId: user.id },
    }
  }

  const verificationToken = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  try {
    await withPrismaRetry(() => prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    }))
  } catch (tokenError: any) {
    if (tokenError instanceof Prisma.PrismaClientKnownRequestError && (tokenError.code === 'P2021' || tokenError.code === 'P2022')) {
      await withPrismaRetry(() => prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }))

      return {
        status: 201,
        body: {
          message: 'Account created successfully. Email verification is temporarily bypassed due to server configuration.',
          userId: user.id,
        },
      }
    }
    throw tokenError
  }

  try {
    await sendVerificationEmail(email, name, verificationToken)
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError)
    return {
      status: 201,
      body: {
        message: 'Account created but we could not send the verification email. Please contact support or try again later.',
        userId: user.id,
      },
    }
  }

  return {
    status: 201,
    body: { message: 'Account created. Please check your email to verify your account.', userId: user.id },
  }
}