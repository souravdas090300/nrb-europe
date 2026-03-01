import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withSecurity, safeParseBody } from '@/lib/security'
import { sanitizeSlug } from '@/lib/security'

// PATCH — update a category (admin only, secured)
export const PATCH = withSecurity(
  async (request: NextRequest, { params }) => {
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { data, error } = await safeParseBody<{
      name?: string; slug?: string; color?: string; description?: string;
      parentId?: string; sortOrder?: number; isActive?: boolean
    }>(request)

    if (error || !data) {
      return NextResponse.json({ error: error || 'Invalid body' }, { status: 400 })
    }

    const { name, slug, color, description, parentId, sortOrder, isActive } = data

    // If slug is changing, check uniqueness
    if (slug) {
      const safeSlug = sanitizeSlug(slug)
      const existing = await prisma.category.findFirst({
        where: { slug: safeSlug, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 })
      }
    }

    // Prevent setting parent to self
    if (parentId === id) {
      return NextResponse.json({ error: 'Cannot set category as its own parent' }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug: sanitizeSlug(slug) }),
        ...(color !== undefined && { color }),
        ...(description !== undefined && { description }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: true,
      },
    })

    return NextResponse.json(category)
  },
  { rateLimit: 'admin', adminOnly: true }
)

// DELETE — delete a category (admin only, secured)
export const DELETE = withSecurity(
  async (_request: NextRequest, { params }) => {
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Reassign children to no parent
    await prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    })

    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ success: true })
  },
  { rateLimit: 'admin', adminOnly: true }
)
