export interface Article {
  title: string
  excerpt: string
  category: string
  date: string
  slug: string
  author?: string
  imageUrl?: string
}

export interface ArticleCardProps {
  title: string
  description: string
  imageUrl: string
  slug: string
  author?: string
  date?: string
}

export interface Category {
  name: string
  path: string
  description?: string
}
