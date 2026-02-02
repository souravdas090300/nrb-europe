import React from 'react'
import Link from 'next/link'
import { Locale } from '@/lib/i18n-config'
import { categories } from '@/lib/constants'

const NavBar = ({ lang }: { lang: Locale }) => {
  return (
    <nav className="flex overflow-x-auto py-2 space-x-6 hide-scrollbar">
      {categories.slice(0, 10).map((category) => (
        <Link
          key={category.slug}
          href={`/${lang}/category/${category.slug}`}
          className="cnn-nav-link whitespace-nowrap text-sm font-semibold uppercase tracking-wide"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  )
}

export default NavBar