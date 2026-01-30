import React from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';

const NavBar = async ({ lang }: { lang: Locale }) => {
  const dictionary = await getDictionary(lang);
  
  const navigationItems = [
    { key: 'home', path: '' },
    { key: 'europe', path: 'category/europe' },
    { key: 'immigration', path: 'category/immigration' },
    { key: 'politics', path: 'category/politics' },
    { key: 'jobs', path: 'category/jobs' },
    { key: 'business', path: 'category/business' },
    { key: 'lifestyle', path: 'category/lifestyle' },
    { key: 'videos', path: 'videos' },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navigationItems.map((item) => (
        <Link
          key={item.key}
          href={`/${lang}/${item.path}`}
          className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          {dictionary.nav[item.key as keyof typeof dictionary.nav]}
        </Link>
      ))}
    </nav>
  );
};

export default NavBar;