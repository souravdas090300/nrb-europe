import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withSecurity, safeParseBody } from '@/lib/security'
import { sanitizeSlug } from '@/lib/security'
import { normalizeCategoryTranslations } from '@/lib/category-localization'
import { revalidateCategoryViews } from '@/lib/revalidate-categories'
import { deleteCategoryFromSanity, syncCategoryToSanity } from '@/lib/sanity/category-sync'

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
      parentId?: string; sortOrder?: number; isActive?: boolean;
      nameTranslations?: Record<string, string>; descriptionTranslations?: Record<string, string>
    }>(request)

    if (error || !data) {
      return NextResponse.json({ error: error || 'Invalid body' }, { status: 400 })
    }

    const { name, slug, color, description, parentId, sortOrder, isActive, nameTranslations, descriptionTranslations } = data
    const normalizedParentId = typeof parentId === 'string' ? parentId.trim() : undefined

    if (slug) {
      const safeSlug = sanitizeSlug(slug)
      const existing = await prisma.category.findFirst({
        where: { slug: safeSlug, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 })
      }
    }

    if (normalizedParentId === id) {
      return NextResponse.json({ error: 'Cannot set category as its own parent' }, { status: 400 })
    }

    if (normalizedParentId) {
      const parentExists = await prisma.category.findFirst({
        where: { id: normalizedParentId, isActive: true },
        select: { id: true },
      })

      if (!parentExists) {
        return NextResponse.json({ error: 'Selected parent category was not found.' }, { status: 400 })
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameTranslations !== undefined && {
          nameTranslations: normalizeCategoryTranslations(nameTranslations) ?? Prisma.JsonNull,
        }),
        ...(slug !== undefined && { slug: sanitizeSlug(slug) }),
        ...(color !== undefined && { color }),
        ...(description !== undefined && { description }),
        ...(descriptionTranslations !== undefined && {
          descriptionTranslations: normalizeCategoryTranslations(descriptionTranslations) ?? Prisma.JsonNull,
        }),
        ...(parentId !== undefined && {
          parent: normalizedParentId
            ? { connect: { id: normalizedParentId } }
            : { disconnect: true },
        }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: true,
      },
    })

    try {
      await syncCategoryToSanity(category)
    } catch (syncError) {
      console.error('Failed to sync updated category to Sanity:', syncError)
    }

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

      try {
        await deleteCategoryFromSanity(id)
      } catch (syncError) {
        console.error('Failed to delete category in Sanity:', syncError)
      }

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
