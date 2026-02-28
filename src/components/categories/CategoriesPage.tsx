import Link from 'next/link'
import { categories } from '../../lib/constants'

type CategoriesPageProps = {
  lang?: string
}

const CategoriesPage = ({ lang }: CategoriesPageProps) => {
  const basePath = lang ? `/${lang}` : ''

  return (
    <main className="bg-nrb-gray-light">
      {/* Header Section */}
      <section className="nrb-section bg-white border-b-2 border-black">
        <div className="nrb-container">
          <h1 className="headline-3xl mb-4">
            Explore Topics
          </h1>
          <p className="text-base text-nrb-text-light max-w-3xl">
            Clear, fast, and focused coverage for NRBs on politics, business, immigration, and more.
          </p>
        </div>
      </section>

      {/* Categories Horizontal Navigation */}
      <section className="nrb-section bg-white border-b border-nrb-border">
        <div className="nrb-container">
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
            {categories.map((category: (typeof categories)[number]) => (
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

      {/* All Categories Grid */}
      <section className="nrb-section bg-nrb-gray-light">
        <div className="nrb-container">
          <h2 className="headline-2xl mb-2">All Categories</h2>
          <p className="text-nrb-text-light mb-8">Find the latest stories by topic.</p>
          
          <div className="nrb-grid-4">
            {categories.map((category: (typeof categories)[number]) => (
              <Link
                key={`${category.slug}-grid`}
                href={`${basePath}/category/${category.slug}`}
                className="nrb-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="nrb-badge-category bg-nrb-red text-white">
                    {category.name}
                  </span>
                </div>
                <div className="nrb-divider" />
                <h3 className="headline-lg text-nrb-text hover:nrb-red-text transition mb-3">
                  Latest on {category.name}
                </h3>
                <p className="text-sm text-nrb-text-light mb-4">
                  Breaking updates, analysis, and explainers.
                </p>
                <div className="nrb-red-text text-xs font-bold uppercase">
                  Browse stories →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default CategoriesPage
