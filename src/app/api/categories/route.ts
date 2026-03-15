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
      categories.map((c) => [c.id, { ...c, children: [] }])
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
