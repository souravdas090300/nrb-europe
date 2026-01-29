import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { i18n, type Locale } from '@/lib/i18n-config'

const inter = Inter({ subsets: ['latin'] })

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export const metadata: Metadata = {
  title: 'NRB Europe | Trusted News for NRBs in Europe',
  description: 'Daily news, immigration updates, job alerts, and community stories for Non‑Resident Bangladeshis across Europe.',
  keywords: ['NRB', 'Europe', 'Bangladeshi news', 'Immigration', 'Jobs abroad'],
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: Locale }
}) {
  return (
    <html lang={params.lang}>
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <Header lang={params.lang} />
        <div className="min-h-screen">{children}</div>
        <Footer lang={params.lang} />
      </body>
    </html>
  )
}
