'use client'

import React from 'react'
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Mail } from 'lucide-react'

const Footer = ({ lang = 'en', dictionary }: { lang?: string; dictionary?: any }) => {
  const currentYear = new Date().getFullYear()
  const nav = dictionary?.nav || {}
  const cats = dictionary?.categories || {}
  const ft = dictionary?.footer || {}

  const sections = [
    {
      title: ft.news || 'News',
      links: [
        { label: cats.world || nav.world || 'World', href: `/${lang}/category/world` },
        { label: cats.politics || nav.politics || 'Politics', href: `/${lang}/category/politics` },
        { label: cats.business || nav.business || 'Business', href: `/${lang}/category/business` },
        { label: cats.technology || nav.technology || 'Technology', href: `/${lang}/category/technology` },
      ]
    },
    {
      title: ft.more || 'More',
      links: [
        { label: cats.sports || nav.sports || 'Sports', href: `/${lang}/category/sports` },
        { label: cats.entertainment || nav.entertainment || 'Entertainment', href: `/${lang}/category/entertainment` },
        { label: cats.health || nav.health || 'Health', href: `/${lang}/category/health` },
        { label: ft.travel || 'Travel', href: `/${lang}/category/travel` },
      ]
    },
    {
      title: ft.about || nav.about || 'About',
      links: [
        { label: ft.aboutUs || 'About Us', href: `/${lang}/about` },
        { label: ft.contact || nav.contact || 'Contact', href: `/${lang}/contact` },
        { label: ft.editorialPolicy || 'Editorial Policy', href: `/${lang}/editorial-policy` },
        { label: ft.careers || 'Careers', href: `/${lang}/careers` },
      ]
    },
    {
      title: ft.legal || 'Legal',
      links: [
        { label: ft.privacyPolicy || 'Privacy Policy', href: `/${lang}/privacy` },
        { label: ft.termsOfService || 'Terms of Service', href: `/${lang}/terms` },
        { label: ft.cookiePolicy || 'Cookie Policy', href: `/${lang}/cookies` },
        { label: ft.accessibility || 'Accessibility', href: `/${lang}/accessibility` },
      ]
    }
  ]

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'Youtube' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Mail, href: `/${lang}/contact`, label: 'Email' },
  ]

  return (
    <footer className="bg-nrb-blue text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-nrb-red rounded-full flex items-center justify-center">
                <span className="text-white font-black text-lg">NRB</span>
              </div>
              <div>
                <p className="text-sm text-gray-300">&copy; {currentYear} NRB Europe</p>
                <p className="text-xs text-gray-400">{ft.trustedSource || 'Your trusted source for European news'}</p>
              </div>
            </div>

            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-700 hover:bg-nrb-red rounded-full flex items-center justify-center transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            <p>{ft.rights || 'All Rights Reserved. Use of this site constitutes acceptance of our Terms of Service and Privacy Policy.'}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
