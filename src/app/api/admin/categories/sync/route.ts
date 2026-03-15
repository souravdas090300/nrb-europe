import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withSecurity } from '@/lib/security'
import { revalidateCategoryViews } from '@/lib/revalidate-categories'
import { syncCategoryToSanity } from '@/lib/sanity/category-sync'

// POST — sync all DB categories to Sanity (admin only)
export const POST = withSecurity(
  async (_request: NextRequest) => {
    const categories = await prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        parentId: true,
        isActive: true,
        sortOrder: true,
      },
    })

    let synced = 0
    let failed = 0

    for (const category of categories) {
      try {
        await syncCategoryToSanity(category)
        synced++
      } catch (error) {
        failed++
        console.error(`Failed to sync category ${category.slug} to Sanity:`, error)
      }
    }

    revalidateCategoryViews(categories.map((category) => category.slug))

    return NextResponse.json({
      success: failed === 0,
      synced,
      failed,
      total: categories.length,
      message: `Synced ${synced}/${categories.length} categories to Sanity`,
    })
  },
  { rateLimit: 'strict', adminOnly: true }
)
