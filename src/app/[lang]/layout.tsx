/**
 * @file app/[lang]/layout.tsx — Locale-specific layout
 *
 * Wraps all pages under `/{locale}/...`. Provides:
 *  - Theme provider (dark/light mode)
 *  - Site header with nav, search, auth, and language switcher
 *  - Breaking news ticker
 *  - Footer with social links
 *  - Google Analytics
 *  - PWA service worker registration & install prompt
 *  - Organization JSON-LD structured data
 *  - i18n dictionary (loaded server-side) passed to client components
 *
 * Static params are pre-generated for all supported locales so every
 * `/{locale}` path is statically built at deploy time.
 */

import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BreakingNewsTicker from '@/components/layout/BreakingNewsTicker'
import ThemeProvider from '@/components/ui/ThemeProvider'
import GoogleAnalytics from '@/components/ui/GoogleAnalytics'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration'
import OrganizationStructuredData from '@/components/seo/OrganizationStructuredData'
import { i18n, type Locale } from '@/lib/i18n-config'

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export const metadata: Metadata = {
  title: {
    default: 'NRB Europe | Trusted News for NRBs in Europe',
    template: '%s | NRB Europe'
  },
  description: 'Daily news, immigration updates, job alerts, and community stories for Non‑Resident Bangladeshis across Europe.',
  keywords: ['NRB', 'Europe', 'Bangladeshi news', 'Immigration', 'Jobs abroad', 'Non-Resident Bangladeshi', 'Europe news', 'Community'],
  authors: [{ name: 'NRB Europe Team' }],
  creator: 'NRB Europe',
  publisher: 'NRB Europe',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nrbeurope.com',
    siteName: 'NRB Europe',
    title: 'NRB Europe | Trusted News for NRBs in Europe',
    description: 'Daily news, immigration updates, job alerts, and community stories for Non‑Resident Bangladeshis across Europe.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NRB Europe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NRB Europe | Trusted News for NRBs in Europe',
    description: 'Daily news, immigration updates, job alerts, and community stories for Non‑Resident Bangladeshis across Europe.',
    images: ['/twitter-image.jpg'],
    creator: '@nrbeurope',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  themeColor: '#dc2626',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NRB Europe',
  },
}

import { getDictionary } from '@/lib/get-dictionary'

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params as { lang: Locale }
  const dictionary = await getDictionary(lang)
  
  return (
    <>
      <OrganizationStructuredData />
      <ThemeProvider>
        <GoogleAnalytics />
        <BreakingNewsTicker />
        <Header lang={lang} dictionary={dictionary} />
        <div className="flex flex-col min-h-screen pt-[80px]">
          <div className="flex-1">{children}</div>
          <Footer lang={lang} dictionary={dictionary} />
        </div>
        <PWAInstallPrompt />
        <ServiceWorkerRegistration />
      </ThemeProvider>
    </>
  )
}
