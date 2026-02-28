import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import Providers from '@/components/auth/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'NRB Europe | Trusted News for NRBs in Europe',
    template: '%s | NRB Europe',
  },
  description:
    'Daily news, immigration updates, job alerts, and community stories for Non‑Resident Bangladeshis across Europe.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-nrb-text antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
