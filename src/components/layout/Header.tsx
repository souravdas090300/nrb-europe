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
        </div>
      )}
    </header>
  )
}

export default Header