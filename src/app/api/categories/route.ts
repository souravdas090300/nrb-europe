import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        description: true,
        parentId: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    const byId = new Map(
      categories.map((category) => [
        category.id,
        {
          ...category,
          children: [] as Array<{
            id: string
            name: string
            slug: string
            color: string
            description: string | null
            parentId: string | null
            sortOrder: number
            isActive: boolean
            createdAt: Date
            updatedAt: Date
          }>,
        },
      ])
    )

    const rootCategories: Array<ReturnType<typeof byId.get> extends infer T ? Exclude<T, undefined> : never> = []

    for (const category of Array.from(byId.values())) {
      if (category.parentId && byId.has(category.parentId)) {
        byId.get(category.parentId)!.children.push(category)
        continue
      }
      rootCategories.push(category)
    }

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error fetching public categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
