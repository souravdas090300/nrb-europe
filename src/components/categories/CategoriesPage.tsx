'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { categories as fallbackCategories } from '../../lib/constants'

type CategoriesPageProps = {
  lang?: string
}

type PublicCategory = {
  id: string
  name: string
  slug: string
  color: string
  description: string | null
  parentId: string | null
  children: Array<{
    id: string
    name: string
    slug: string
    color: string
    description: string | null
    parentId: string | null
  }>
}

const CategoriesPage = ({ lang }: CategoriesPageProps) => {
  const basePath = lang ? `/${lang}` : ''
  const [categories, setCategories] = useState<PublicCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch categories')
        const data = (await res.json()) as PublicCategory[]
        if (mounted) {
          setCategories(data)
        }
      } catch {
        if (mounted) {
          setCategories(
            fallbackCategories.map((c) => ({
              id: c.slug,
              name: c.name,
              slug: c.slug,
              color: c.color,
              description: null,
              parentId: null,
              children: [],
            }))
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadCategories()
    return () => {
      mounted = false
    }
  }, [])

  const parentCategories = useMemo(() => categories.filter((cat) => !cat.parentId), [categories])

  return (
    <main className="bg-nrb-gray-light">
      <section className="nrb-section bg-white border-b-2 border-black">
        <div className="nrb-container">
          <h1 className="headline-3xl mb-4">Explore Topics</h1>
          <p className="text-base text-nrb-text-light max-w-3xl">
            Clear, fast, and focused coverage for NRBs on politics, business, immigration, and more.
          </p>
        </div>
      </section>

      <section className="nrb-section bg-white border-b border-nrb-border">
        <div className="nrb-container">
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
            {parentCategories.map((category) => (
              <Link
                key={category.slug}
                href={`${basePath}/category/${category.slug}`}
                className="whitespace-nowrap nrb-nav-item"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="nrb-section bg-nrb-gray-light">
        <div className="nrb-container">
          <h2 className="headline-2xl mb-2">All Categories</h2>
          <p className="text-nrb-text-light mb-8">Find the latest stories by topic.</p>

          {loading ? (
            <p className="text-nrb-text-light">Loading categories...</p>
          ) : (
            <div className="nrb-grid-4">
              {parentCategories.map((category) => (
                <div key={`${category.slug}-grid`} className="nrb-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Link href={`${basePath}/category/${category.slug}`}>
                      <span className="nrb-badge-category bg-nrb-red text-white">{category.name}</span>
                    </Link>
                  </div>

                  <div className="nrb-divider" />
                  <h3 className="headline-lg text-nrb-text mb-3">Latest on {category.name}</h3>
                  <p className="text-sm text-nrb-text-light mb-4">
                    {category.description || 'Breaking updates, analysis, and explainers.'}
                  </p>

                  {category.children.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-wide text-nrb-text-light mb-2">Subcategories</p>
                      <div className="flex flex-wrap gap-2">
                        {category.children.map((child) => (
                          <Link
                            key={`${category.slug}-${child.slug}`}
                            href={`${basePath}/category/${child.slug}`}
                            className="text-xs font-bold uppercase px-2 py-1 rounded border border-nrb-border hover:text-red-600"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href={`${basePath}/category/${category.slug}`}
                    className="nrb-red-text text-xs font-bold uppercase"
                  >
                    Browse stories →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default CategoriesPage
