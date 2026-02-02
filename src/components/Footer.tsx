'use client'

import React from 'react'
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Mail } from 'lucide-react'

const Footer = ({ lang = 'en' }: { lang?: string }) => {
  const currentYear = new Date().getFullYear()

  const sections = [
    {
      title: 'News',
      links: [
        { label: 'World', href: `/${lang}/category/world` },
        { label: 'Politics', href: `/${lang}/category/politics` },
        { label: 'Business', href: `/${lang}/category/business` },
        { label: 'Technology', href: `/${lang}/category/technology` },
      ]
    },
    {
      title: 'More',
      links: [
        { label: 'Sports', href: `/${lang}/category/sports` },
        { label: 'Entertainment', href: `/${lang}/category/entertainment` },
        { label: 'Health', href: `/${lang}/category/health` },
        { label: 'Travel', href: `/${lang}/category/travel` },
      ]
    },
    {
      title: 'About',
      links: [
        { label: 'About Us', href: `/${lang}/about` },
        { label: 'Contact', href: `/${lang}/contact` },
        { label: 'Editorial Policy', href: `/${lang}/editorial-policy` },
        { label: 'Careers', href: `/${lang}/careers` },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: `/${lang}/privacy` },
        { label: 'Terms of Service', href: `/${lang}/terms` },
        { label: 'Cookie Policy', href: `/${lang}/cookies` },
        { label: 'Accessibility', href: `/${lang}/accessibility` },
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
    <footer className="bg-cnn-blue text-white mt-12">
      <div className="cnn-container py-12">
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
              <div className="w-12 h-12 bg-cnn-red rounded-full flex items-center justify-center">
                <span className="text-white font-black text-lg">NRB</span>
              </div>
              <div>
                <p className="text-sm text-gray-300">© {currentYear} NRB Europe</p>
                <p className="text-xs text-gray-400">Your trusted source for European news</p>
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
                    className="w-10 h-10 bg-gray-700 hover:bg-cnn-red rounded-full flex items-center justify-center transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            <p>All Rights Reserved. Use of this site constitutes acceptance of our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer