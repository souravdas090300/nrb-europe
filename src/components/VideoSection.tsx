'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, Calendar } from 'lucide-react';

const videos = [
  {
    id: 1,
    title: 'Inside Look: A Day in the Life of NRB Software Engineers in Berlin',
    duration: '12:45',
    views: '245K',
    date: 'Mar 15, 2024',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&h=225',
    category: 'LIFESTYLE',
  },
  {
    id: 2,
    title: 'Expert Interview: EU Immigration Lawyer Answers Top 20 Questions',
    duration: '25:30',
    views: '189K',
    date: 'Mar 14, 2024',
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&h=225',
    category: 'IMMIGRATION',
  },
  {
    id: 3,
    title: 'Virtual Tour: Best European Cities for Bangladeshi Families',
    duration: '18:15',
    views: '156K',
    date: 'Mar 13, 2024',
    thumbnail: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=400&h=225',
    category: 'TRAVEL',
  },
  {
    id: 4,
    title: 'Success Stories: NRB Entrepreneurs Who Made It Big in Europe',
    duration: '22:10',
    views: '198K',
    date: 'Mar 12, 2024',
    thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=400&h=225',
    category: 'BUSINESS',
  },
];

const VideoSection: React.FC = () => {
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);

  return (
    <section className="py-12 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">NRB Europe Video</h2>
            <p className="text-gray-300 mt-2">
              Watch our exclusive reports, interviews, and documentaries
            </p>
          </div>
          <Link 
            href="/videos" 
            className="text-red-400 font-semibold hover:text-red-300 flex items-center"
          >
            Watch All Videos
            <Play className="w-4 h-4 ml-2 fill-current" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div 
              key={video.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredVideo(video.id)}
              onMouseLeave={() => setHoveredVideo(null)}
            >
              <div className="relative rounded-lg overflow-hidden bg-gray-900">
                {/* Thumbnail */}
                <div className="relative h-48">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className={`transform transition-all duration-300 ${
                      hoveredVideo === video.id ? 'scale-110' : 'scale-100'
                    }`}>
                      <div className="bg-red-600 rounded-full p-4">
                        <Play className="w-6 h-6 fill-white" />
                      </div>
                    </div>
                  </div>

                  {/* Video Duration */}
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded">
                    {video.duration}
                  </div>

                  {/* Category */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {video.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-3 group-hover:text-red-400 transition">
                    {video.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {video.duration}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {video.date}
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm">
                    <span className="text-gray-300">{video.views} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live TV Banner */}
        <div className="mt-12 bg-gradient-to-r from-red-900 to-black rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-3" />
                <span className="font-bold text-xl">LIVE NOW</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">
                NRB Europe Live: Daily News Bulletin
              </h3>
              <p className="text-gray-300">
                Join us for our 7 PM CET daily news broadcast covering European affairs relevant to NRBs
              </p>
            </div>
            <button className="mt-4 md:mt-0 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-lg flex items-center transition">
              <Play className="w-5 h-5 mr-2 fill-white" />
              Watch Live
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
