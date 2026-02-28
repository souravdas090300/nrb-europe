<<<<<<< Updated upstream
﻿'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, Search, Play, User, Sun, Moon, X, Briefcase, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { useTheme } from '../ui/ThemeProvider'
import { Locale } from '@/lib/i18n-config'
import { categories } from '@/lib/constants'
import NrbLogo from '../ui/NrbLogo'

// Items that go inside the hamburger menu
const HAMBURGER_SLUGS = new Set(['jobs'])

const Header = ({ lang, dictionary }: { lang: Locale; dictionary: any }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const [currentDate, setCurrentDate] = useState('')
  const { data: session } = useSession()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    )
  }, [])

  const getCatLabel = (cat: { slug: string; name: string }) =>
    dictionary?.categories?.[cat.slug] || dictionary?.nav?.[cat.slug] || cat.name

  const navCategories = categories.filter((c) => !HAMBURGER_SLUGS.has(c.slug))
  const hamburgerCategories = categories.filter((c) => HAMBURGER_SLUGS.has(c.slug))

  const linkClass = `shrink-0 text-[12px] font-bold uppercase tracking-wide no-underline whitespace-nowrap hover:text-red-600 ${
    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
  }`

  return (
    <header
      className={`fixed top-[36px] left-0 right-0 z-50 border-b transition-shadow duration-300 ${
        theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
      } ${isScrolled ? 'shadow-md' : ''}`}
    >
      {/* Single row header */}
      <div
        className="max-w-[1400px] mx-auto px-2 flex items-center h-11 gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Hamburger */}
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setMenuOpen((v) => !v)}
          className={`shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link
          href={`/${lang}`}
          aria-label="NRB Europe Home"
          className="shrink-0 inline-flex items-center mr-1"
        >
          <NrbLogo height={26} className="dark:invert" />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 shrink-0">
          <Link href={`/${lang}`} className={linkClass}>
            {dictionary?.nav?.home || 'Home'}
          </Link>

          {navCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${lang}/category/${cat.slug}`}
              className={linkClass}
            >
              {getCatLabel(cat)}
            </Link>
          ))}
        </nav>

        <div className="flex-1 min-w-2" />

        {/* Search form */}
        <form
          action={`/${lang}/search`}
          method="GET"
          className={`shrink-0 inline-flex items-center h-7 rounded-full border px-2 ${
            theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'
          }`}
        >
          <input
            type="text"
            name="q"
            placeholder={dictionary?.common?.searchPlaceholder || 'Search articles...'}
            className={`border-none bg-transparent outline-none text-[11px] w-16 sm:w-24 ${
              theme === 'dark'
                ? 'text-gray-300 placeholder:text-gray-500'
                : 'text-gray-700 placeholder:text-gray-400'
            }`}
          />
          <button
            type="submit"
            aria-label={dictionary?.common?.search || 'Search'}
            className={`w-5 h-5 inline-flex items-center justify-center rounded-full bg-transparent border-none cursor-pointer ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <Search size={12} />
          </button>
        </form>

        {/* Language Switcher */}
        <div className="shrink-0">
          <LanguageSwitcher />
        </div>

        {/* User Menu / Sign In */}
        {session ? (
          <div className="shrink-0 relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition text-xs font-bold"
            >
              {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
            </button>
            {userMenuOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded shadow-lg py-2 z-50 ${
                theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border'
              }`}>
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-sm">{session.user.name}</p>
                  <p className="text-xs text-gray-500">{session.user.email}</p>
                </div>
                {session.user.role === 'admin' && (
                  <>
                    <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setUserMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <Link href="/studio" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setUserMenuOpen(false)}>
                      Content Studio
                    </Link>
                  </>
                )}
                <button
                  onClick={() => { signOut(); setUserMenuOpen(false) }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="shrink-0 text-[11px] font-bold uppercase bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
        )}

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-full border-none cursor-pointer transition-all ${
            theme === 'dark' ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Hamburger dropdown */}
      {menuOpen && (
        <div
          className={`border-t px-4 py-3 ${
            theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex flex-col gap-2 max-w-[1400px] mx-auto">
            <Link
              href="/studio"
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-bold uppercase flex items-center gap-2 py-1 no-underline hover:text-red-600 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}
            >
              <Play size={14} /> Studio
            </Link>
            {session ? (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-bold uppercase flex items-center gap-2 py-1 no-underline hover:text-red-600 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}
                >
                  <User size={14} /> Dashboard
                </Link>
                <button
                  onClick={() => { signOut(); setMenuOpen(false) }}
                  className={`text-sm font-bold uppercase flex items-center gap-2 py-1 no-underline hover:text-red-600 text-left ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : null}
            {hamburgerCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${lang}/category/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-bold uppercase flex items-center gap-2 py-1 no-underline hover:text-red-600 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}
              >
                <Briefcase size={14} /> {getCatLabel(cat)}
              </Link>
            ))}
            <Link
              href={`/${lang}/news`}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-bold uppercase flex items-center gap-2 py-1 no-underline hover:text-red-600 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}
            >
              <Play size={14} /> {dictionary?.nav?.videos || 'Watch'}
            </Link>
            <Link
              href={`/${lang}/about`}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-bold uppercase py-1 no-underline hover:text-red-600 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}
            >
              {dictionary?.nav?.about || 'About'}
            </Link>
            <Link
              href={`/${lang}/contact`}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-bold uppercase py-1 no-underline hover:text-red-600 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}
            >
              {dictionary?.nav?.contact || 'Contact'}
            </Link>
          </div>
=======
'use client'

import { useState } from 'react'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import logoImage from '../../app/logo.png'
import { Menu, X, User, Search, Play } from 'lucide-react'
import LanguageSwitcher from '../LanguageSwitcher'
import { Locale } from '../../lib/i18n-config'
import { categories } from '../../lib/constants'
import en from '../../lib/dictionaries/en'
import bn from '../../lib/dictionaries/bn'
import es from '../../lib/dictionaries/es'
import de from '../../lib/dictionaries/de'
import fr from '../../lib/dictionaries/fr'

type Dictionary = typeof en
const dictionaries: Record<Locale, Dictionary> = { en, bn, es, de, fr }

const Header = ({ lang, dictionary: _dictionary }: { lang: Locale, dictionary: any }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const dictionary = dictionaries[lang] || en
  
  // Show all categories except Jobs in nav bar
  const navCategories = categories.filter((cat: (typeof categories)[number]) => cat.slug !== 'jobs')
  // Jobs goes only in hamburger
  const jobsCategory = categories.find((cat: (typeof categories)[number]) => cat.slug === 'jobs')

  const getTranslatedCategogy = (slug: string): string => {
    const key = slug as keyof typeof dictionary.categories
    return (dictionary.categories?.[key] || 'News') as string
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#ffffff', borderBottom: '1px solid #e5e5e5', width: '100%' }}>
      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 lg:px-6" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '52px', gap: '0.75rem', overflow: 'hidden', width: '100%', flexWrap: 'nowrap' }}>
        
        {/* Hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          style={{ padding: '0.5rem', border: '1px solid #999', borderRadius: '4px', color: '#333', backgroundColor: 'transparent', cursor: 'pointer', flexShrink: 0 }}
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo */}
        <Link href={`/${lang}`} aria-label="NRB Europe Home" style={{ flexShrink: 0 }}>
          <Image src={logoImage} alt="NRB Europe Logo" width={180} height={40} priority style={{ height: '40px', width: 'auto' }} />
        </Link>

        {/* Categories Nav */}
        <nav aria-label="Categories" style={{ flex: 0, overflowX: 'visible', display: 'flex', alignItems: 'center', minWidth: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '1rem', whiteSpace: 'nowrap' }}>
            <Link
              href={`/${lang}`}
              style={{ color: '#333', fontSize: '15px', fontWeight: '600', flexShrink: 0, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#d32f2f'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
            >
              {dictionary.nav?.home || 'Home'}
            </Link>
            {navCategories.map((category: (typeof categories)[number]) => (
              <Link
                key={category.slug}
                href={`/${lang}/category/${category.slug}`}
                style={{ color: '#333', fontSize: '15px', fontWeight: '600', flexShrink: 0, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#d32f2f'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
              >
                {getTranslatedCategogy(category.slug)}
              </Link>
            ))}
          </div>
        </nav>

        {/* Right Section - Watch, Search, Language, Sign In */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', flexShrink: 0, marginLeft: '2rem' }}>
          {/* Watch Button */}
          <Link href={`/${lang}/live`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#333', fontSize: '15px', fontWeight: '600', textDecoration: 'none', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#d32f2f'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#333'}>
            <Play size={16} style={{ flexShrink: 0 }} />
            <span>Watch</span>
          </Link>

          {/* Search Input */}
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const formData = new FormData(event.currentTarget)
              const query = String(formData.get('q') || '').trim()
              if (query) {
                window.location.href = `/${lang}/search?q=${encodeURIComponent(query)}`
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <input
              type="text"
              name="q"
              placeholder={dictionary.common?.searchPlaceholder || 'Search articles...'}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', minWidth: '150px' }}
            />
            <button
              type="submit"
              aria-label={dictionary.common?.search || 'Search'}
              style={{ padding: '0.45rem 0.6rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Search size={16} />
            </button>
          </form>

          {/* Language Switcher - Now visible in header */}
          <LanguageSwitcher />

          {/* Sign In Button */}
          <Link href={`/${lang}/admin`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#333', fontSize: '15px', fontWeight: '600', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#d32f2f'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#333'}>
            <User size={16} style={{ flexShrink: 0 }} />
            <span>Sign In</span>
          </Link>
        </div>
      </div>

      {/* Hamburger Menu Panel */}
      {isMenuOpen && (
        <div style={{ backgroundColor: '#f5f5f5', borderTop: '1px solid #e5e5e5', padding: '1rem' }}>
          {/* Go to Studio Link */}
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e5e5' }}>
            <Link
              href="/studio"
              style={{ color: '#333', fontSize: '15px', fontWeight: '600', textDecoration: 'none', display: 'block', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#d32f2f'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
            >
              Go to Studio
            </Link>
          </div>
          
          {/* Jobs Link */}
          {jobsCategory && (
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e5e5' }}>
              <Link
                href={`/${lang}/category/${jobsCategory.slug}`}
                style={{ color: '#333', fontSize: '15px', fontWeight: '600', textDecoration: 'none', display: 'block', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#d32f2f'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
              >
                {jobsCategory.name}
              </Link>
            </div>
          )}
>>>>>>> Stashed changes
        </div>
      )}
    </header>
  )
}

<<<<<<< Updated upstream
export default Header
=======
export default Header
>>>>>>> Stashed changes
