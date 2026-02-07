import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';

const latestStories = [
  {
    id: 1,
    title: 'EU Announces New Fast-Track Visa for Tech Professionals',
    excerpt: 'The European Union has launched a new tech visa program aimed at attracting skilled IT professionals from outside the EU.',
    category: 'IMMIGRATION',
    author: 'David Chen',
    date: 'Mar 18, 2024',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&h=250',
    readTime: '4 min',
  },
  {
    id: 2,
    title: 'Study Shows 30% Growth in NRB-Owned Businesses in Germany',
    excerpt: 'A new report highlights the significant economic contribution of Bangladeshi entrepreneurs in Germany.',
    category: 'BUSINESS',
    author: 'Maria Schmidt',
    date: 'Mar 17, 2024',
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=400&h=250',
    readTime: '5 min',
  },
  {
    id: 3,
    title: 'Guide: How to Navigate European Healthcare Systems',
    excerpt: 'A comprehensive guide for NRBs on accessing and understanding healthcare services across Europe.',
    category: 'LIFESTYLE',
    author: 'Dr. Sarah Ahmed',
    date: 'Mar 16, 2024',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=400&h=250',
    readTime: '8 min',
  },
];

const LatestStories: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {latestStories.map((story) => (
        <article key={story.id} className="group">
          <div className="relative overflow-hidden rounded-xl mb-4">
            <div className="relative h-64">
              <Image
                src={story.image}
                alt={story.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
                  {story.category}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <span className="flex items-center mr-4">
                <User className="w-4 h-4 mr-1" />
                {story.author}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {story.date}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition">
              <Link href="#">
                {story.title}
              </Link>
            </h3>
            
            <p className="text-gray-600 mb-4">
              {story.excerpt}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">
                {story.readTime} read
              </span>
              <Link 
                href="#" 
                className="text-red-600 font-semibold hover:text-red-800 flex items-center"
              >
                Read Story
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default LatestStories;
