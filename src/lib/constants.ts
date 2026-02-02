export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nrb-europe.vercel.app'
export const SITE_NAME = 'NRB Europe'
export const SITE_DESCRIPTION = 'Breaking news, immigration updates, and community stories for Non-Resident Bangladeshis across Europe'
export const TWITTER_HANDLE = '@NRBEurope'
export const CONTACT_EMAIL = 'contact@nrbeurope.com'
export const SITE_LOGO_URL = `${BASE_URL}/logo.png`

// Organization info for structured data
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

// CNN-Style Configuration
export const categories = [
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
]

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
