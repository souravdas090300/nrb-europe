import Link from 'next/link'
import Image from 'next/image'

interface ArticleCardProps {
  title: string
  description: string
  imageUrl: string
  slug: string
  author?: string
  date?: string
}

export default function ArticleCard({
  title,
  description,
  imageUrl,
  slug,
  author,
  date
}: ArticleCardProps) {
  return (
    <Link href={`/articles/${slug}`}>
      <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2 text-gray-900 hover:text-blue-600">
            {title}
          </h2>
          
          <p className="text-gray-600 mb-4 line-clamp-3">
            {description}
          </p>
          
          {(author || date) && (
            <div className="flex items-center text-sm text-gray-500">
              {author && <span className="mr-4">{author}</span>}
              {date && <span>{date}</span>}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
