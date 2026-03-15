import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { urlFor } from '@/lib/sanity/client';

interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  mainImage?: any;
  publishedAt: string;
  category?: string;
  categorySlug?: string;
  categoryTranslations?: Record<string, string>;
  author?: string;
}

interface LatestStoriesProps {
  articles: Article[];
  lang?: string;
  dictionary?: any;
}

const LatestStories: React.FC<LatestStoriesProps> = ({ articles, lang = 'en', dictionary }) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  const displayArticles = articles;
  const locale =
    lang === 'bn' ? 'bn-BD' :
    lang === 'es' ? 'es-ES' :
    lang === 'de' ? 'de-DE' :
    lang === 'fr' ? 'fr-FR' : 'en-US';

  const getCategoryLabel = (article: Article) => {
    return (
      article.categoryTranslations?.[lang] ||
      (article.categorySlug ? dictionary?.categories?.[article.categorySlug] : undefined) ||
      article.category ||
      ''
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayArticles.map((article) => (
        <article key={article._id} className="group">
          <Link href={`/${lang}/news/${article.slug.current}`}>
            <div className="relative overflow-hidden rounded-lg mb-3">
              <div className="relative h-48">
                {article.mainImage ? (
                  <Image
                    src={urlFor(article.mainImage).width(400).height(240).url()}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {article.category && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
                      {getCategoryLabel(article)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-1 py-3">
              <div className="flex items-center text-xs text-gray-500 mb-2">
                {article.author && (
                  <span className="flex items-center mr-3">
                    <User className="w-3.5 h-3.5 mr-1" />
                    {article.author}
                  </span>
                )}
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {new Date(article.publishedAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 transition line-clamp-2">
                {article.title}
              </h3>
              
              {article.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
              )}
              
              <div className="flex items-center justify-end">
                <span className="text-red-600 font-semibold hover:text-red-800 flex items-center">
                  {dictionary?.home?.readStory || 'Read Story'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
};

export default LatestStories;
