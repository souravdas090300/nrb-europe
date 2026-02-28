import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/comments/moderate - List pending comments
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const comments = await prisma.comment.findMany({
      where: { status: 'pending' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching pending comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// PATCH /api/comments/moderate - Approve or mark as spam
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { commentId, action } = await request.json()

    if (!commentId || !['approve', 'spam', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid commentId or action' }, { status: 400 })
    }

    if (action === 'delete') {
      await prisma.comment.delete({ where: { id: commentId } })
      return NextResponse.json({ success: true, message: 'Comment deleted' })
    }

    const status = action === 'approve' ? 'approved' : 'spam'
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { status },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error moderating comment:', error)
    return NextResponse.json({ error: 'Failed to moderate comment' }, { status: 500 })
  }
}
