'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Eye } from 'lucide-react';
import { urlFor } from '@/lib/sanity/client';

interface VideoArticle {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: any;
  publishedAt: string;
}

interface VideoSectionProps {
  videos: VideoArticle[];
  lang?: string;
  dictionary?: any;
}

const VideoSection: React.FC<VideoSectionProps> = ({ videos, lang = 'en', dictionary }) => {
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  if (!videos || videos.length === 0) {
    return null;
  }

  const displayVideos = videos;
  const displayList = displayVideos.slice(0, 4);

  return (
    <section className="py-14 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">{dictionary?.home?.nrbEuropeVideo || 'NRB Europe Video'}</h2>
            <p className="text-gray-300 mt-2">
              {dictionary?.home?.videoSubtitle || 'Watch our exclusive reports, interviews, and documentaries'}
            </p>
          </div>
          <Link 
            href={`/${lang}/news`} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition hidden md:block"
          >
            {dictionary?.home?.viewAllVideos || 'View All Videos'}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayList.map((video) => (
            <Link
              key={video._id}
              href={`/${lang}/news/${video.slug.current}`}
              className="group relative rounded-lg overflow-hidden"
              onMouseEnter={() => setHoveredVideo(video._id)}
              onMouseLeave={() => setHoveredVideo(null)}
            >
              <div className="relative h-40">
                {video.mainImage ? (
                  <Image
                    src={urlFor(video.mainImage).width(360).height(200).url()}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-700" />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-full bg-red-600 flex items-center justify-center transition-transform ${
                    hoveredVideo === video._id ? 'scale-110' : 'scale-100'
                  }`}>
                    <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="font-bold text-white group-hover:text-red-500 transition line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(video.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
