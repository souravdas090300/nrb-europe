'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Eye } from 'lucide-react';

interface TrendingArticle {
  _id: string;
  title: string;
  slug: { current: string };
  views?: number;
}

interface TrendingStoriesProps {
  articles: TrendingArticle[];
  lang?: string;
  dictionary?: any;
}

const TrendingStories: React.FC<TrendingStoriesProps> = ({ articles, lang = 'en', dictionary }) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  const displayArticles = articles;
  const displayList = displayArticles.slice(0, 5);

  return (
    <section className="py-14 bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <TrendingUp className="w-8 h-8 text-red-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{dictionary?.home?.trendingNow || 'Trending Now'}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayList.map((article, index) => (
            <Link
              key={article._id}
              href={`/${lang}/news/${article.slug.current}`}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition group"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl font-bold text-red-600">{index + 1}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 transition line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                  {article.views && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>{article.views.toLocaleString()} {dictionary?.home?.views || 'views'}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingStories;
