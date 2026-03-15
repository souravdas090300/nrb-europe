import { createClient } from '@sanity/client'

const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const sanityToken = process.env.SANITY_API_TOKEN
const sanityApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-01-29'

function getSanityWriteClient() {
  if (!sanityProjectId || !sanityToken) {
    return null
  }

  return createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    token: sanityToken,
    useCdn: false,
  })
}

function toSanityColor(color: string | null | undefined): string {
  const value = (color || '').toLowerCase()

  if (value.includes('red')) return 'red'
  if (value.includes('blue')) return 'blue'
  if (value.includes('green') || value.includes('emerald') || value.includes('teal')) return 'green'
  if (value.includes('purple') || value.includes('indigo')) return 'purple'
  if (value.includes('orange') || value.includes('yellow')) return 'orange'
  return 'gray'
}

export function getSanityCategoryDocId(categoryId: string): string {
  return `db-category-${categoryId}`
}

type SyncCategoryInput = {
  id: string
  name: string
  slug: string
  description?: string | null
  color?: string | null
  parentId?: string | null
  isActive?: boolean
  sortOrder?: number
}

export async function syncCategoryToSanity(category: SyncCategoryInput) {
  const sanityClient = getSanityWriteClient()
  if (!sanityClient) return

  const docId = getSanityCategoryDocId(category.id)
  const parentRef = category.parentId
    ? {
        _type: 'reference' as const,
        _ref: getSanityCategoryDocId(category.parentId),
        _weak: true,
      }
    : undefined

  await sanityClient.createOrReplace({
    _id: docId,
    _type: 'category',
    title: category.name,
    slug: { _type: 'slug', current: category.slug },
    description: category.description || '',
    color: toSanityColor(category.color),
    parent: parentRef,
    isActive: category.isActive ?? true,
    sortOrder: category.sortOrder ?? 0,
    source: 'prisma-admin',
  })
}

export async function deleteCategoryFromSanity(categoryId: string) {
  const sanityClient = getSanityWriteClient()
  if (!sanityClient) return

  const docId = getSanityCategoryDocId(categoryId)

  try {
    await sanityClient.delete(docId)
  } catch {
    // Ignore missing documents
  }
}
