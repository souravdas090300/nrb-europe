import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BreakingNewsTicker from '@/components/BreakingNewsTicker'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import { i18n, type Locale } from '@/lib/i18n-config'

const inter = Inter({ subsets: ['latin'] })

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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  manifest: '/manifest.json',
  themeColor: '#dc2626',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NRB Europe',
  },
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  
  return (
    <html lang={lang}>
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <GoogleAnalytics />
        <BreakingNewsTicker />
        <Header lang={lang} />
        <div className="min-h-screen">{children}</div>
        <Footer lang={lang} />
        <PWAInstallPrompt />
      </body>
    </html>
  )
}
