import React from 'react';
import Link from 'next/link';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/lib/i18n-config';

const Footer = async ({ lang }: { lang: Locale }) => {
  const dictionary = await getDictionary(lang);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-red-500">NRB Europe</h3>
            <p className="mt-2 text-gray-400">
              {dictionary.footer.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{dictionary.footer.quickLinks}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href={`/${lang}/category/europe`} className="hover:text-white">Europe News</Link></li>
              <li><Link href={`/${lang}/category/immigration`} className="hover:text-white">Immigration</Link></li>
              <li><Link href={`/${lang}/category/jobs`} className="hover:text-white">Jobs</Link></li>
              <li><Link href={`/${lang}/category/business`} className="hover:text-white">Business</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href={`/${lang}/privacy`} className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href={`/${lang}/terms`} className="hover:text-white">Terms of Service</Link></li>
              <li><Link href={`/${lang}/about`} className="hover:text-white">About Us</Link></li>
              <li><Link href={`/${lang}/contact`} className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
            <p className="text-gray-400 mb-3">Get daily news in your inbox.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded-l text-gray-900"
              />
              <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-r">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© {currentYear} NRB Europe. {dictionary.footer.rights}</p>
          <p className="mt-1">Independent, professional journalism for the NRB community.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;