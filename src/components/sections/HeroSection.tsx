/**
 * @file HeroSection.tsx — Homepage hero with featured articles
 *
 * Displays the top featured article as a large card with image, plus
 * a sidebar of secondary featured articles. Responsive grid layout.
 * Images are loaded from Sanity CDN via `urlFor()`.
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, User } from 'lucide-react';
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
  isLive?: boolean;
}

interface HeroSectionProps {
  articles: Article[];
  lang?: string;
  dictionary?: any;
}

const HeroSection: React.FC<HeroSectionProps> = ({ articles, lang = 'en', dictionary }) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  const displayArticles = articles;
  const [mainStory, ...sideStories] = displayArticles;
  const locale =
    lang === 'bn' ? 'bn-BD' :
    lang === 'es' ? 'es-ES' :
    lang === 'de' ? 'de-DE' :
    lang === 'fr' ? 'fr-FR' : 'en-US';

  const getCategoryLabel = (story: Article) => {
    return (
      story.categoryTranslations?.[lang] ||
      (story.categorySlug ? dictionary?.categories?.[story.categorySlug] : undefined) ||
      story.category ||
      ''
    );
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Hero Story */}
          <div className="lg:col-span-2">
            <Link href={`/${lang}/news/${mainStory.slug.current}`}>
              <div className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer hover:opacity-95 transition">
                {/* Image/Video */}
                <div className="relative h-[280px] md:h-[360px]">
                  {mainStory.mainImage ? (
                    <Image
                      src={urlFor(mainStory.mainImage).width(800).height(450).url()}
                      alt={mainStory.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 66vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-300" />
                  )}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Live Badge */}
                {mainStory.isLive && (
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full mr-2" />
                      {dictionary?.home?.liveNow || 'LIVE'}
                    </span>
                  </div>
                )}
                
                {/* Category Badge */}
                {mainStory.category && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded">
                      {getCategoryLabel(mainStory)}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                    {mainStory.title}
                  </h1>
                  {mainStory.excerpt && (
                    <p className="text-base md:text-lg mb-4 text-gray-200 line-clamp-2">
                      {mainStory.excerpt}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    {mainStory.author && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span className="font-medium">{mainStory.author}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{new Date(mainStory.publishedAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </Link>
          </div>

          {/* Side Stories */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">
              {dictionary?.home?.latestUpdates || 'Latest Updates'}
            </h2>
            
            {sideStories.map((story, index) => (
              <div key={story._id} className="border-b pb-6 last:border-0">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <span className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 font-bold rounded-full">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold px-2 py-1 rounded mb-2">
                      {getCategoryLabel(story)}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white hover:text-red-600 transition">
                      <Link href={`/${lang}/news/${story.slug.current}`}>
                        {story.title}
                      </Link>
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
