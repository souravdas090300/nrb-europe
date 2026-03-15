import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withSecurity, safeParseBody } from '@/lib/security'
import { sanitizeSlug } from '@/lib/security'
import { revalidateCategoryViews } from '@/lib/revalidate-categories'

// PATCH — update a category (admin only, secured)
export const PATCH = withSecurity(
  async (request: NextRequest, { params }) => {
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: { slug: true },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const { data, error } = await safeParseBody<{
      name?: string; slug?: string; color?: string; description?: string;
      parentId?: string; sortOrder?: number; isActive?: boolean
    }>(request)

    if (error || !data) {
      return NextResponse.json({ error: error || 'Invalid body' }, { status: 400 })
    }

    const { name, slug, color, description, parentId, sortOrder, isActive } = data

    if (slug) {
      const safeSlug = sanitizeSlug(slug)
      const existing = await prisma.category.findFirst({
        where: { slug: safeSlug, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 })
      }
    }

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

    revalidateCategoryViews([existingCategory.slug, category.slug])

    return NextResponse.json(category)
  },
  { rateLimit: 'admin', adminOnly: true }
)

// DELETE — delete a category (admin only, secured)
export const DELETE = withSecurity(
  async (_request: NextRequest, { params }) => {
    const id = params?.id
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.category.updateMany({
          where: { parentId: id },
          data: { parentId: null },
        })

        await tx.category.delete({ where: { id } })
      })

      revalidateCategoryViews([existingCategory.slug])

      return NextResponse.json({ success: true })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        if (error.code === 'P2003') {
          return NextResponse.json(
            { error: 'This category is still referenced elsewhere and cannot be deleted yet.' },
            { status: 409 }
          )
        }
      }

      console.error('Failed to delete category:', error)
      return NextResponse.json(
        { error: 'Failed to delete category. Please try again.' },
        { status: 500 }
      )
    }
  },
  { rateLimit: 'admin', adminOnly: true }
)
