import React from 'react';
import NavBar from './NavBar';
import LanguageSwitcher from './LanguageSwitcher';
import SearchBar from './SearchBar';
import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/lib/i18n-config';

const Header = ({ lang }: { lang: Locale }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-2">
            <Link href={`/${lang}`} className="flex items-center gap-2">
              {/* Logo Image */}
              <Image 
                src="/logo.png" 
                alt="NRB Europe Logo" 
                width={50} 
                height={50}
                className="object-contain"
                priority
              />
              {/* Site Name */}
              <span className="text-2xl font-bold text-red-700">
                NRB Europe
              </span>
            </Link>
            <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded">
              LIVE
            </span>
          </div>
          
          <div className="w-full md:w-auto md:max-w-md flex-1 md:flex-initial">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <button className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded">
              Subscribe
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t pt-2 pb-2">
          <NavBar lang={lang} />
        </div>
      </div>
    </header>
  );
};

export default Header;