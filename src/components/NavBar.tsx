import React from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/i18n-config';
import { NAVIGATION_CATEGORIES } from '@/lib/data/categories';

const NavBar = ({ lang }: { lang: Locale }) => {
  return (
    <nav className="hidden md:flex items-center space-x-1">
      {NAVIGATION_CATEGORIES.map((category) => (
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