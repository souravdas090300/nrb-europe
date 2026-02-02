'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, Search, X, ChevronDown } from 'lucide-react'
import NavBar from './NavBar'
import LanguageSwitcher from './LanguageSwitcher'
import SearchBar from './SearchBar'
import { Locale } from '@/lib/i18n-config'
import { getDictionary } from '@/lib/get-dictionary'
import { navItems } from '@/lib/constants'
import { cn } from '@/lib/utils'

const Header = ({ lang, dictionary }: { lang: Locale, dictionary: any }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Top Bar */}
      <div className="bg-cnn-blue text-white py-2">
        <div className="cnn-container flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <Link href={`/${lang}`} className="font-semibold hover:text-gray-300">
              LIVE TV
            </Link>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">EUROPE EDITION</span>
            <span className="hidden md:inline">•</span>
            <time className="hidden md:inline">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hover:text-gray-300 text-xs font-semibold">
              {dictionary.common.subscribe}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={cn(
        'sticky top-0 z-40 bg-white transition-all duration-300 border-b',
        isScrolled && 'shadow-lg'
      )}>
        <div className="cnn-container">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href={`/${lang}`} className="flex items-center space-x-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-cnn-red rounded-full" />
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                  NRB
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cnn-red">NRB EUROPE</h1>
                <p className="text-xs text-cnn-text-light uppercase tracking-wider hidden sm:block">
                  Breaking News • Independent Reporting
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navItems.slice(1, 6).map((item) => (
                <Link
                  key={item.href}
                  href={`/${lang}${item.href}`}
                  className="cnn-nav-link text-sm font-semibold uppercase tracking-wide"
                >
                  {item.label}
                </Link>
              ))}
              <div className="relative group">
                <button className="cnn-nav-link text-sm font-semibold uppercase tracking-wide flex items-center">
                  More <ChevronDown className="ml-1 w-4 h-4" />
                </button>
                <div className="absolute hidden group-hover:block bg-white shadow-lg min-w-[200px] mt-2 border">
                  {navItems.slice(6).map((item) => (
                    <Link
                      key={item.href}
                      href={`/${lang}${item.href}`}
                      className="block px-4 py-2 hover:bg-cnn-gray-light text-sm font-semibold"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 hover:bg-cnn-gray-light rounded-full"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="w-5 h-5" />
              </button>
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
              <button className="cnn-button-primary hidden md:inline-flex text-sm">
                Subscribe
              </button>
              <button
                className="lg:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile/Desktop Toggle */}
          {isSearchOpen && (
            <div className="pb-4">
              <SearchBar 
                placeholder={dictionary.common.searchPlaceholder}
                loading={dictionary.common.loading}
                noResults={dictionary.common.noResults}
              />
            </div>
          )}

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={`/${lang}${item.href}`}
                    className="cnn-nav-link py-2 font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="pt-4 border-t">
                <LanguageSwitcher />
              </div>
            </div>
          )}
        </div>

        {/* Category Strip */}
        <div className="border-t border-cnn-border bg-white">
          <div className="cnn-container">
            <NavBar lang={lang} />
          </div>
        </div>
      </header>
    </>
  )
}

export default Header