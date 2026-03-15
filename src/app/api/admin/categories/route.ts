import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withSecurity, safeParseBody } from '@/lib/security'
import { sanitizeSlug } from '@/lib/security'
import { revalidateCategoryViews } from '@/lib/revalidate-categories'
import { syncCategoryToSanity } from '@/lib/sanity/category-sync'

export const dynamic = 'force-dynamic'

// GET all categories for admin (no cache)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            parent: { select: { id: true, name: true, slug: true } },
            children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          },
        },
        parent: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST — create a new category (admin only, secured)
export const POST = withSecurity(
  async (request: NextRequest) => {
    const { data, error } = await safeParseBody<{
      name: string; slug: string; color?: string; description?: string; parentId?: string; sortOrder?: number
    }>(request)

    if (error || !data) {
      return NextResponse.json({ error: error || 'Invalid body' }, { status: 400 })
    }

    const { name, slug, color, description, parentId, sortOrder } = data

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const safeSlug = sanitizeSlug(slug)
    const normalizedParentId = typeof parentId === 'string' ? parentId.trim() : ''

    let parentCategory: { id: string; slug: string } | null = null
    if (normalizedParentId) {
      parentCategory = await prisma.category.findFirst({
        where: { id: normalizedParentId, isActive: true },
        select: { id: true, slug: true },
      })

      if (!parentCategory) {
        return NextResponse.json({ error: 'Selected parent category was not found.' }, { status: 400 })
      }
    }

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({ where: { slug: safeSlug } })
    if (existing) {
      return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: safeSlug,
        color: color || 'bg-gray-100 text-gray-800',
        description: description || null,
        parentId: parentCategory?.id || null,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: true,
      },
    })

    try {
      await syncCategoryToSanity(category)
    } catch (syncError) {
      console.error('Failed to sync created category to Sanity:', syncError)
    }

    revalidateCategoryViews([category.slug, parentCategory?.slug || ''])

    return NextResponse.json(category, { status: 201 })
  },
  { rateLimit: 'admin', adminOnly: true }
)
