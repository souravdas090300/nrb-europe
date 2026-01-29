import React from 'react';
import NavBar from './NavBar';
import LanguageSwitcher from './LanguageSwitcher';
import Link from 'next/link';
import { Locale } from '@/lib/i18n-config';

const Header = ({ lang }: { lang: Locale }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={`/${lang}`} className="text-2xl font-bold text-red-700">
              NRB Europe
            </Link>
            <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
              News for NRBs
            </span>
          </div>

          {/* Navigation */}
          <NavBar lang={lang} />

          {/* Breaking News Ticker (Placeholder) */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="bg-red-50 text-red-700 text-sm font-semibold px-3 py-1 rounded">
              LIVE
            </div>
            <LanguageSwitcher />
            <button className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;