import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, User } from 'lucide-react';

const HeroSection: React.FC = () => {
  const mainStory = {
    title: 'Historic Agreement: EU Unanimously Approves New Blue Card Directive for Highly Skilled Workers',
    excerpt: 'In a landmark decision, the European Union has approved a comprehensive reform of the Blue Card system, making it easier for professionals from countries like Bangladesh to work and live in Europe. The new directive promises faster processing, lower salary thresholds, and enhanced family reunification rights.',
    category: 'EXCLUSIVE',
    author: 'Sarah Johnson',
    readTime: '6 min read',
    date: 'March 18, 2024',
    image: 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?auto=format&fit=crop&w=1200&h=700',
    hasVideo: true,
    slug: 'eu-blue-card-reform-2024',
  };

  const sideStories = [
    {
      title: 'Germany to Open 50,000 New IT Positions for International Talent',
      category: 'TECH',
      slug: 'germany-it-positions-2024',
    },
    {
      title: 'Bangladeshi Students Get 40% Increase in European University Admissions',
      category: 'EDUCATION',
      slug: 'bangladeshi-students-europe-2024',
    },
    {
      title: 'NRB Entrepreneurs Secure €25M in EU Startup Funding',
      category: 'BUSINESS',
      slug: 'nrb-entrepreneurs-funding-2024',
    },
  ];

  return (
    <section className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Hero Story */}
          <div className="lg:col-span-2">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              {/* Image/Video */}
              <div className="relative h-[500px]">
                <Image
                  src={mainStory.image}
                  alt={mainStory.title}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Video Play Button */}
                {mainStory.hasVideo && (
                  <div className="absolute top-4 right-4">
                    <button className="flex items-center bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition">
                      <Play className="w-5 h-5 mr-2 fill-white" />
                      Watch Report
                    </button>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded">
                    {mainStory.category}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    {mainStory.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-6 text-gray-200 line-clamp-3">
                    {mainStory.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span className="font-medium">{mainStory.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{mainStory.readTime}</span>
                    </div>
                    <span>•</span>
                    <span>{mainStory.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Stories */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              Latest Updates
            </h2>
            
            {sideStories.map((story, index) => (
              <div key={story.slug} className="border-b pb-6 last:border-0">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <span className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 font-bold rounded-full">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded mb-2">
                      {story.category}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900 hover:text-red-600 transition">
                      <Link href={`/article/${story.slug}`}>
                        {story.title}
                      </Link>
                    </h3>
                  </div>
                </div>
              </div>
            ))}

            {/* Live Updates Box */}
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2" />
                <span className="font-bold text-red-600">LIVE UPDATES</span>
              </div>
              <p className="text-sm text-gray-700">
                Follow our live coverage of the EU Blue Card announcement
              </p>
              <Link 
                href="/live" 
                className="inline-block mt-2 text-red-600 font-semibold text-sm hover:text-red-800"
              >
                Follow Live →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
