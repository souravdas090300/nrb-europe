import React from 'react';
import Link from 'next/link';
import { 
  Globe, 
  Briefcase, 
  GraduationCap, 
  Home, 
  DollarSign, 
  Heart,
  TrendingUp 
} from 'lucide-react';

const categories = [
  {
    id: 'europe',
    title: 'Europe News',
    icon: Globe,
    color: 'bg-blue-100 text-blue-600',
    articles: [
      'France Election Results 2024',
      'Germany Economic Outlook',
      'UK Immigration Policy Changes',
    ],
  },
  {
    id: 'immigration',
    title: 'Immigration',
    icon: Home,
    color: 'bg-green-100 text-green-600',
    articles: [
      'New Visa Processing Times',
      'Family Reunion Updates',
      'Residency Card Renewal',
    ],
  },
  {
    id: 'jobs',
    title: 'Jobs & Careers',
    icon: Briefcase,
    color: 'bg-purple-100 text-purple-600',
    articles: [
      'IT Jobs in Berlin',
      'Healthcare Opportunities',
      'Remote Work in Europe',
    ],
  },
  {
    id: 'education',
    title: 'Education',
    icon: GraduationCap,
    color: 'bg-amber-100 text-amber-600',
    articles: [
      'Scholarship Deadlines',
      'University Rankings 2024',
      'Student Visa Updates',
    ],
  },
  {
    id: 'business',
    title: 'Business',
    icon: DollarSign,
    color: 'bg-emerald-100 text-emerald-600',
    articles: [
      'Startup Funding News',
      'Import-Export Regulations',
      'Tax Changes for NRBs',
    ],
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    icon: Heart,
    color: 'bg-pink-100 text-pink-600',
    articles: [
      'Cultural Events Calendar',
      'Healthcare Guide',
      'Housing Tips',
    ],
  },
];

const CategoryGrid: React.FC = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Explore by Category
          </h2>
          <Link 
            href="/categories" 
            className="text-red-600 font-semibold hover:text-red-800"
          >
            View All Categories →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            
            return (
              <div 
                key={category.id}
                className="border rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 hover:border-red-200"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${category.color} mr-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    <Link href={`/category/${category.id}`} className="hover:text-red-600">
                      {category.title}
                    </Link>
                  </h3>
                </div>

                <ul className="space-y-3 mb-6">
                  {category.articles.map((article, index) => (
                    <li key={index}>
                      <Link 
                        href="#" 
                        className="text-gray-700 hover:text-red-600 hover:underline text-sm flex items-start"
                      >
                        <span className="inline-block w-1 h-1 bg-gray-300 rounded-full mt-2 mr-3 flex-shrink-0" />
                        {article}
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/category/${category.id}`}
                  className="text-red-600 font-semibold text-sm hover:text-red-800 flex items-center"
                >
                  More in {category.title}
                  <TrendingUp className="w-4 h-4 ml-2" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
