import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withSecurity, safeParseBody } from '@/lib/security'

export const dynamic = 'force-dynamic'

export const GET = withSecurity(
  async (_request: NextRequest, { session }) => {
    const userId = (session as { user?: { id?: string } } | null)?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        newsletterSubscribed: true,
        createdAt: true,
        accounts: {
          select: { provider: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const authInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    return NextResponse.json({
      ...user,
      hasPassword: !!authInfo?.password,
      providers: user.accounts.map((account) => account.provider),
    })
  },
  { adminOnly: true, rateLimit: 'admin' }
)

export const PATCH = withSecurity(
  async (request: NextRequest, { session }) => {
    const userId = (session as { user?: { id?: string } } | null)?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await safeParseBody<{ name?: string; newsletterSubscribed?: boolean }>(request)
    if (error || !data) {
      return NextResponse.json({ error: error || 'Invalid body' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.newsletterSubscribed !== undefined) updateData.newsletterSubscribed = data.newsletterSubscribed

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        newsletterSubscribed: true,
      },
    })

    return NextResponse.json(user)
  },
  { adminOnly: true, rateLimit: 'admin' }
)