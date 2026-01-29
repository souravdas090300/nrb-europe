import React from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/i18n-config';

const categories = [
  { name: 'Home', path: '' },
  { name: 'Europe', path: 'category/europe' },
  { name: 'Immigration', path: 'category/immigration' },
  { name: 'Politics', path: 'category/politics' },
  { name: 'Jobs', path: 'category/jobs' },
  { name: 'Business', path: 'category/business' },
  { name: 'Lifestyle', path: 'category/lifestyle' },
  { name: 'Videos', path: 'videos' },
];

const NavBar = ({ lang }: { lang: Locale }) => {
  return (
    <nav className="hidden md:flex items-center space-x-1">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/${lang}/${category.path}`}
          className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
};

export default NavBar;