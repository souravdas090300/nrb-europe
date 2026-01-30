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
