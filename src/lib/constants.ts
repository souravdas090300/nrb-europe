/**
 * @file constants.ts — Sitewide constants and configuration
 *
 * Central source of truth for brand info, navigation, categories,
 * regions, and JSON-LD structured data used throughout the app.
 *
 * These constants are imported by layouts, SEO components, sitemaps,
 * RSS feeds, and server-side rendering functions.
 */

/** Base URL of the site, used for canonical links, OG tags, and sitemap. */
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nrbeurope.com'

/** Human-readable site name. */
export const SITE_NAME = 'NRB Europe'

/** Default meta description for the homepage and fallback. */
export const SITE_DESCRIPTION = 'Breaking news, immigration updates, and community stories for Non-Resident Bangladeshis across Europe'

/** Twitter/X handle used in og:twitter meta tags. */
export const TWITTER_HANDLE = '@NRBEurope'

/** Editorial contact email. */
export const CONTACT_EMAIL = 'contact@nrbeurope.com'

/** Absolute URL to the site logo (used in structured data). */
export const SITE_LOGO_URL = `${BASE_URL}/logo.png`

/**
 * JSON-LD Organization structured data.
 * Embedded in page `<head>` for Google Knowledge Panel and rich results.
 * @see https://schema.org/Organization
 */
export const ORGANIZATION = {
  '@type': 'Organization' as const,
  name: SITE_NAME,
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject' as const,
    url: SITE_LOGO_URL,
  },
  sameAs: [
    'https://twitter.com/NRBEurope',
    'https://facebook.com/NRBEurope',
  ],
  contactPoint: {
    '@type': 'ContactPoint' as const,
    email: CONTACT_EMAIL,
    contactType: 'editorial',
  },
}

/**
 * News categories displayed in navigation, article badges, and filters.
 * Each category has a Tailwind CSS color class for badge styling.
 */
export const categories = [
  { name: 'Europe', slug: 'europe', color: 'bg-sky-100 text-sky-800' },
  { name: 'World', slug: 'world', color: 'bg-blue-100 text-blue-800' },
  { name: 'Politics', slug: 'politics', color: 'bg-red-100 text-red-800' },
  { name: 'Business', slug: 'business', color: 'bg-green-100 text-green-800' },
  { name: 'Technology', slug: 'technology', color: 'bg-purple-100 text-purple-800' },
  { name: 'Health', slug: 'health', color: 'bg-teal-100 text-teal-800' },
  { name: 'Science', slug: 'science', color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Entertainment', slug: 'entertainment', color: 'bg-pink-100 text-pink-800' },
  { name: 'Sports', slug: 'sports', color: 'bg-orange-100 text-orange-800' },
  { name: 'Climate', slug: 'climate', color: 'bg-emerald-100 text-emerald-800' },
  { name: 'Immigration', slug: 'immigration', color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Jobs', slug: 'jobs', color: 'bg-green-100 text-green-800' },
  { name: 'Lifestyle', slug: 'lifestyle', color: 'bg-pink-100 text-pink-800' },
  { name: 'Travel', slug: 'travel', color: 'bg-cyan-100 text-cyan-800' },
]

/** Geographic regions for filtering European news coverage. */
export const regions = [
  'Western Europe',
  'Eastern Europe',
  'Northern Europe',
  'Southern Europe',
  'EU Institutions',
  'UK',
  'Balkans',
  'Scandinavia',
]

/** Consolidated site configuration object used by SEO and layout components. */
export const siteConfig = {
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  tagline: 'Breaking News • Independent Reporting',
  url: BASE_URL,
  logo: SITE_LOGO_URL,
  publisher: {
    name: SITE_NAME,
    logo: SITE_LOGO_URL,
  },
}

/** Primary navigation items rendered in the site header. */
export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'World', href: '/category/world' },
  { label: 'Politics', href: '/category/politics' },
  { label: 'Business', href: '/category/business' },
  { label: 'Technology', href: '/category/technology' },
  { label: 'Immigration', href: '/category/immigration' },
  { label: 'Jobs', href: '/category/jobs' },
  { label: 'Videos', href: '/videos' },
]
