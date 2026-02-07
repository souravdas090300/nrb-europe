'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

const breakingNewsItems = [
  {
    id: 1,
    title: 'EU Council approves new digital nomad visa for non-EU professionals',
    category: 'BREAKING',
    time: '2 min ago',
  },
  {
    id: 2,
    title: 'Germany announces 30% increase in work visa quotas for 2024',
    category: 'JUST IN',
    time: '15 min ago',
  },
  {
    id: 3,
    title: 'UK to simplify family visa process for Bangladeshi nationals',
    category: 'EXCLUSIVE',
    time: '1 hour ago',
  },
  {
    id: 4,
    title: 'France introduces fast-track residency for tech professionals',
    category: 'LATEST',
    time: '2 hours ago',
  },
];

const BreakingNewsTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === breakingNewsItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const currentNews = breakingNewsItems[currentIndex];

  return (
    <div className="bg-red-600 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center px-4 py-2">
          {/* Breaking News Label */}
          <div className="flex items-center mr-4">
            <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
            <span className="font-bold text-sm uppercase tracking-wider">
              Breaking News
            </span>
          </div>
          
          {/* Ticker Content */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center">
              <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded mr-3">
                {currentNews.category}
              </span>
              <span className="font-semibold text-sm md:text-base truncate">
                {currentNews.title}
              </span>
              <div className="hidden md:flex items-center ml-4 text-xs opacity-80">
                <Clock className="w-3 h-3 mr-1" />
                {currentNews.time}
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="hidden md:flex space-x-1 ml-4">
            {breakingNewsItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to news item ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
