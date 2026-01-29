import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity/client';

export default function ArticleCard({ article, lang = 'en' }: { article: any; lang?: string }) {
  const imageUrl = article.mainImage || article.featuredImage
    ? urlFor(article.mainImage || article.featuredImage).width(400).height(250).url()
    : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/${lang}/news/${article.slug.current}`}>
        <div className="relative h-48 w-full bg-gray-200">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          {article.category && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
              {article.category}
            </span>
          )}
          <span className="ml-3">
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
          {article.isBreaking && (
            <span className="ml-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
              BREAKING
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition">
          <Link href={`/${lang}/news/${article.slug.current}`}>
            {article.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
        
        <div className="mt-4 text-sm text-gray-600">
          By {article.author}
        </div>
      </div>
    </article>
  );
}