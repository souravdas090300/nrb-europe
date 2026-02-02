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
      className="cnn-badge-category hover:bg-cnn-red hover:text-white transition-colors"
    >
      {category}
    </Link>
  )
}
