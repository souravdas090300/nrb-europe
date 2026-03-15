import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withSecurity } from '@/lib/security'
import { categories as defaultCategories } from '@/lib/constants'
import { revalidateCategoryViews } from '@/lib/revalidate-categories'

// POST — seed categories from constants (admin only, secured, idempotent)
export const POST = withSecurity(
  async (_request: NextRequest) => {
    let created = 0
    let skipped = 0

    for (let i = 0; i < defaultCategories.length; i++) {
      const cat = defaultCategories[i]
      const existing = await prisma.category.findUnique({ where: { slug: cat.slug } })
      if (existing) {
        skipped++
        continue
      }
      await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          color: cat.color,
          sortOrder: i,
          isActive: true,
        },
      })
      created++
    }

    revalidateCategoryViews(defaultCategories.map((category) => category.slug))

    return NextResponse.json({
      message: `Seeded ${created} categories, skipped ${skipped} existing`,
      created,
      skipped,
    })
  },
  { rateLimit: 'strict', adminOnly: true }
)
