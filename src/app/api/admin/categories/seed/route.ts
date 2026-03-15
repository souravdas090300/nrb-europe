import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withSecurity } from '@/lib/security'
import { categories as defaultCategories } from '@/lib/constants'
import { CATEGORY_TRANSLATION_LOCALES } from '@/lib/category-localization'
import bn from '@/lib/dictionaries/bn'
import de from '@/lib/dictionaries/de'
import es from '@/lib/dictionaries/es'
import fr from '@/lib/dictionaries/fr'
import { revalidateCategoryViews } from '@/lib/revalidate-categories'
import { syncCategoryToSanity } from '@/lib/sanity/category-sync'

const CATEGORY_DICTIONARIES = {
  bn: bn.categories,
  es: es.categories,
  de: de.categories,
  fr: fr.categories,
} as const

function buildSeedTranslations(slug: string) {
  const entries = CATEGORY_TRANSLATION_LOCALES
    .map((locale) => {
      const value = CATEGORY_DICTIONARIES[locale]?.[slug as keyof typeof CATEGORY_DICTIONARIES[typeof locale]]
      return [locale, value] as const
    })
    .filter((entry): entry is readonly [typeof CATEGORY_TRANSLATION_LOCALES[number], string] => Boolean(entry[1]))

  return entries.length > 0 ? Object.fromEntries(entries) : null
}

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
      const createdCategory = await prisma.category.create({
        data: {
          name: cat.name,
          nameTranslations: buildSeedTranslations(cat.slug) ?? Prisma.JsonNull,
          slug: cat.slug,
          color: cat.color,
          sortOrder: i,
          isActive: true,
        },
      })

      try {
        await syncCategoryToSanity(createdCategory)
      } catch (syncError) {
        console.error('Failed to sync seeded category to Sanity:', syncError)
      }

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
