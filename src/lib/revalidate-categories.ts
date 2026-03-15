import { revalidatePath } from 'next/cache'
import { i18n } from '@/lib/i18n-config'

/**
 * Revalidate public category surfaces so admin changes appear immediately.
 */
export function revalidateCategoryViews(slugs: string[] = []) {
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)))

  revalidatePath('/')
  revalidatePath('/categories')

  for (const locale of i18n.locales) {
    revalidatePath(`/${locale}`)
    revalidatePath(`/${locale}/categories`)

    for (const slug of uniqueSlugs) {
      revalidatePath(`/${locale}/category/${slug}`)
    }
  }
}
