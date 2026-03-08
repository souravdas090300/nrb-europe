/**
 * @file SEO.tsx — Reusable metadata generator for pages
 *
 * Builds a Next.js `Metadata` object with Open Graph, Twitter Card,
 * canonical URL, article dates, and JSON-LD structured data.
 * Used by page-level `generateMetadata()` functions.
 *
 * @example
 * ```ts
 * export function generateMetadata() {
 *   return generateSEO({ title: 'About', description: '...' })
 * }
 * ```
 */

import type { Metadata } from 'next'

interface SEOProps {
  title: string
  description: string
  canonicalUrl?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  keywords?: string[]
  noIndex?: boolean
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nrbeurope.com'
const SITE_NAME = 'NRB Europe'

/**
 * Helper to generate Next.js App Router metadata for pages.
 * Usage in page.tsx:
 *   export const metadata = generateMetadata({ title: '...', description: '...' })
 * Or in generateMetadata():
 *   return generateSEOMetadata({ title, description, ogImage })
 */
export function generateSEOMetadata({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author,
  keywords,
  noIndex = false,
}: SEOProps): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`
  const url = canonicalUrl || SITE_URL
  const image = ogImage || `${SITE_URL}/og-default.png`

  return {
    title: fullTitle,
    description,
    keywords: keywords?.join(', '),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: ogType,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

/**
 * Generate article-specific structured data (JSON-LD).
 * Use in a page's <head> via a <script> tag.
 */
export function generateArticleJsonLd({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  author,
}: {
  title: string
  description: string
  url: string
  image?: string
  publishedTime?: string
  modifiedTime?: string
  author?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description,
    url,
    image: image || `${SITE_URL}/og-default.png`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: author || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon.png`,
      },
    },
  }
}
