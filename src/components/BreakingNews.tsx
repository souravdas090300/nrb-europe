'use client'

import Link from 'next/link'

interface BreakingNewsProps {
  items: Array<{ title: string; slug: { current: string } }>
  lang: string
}

export default function BreakingNews({ items, lang }: BreakingNewsProps) {
  if (!items || items.length === 0) return null

  return (
    <div className="bg-red-600 text-white py-2 px-4 overflow-hidden">
      <div className="flex items-center">
        <span className="font-bold mr-4 flex-shrink-0">BREAKING NEWS</span>
        <div className="flex animate-marquee whitespace-nowrap">
          {items.map((item, idx) => (
            <Link 
              key={idx} 
              href={`/${lang}/news/${item.slug.current}`}
              className="mx-6 hover:underline inline-block"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
