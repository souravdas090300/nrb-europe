import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity/client';

interface ArticleCardProps {
  title: string;
  description: string;
  imageUrl: string | any;
  slug: string;
  author?: string;
  date?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  description,
  imageUrl,
  slug,
  author,
  date,
}) => {
  // Handle both string URLs and Sanity image objects
  const imageSrc = typeof imageUrl === 'string' 
    ? imageUrl 
    : imageUrl 
      ? urlFor(imageUrl).width(800).height(500).url() 
      : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-200">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        {(author || date) && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            {author && <span>{author}</span>}
            {author && date && <span className="mx-2">•</span>}
            {date && <span>{date}</span>}
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          <Link href={`/article/${slug}`} className="hover:text-red-700">
            {title}
          </Link>
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
        <Link
          href={`/article/${slug}`}
          className="inline-flex items-center text-red-600 font-semibold hover:text-red-800"
        >
          Read Full Story →
        </Link>
      </div>
    </article>
  );
};

export default ArticleCard;