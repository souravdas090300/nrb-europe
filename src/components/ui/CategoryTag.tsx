import Link from 'next/link'

interface CategoryTagProps {
  category: string
  slug: string
  lang?: string
}

export default function CategoryTag({ category, slug, lang = 'en' }: CategoryTagProps) {
  return (
    <Link
      href={`/${lang}/category/${slug}`}
      className="nrb-badge-category hover:bg-nrb-red hover:text-white transition-colors"
    >
      {category}
    </Link>
  )
}
