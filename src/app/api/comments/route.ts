import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/comments?articleId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json({ error: 'articleId required' }, { status: 400 })
    }

    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        parentId: null,
        status: 'approved',
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        replies: {
          where: { status: 'approved' },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST /api/comments
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { content, articleId, parentId } = await request.json()

    if (!content?.trim() || !articleId) {
      return NextResponse.json({ error: 'Content and articleId required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Auto-approve for admin/editor, pending for others
    const status = user.role === 'admin' || user.role === 'editor' ? 'approved' : 'pending'

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        articleId,
        userId: user.id,
        parentId: parentId || null,
        status,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
