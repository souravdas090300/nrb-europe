import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Locale } from '@/lib/i18n-config'
import { getLocalizedCategoryValue, getLocalizedOptionalCategoryValue } from '@/lib/category-localization'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const locale = (request.nextUrl.searchParams.get('lang') || 'en') as Locale
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        slug: true,
        color: true,
        description: true,
        descriptionTranslations: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    type CatNode = {
      id: string
      name: string
      slug: string
      color: string
      description: string | null
      parentId: string | null
      sortOrder: number
      isActive: boolean
      children: CatNode[]
    }

    const byId = new Map<string, CatNode>(
      categories.map((c) => [
        c.id,
        {
          id: c.id,
          name: getLocalizedCategoryValue(c.name, c.nameTranslations, locale),
          slug: c.slug,
          color: c.color,
          description: getLocalizedOptionalCategoryValue(c.description, c.descriptionTranslations, locale),
          parentId: c.parentId,
          sortOrder: c.sortOrder,
          isActive: c.isActive,
          children: [],
        },
      ])
    )

    const rootCategories: CatNode[] = []
    for (const node of Array.from(byId.values())) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node)
      } else {
        rootCategories.push(node)
      }
    }

    return NextResponse.json(rootCategories, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error fetching public categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
