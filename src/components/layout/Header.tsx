/**
 * @file Header.tsx — Main site header (Client Component)
 *
 * Responsive header with:
 *  - NRB Europe logo + current date
 *  - Desktop: horizontal category nav, search link, language switcher,
 *    dark-mode toggle, and user avatar dropdown (sign-in / profile / sign-out)
 *  - Mobile: hamburger menu containing the full nav, overflow categories,
 *    auth actions, language switcher, and theme toggle
 *  - Sticky behaviour with a slim scrolled state
 *
 * @param lang       - Current locale code
 * @param dictionary - Translation dictionary for the active locale
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, Search, Play, User, Sun, Moon, X, Briefcase, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { useTheme } from '../ui/ThemeProvider'
import { Locale } from '@/lib/i18n-config'
import { categories as fallbackCategories } from '@/lib/constants'
import NrbLogo from '../ui/NrbLogo'

/** Category slugs that are shown only in the hamburger menu (not the top nav bar). */
const HAMBURGER_SLUGS = new Set(['jobs', 'travel'])

type NavChild = { slug: string; name: string }

type NavCategory = {
  slug: string
  name: string
  parentId?: string | null
  children?: NavChild[]
}

const Header = ({ lang, dictionary }: { lang: Locale; dictionary: any }) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [categories, setCategories] = useState<NavCategory[]>(fallbackCategories)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { theme, toggleTheme } = useTheme()
  const [currentDate, setCurrentDate] = useState('')
  const { data: session } = useSession()
  const pathname = usePathname()

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

  useEffect(() => {
    let mounted = true

    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted || !Array.isArray(data)) return

        const normalized: NavCategory[] = data
          .map((cat: any) => ({
            slug: String(cat.slug || ''),
            name: String(cat.name || ''),
            parentId: cat.parentId || null,
            children: Array.isArray(cat.children)
              ? cat.children
                  .map((child: any) => ({
                    slug: String(child.slug || ''),
                    name: String(child.name || ''),
                  }))
                  .filter((c: NavChild) => c.slug && c.name)
              : [],
          }))
          .filter((cat) => cat.slug && cat.name)

        if (normalized.length > 0) {
          setCategories(normalized)
        }
      } catch {
        // Keep fallback categories when the API is unavailable.
      }
    }

    loadCategories()
    return () => {
      mounted = false
    }
  }, [pathname])

  const getCatLabel = (cat: { slug: string; name: string }) =>
    dictionary?.categories?.[cat.slug] || dictionary?.nav?.[cat.slug] || cat.name

  // API now returns tree (rootCategories); all returned items are top-level
  const topLevelCategories = categories.filter((c) => !c.parentId)
  const navCategories = topLevelCategories.filter((c) => !HAMBURGER_SLUGS.has(c.slug))
  const hamburgerCategories = topLevelCategories.filter((c) => HAMBURGER_SLUGS.has(c.slug))

  const handleDropdownEnter = (slug: string) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current)
    setOpenDropdown(slug)
  }

  const handleDropdownLeave = () => {
    dropdownTimerRef.current = setTimeout(() => setOpenDropdown(null), 150)
  }

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

          {/* Categories hidden on mobile, visible on md+ */}
          {navCategories.map((cat) => {
            const hasChildren = (cat.children?.length ?? 0) > 0
            return (
              <div
                key={cat.slug}
                className="relative hidden md:inline-block shrink-0"
                onMouseEnter={() => hasChildren && handleDropdownEnter(cat.slug)}
                onMouseLeave={hasChildren ? handleDropdownLeave : undefined}
              >
                <Link
                  href={`/${lang}/category/${cat.slug}`}
                  className={`${linkClass} flex items-center gap-0.5`}
                >
                  {getCatLabel(cat)}
                  {hasChildren && (
                    <span className="text-[10px] opacity-60 ml-0.5">▾</span>
                  )}
                </Link>
                {hasChildren && openDropdown === cat.slug && (
                  <div
                    className={`absolute top-full left-0 mt-1 min-w-[140px] rounded-md border shadow-lg py-1 z-50 ${
                      theme === 'dark'
                        ? 'bg-gray-900 border-gray-700'
                        : 'bg-white border-gray-200'
                    }`}
                    onMouseEnter={() => handleDropdownEnter(cat.slug)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    {cat.children!.map((child) => (
                      <Link
                        key={child.slug}
                        href={`/${lang}/category/${child.slug}`}
                        className={`block px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide hover:text-red-600 whitespace-nowrap ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {dictionary?.categories?.[child.slug] || child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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

        {/* User Menu / Sign In — hidden on mobile, shown on md+ */}
        {session ? (
          <div className="shrink-0 relative hidden md:block">
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
                    <Link href="/admin/studio" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setUserMenuOpen(false)}>
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
            className="shrink-0 text-[11px] font-bold uppercase bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition hidden md:inline-block"
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
          data-testid="hamburger-menu"
          className={`border-t px-4 py-3 ${
            theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex flex-col gap-2 max-w-[1400px] mx-auto">
            {session ? (
              <>
                <div className="px-2 py-2 mb-1 border-b border-gray-200 dark:border-gray-700 md:hidden">
                  <p className={`font-medium text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{session.user.name}</p>
                  <p className="text-xs text-gray-500">{session.user.email}</p>
                </div>
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className={`text-sm font-bold uppercase flex items-center gap-2 py-1 no-underline hover:text-red-600 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                    }`}
                  >
                    <User size={14} /> Dashboard
                  </Link>
                )}
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin/studio"
                    onClick={() => setMenuOpen(false)}
                    className={`text-sm font-bold uppercase flex items-center gap-2 py-1 no-underline hover:text-red-600 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                    }`}
                  >
                    <Briefcase size={14} /> Content Studio
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-bold uppercase flex items-center gap-2 py-1 no-underline hover:text-red-600 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}
                >
                  <User size={14} /> Profile
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
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-bold uppercase flex items-center gap-2 py-1 no-underline hover:text-red-600 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}
              >
                <User size={14} /> Sign In
              </Link>
            )}
            <hr className={`my-1 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
            {/* All categories in hamburger menu — with subcategories indented */}
            {[...navCategories, ...hamburgerCategories].map((cat) => (
              <div key={cat.slug}>
                <Link
                  href={`/${lang}/category/${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-bold uppercase flex items-center gap-2 py-1 no-underline hover:text-red-600 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}
                >
                  {getCatLabel(cat)}
                </Link>
                {(cat.children?.length ?? 0) > 0 && (
                  <div className="pl-4 flex flex-col">
                    {cat.children!.map((child) => (
                      <Link
                        key={child.slug}
                        href={`/${lang}/category/${child.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className={`text-xs font-semibold uppercase py-0.5 no-underline hover:text-red-600 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        ↳ {dictionary?.categories?.[child.slug] || child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
        </div>
      )}
    </header>
  )
}

export default Header
