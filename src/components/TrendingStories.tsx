'use client';

import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import Link from 'next/link';
import { TrendingUp, Eye, MessageSquare } from 'lucide-react';

const trendingStories = {
  today: [
    {
      id: 1,
      rank: 1,
      title: 'Bangladeshi Tech Workers See 45% Salary Increase in EU Market',
      views: '125K',
      comments: '842',
      category: 'JOBS',
      trend: 'up',
    },
    {
      id: 2,
      rank: 2,
      title: 'New EU Study: NRB Entrepreneurs Create 15,000 Jobs Annually',
      views: '98K',
      comments: '521',
      category: 'BUSINESS',
      trend: 'up',
    },
    {
      id: 3,
      rank: 3,
      title: 'Scandinavian Countries Top "Happiness Index" for NRBs',
      views: '87K',
      comments: '423',
      category: 'LIFESTYLE',
      trend: 'new',
    },
  ],
  week: [
    {
      id: 4,
      rank: 1,
      title: 'Complete Guide: How to Apply for EU Blue Card 2024',
      views: '320K',
      comments: '1.2K',
      category: 'IMMIGRATION',
      trend: 'up',
    },
    {
      id: 5,
      rank: 2,
      title: 'NRB Investment in European Real Estate Hits Record High',
      views: '280K',
      comments: '956',
      category: 'BUSINESS',
      trend: 'steady',
    },
    {
      id: 6,
      rank: 3,
      title: 'Cultural Integration Challenges and Success Stories',
      views: '245K',
      comments: '1.8K',
      category: 'LIFESTYLE',
      trend: 'up',
    },
  ],
  month: [
    {
      id: 7,
      rank: 1,
      title: 'EU Digital Nomad Visa: Everything You Need to Know',
      views: '890K',
      comments: '3.5K',
      category: 'IMMIGRATION',
      trend: 'up',
    },
    {
      id: 8,
      rank: 2,
      title: 'Best European Cities for Bangladeshi Families 2024',
      views: '760K',
      comments: '2.8K',
      category: 'LIFESTYLE',
      trend: 'steady',
    },
    {
      id: 9,
      rank: 3,
      title: 'How NRBs Can Access European Healthcare Systems',
      views: '680K',
      comments: '2.1K',
      category: 'LIFESTYLE',
      trend: 'up',
    },
  ],
};

const TrendingStories: React.FC = () => {
  const [activeTab, setActiveTab] = useState('today');

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center mb-8">
          <TrendingUp className="w-6 h-6 text-red-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900">
            Trending Stories
          </h2>
        </div>

        <Tabs.Root 
          defaultValue="today" 
          className="space-y-6"
          onValueChange={setActiveTab}
        >
          <Tabs.List className="flex space-x-4 border-b">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
            ].map((tab) => (
              <Tabs.Trigger
                key={tab.id}
                value={tab.id}
                className={`px-6 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {Object.entries(trendingStories).map(([period, stories]) => (
            <Tabs.Content key={period} value={period} className="space-y-6">
              {stories.map((story) => (
                <div 
                  key={story.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start">
                    {/* Rank Number */}
                    <div className="flex-shrink-0 mr-6">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                        <span className="text-2xl font-bold text-gray-900">
                          {story.rank}
                        </span>
                      </div>
                      {story.trend === 'up' && (
                        <div className="mt-2 flex items-center justify-center text-green-600 text-xs font-bold">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          TRENDING
                        </div>
                      )}
                      {story.trend === 'new' && (
                        <div className="mt-2 flex items-center justify-center bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                          NEW
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded">
                          {story.category}
                        </span>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {story.views}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {story.comments}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-red-600 transition">
                        <Link href="#">
                          {story.title}
                        </Link>
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <Link 
                          href="#" 
                          className="text-red-600 font-semibold hover:text-red-800"
                        >
                          Read Full Story →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </section>
  );
};

export default TrendingStories;
