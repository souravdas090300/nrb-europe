import ArticleCard from '@/components/ArticleCard'
import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/lib/i18n-config'

const SAMPLE_ARTICLES = [
  {
    title: 'New EU Visa Rules for Bangladeshi Students Expected in 2024',
    excerpt: 'The European Union is set to introduce streamlined visa procedures for Bangladeshi students pursuing higher education across member states.',
    category: 'Immigration',
    date: 'Mar 15, 2024',
    slug: 'eu-visa-rules-2024',
  },
  {
    title: 'Bangladeshi Entrepreneurs Thriving in Germany\'s Tech Scene',
    excerpt: 'A growing number of NRB founders are securing venture funding and building successful startups in Berlin and Munich.',
    category: 'Business',
    date: 'Mar 14, 2024',
    slug: 'nrbs-germany-tech-scene',
  },
  {
    title: 'UK Announces New Seasonal Worker Visa for Agricultural Sector',
    excerpt: 'The United Kingdom has expanded its seasonal worker program, opening opportunities for thousands of Bangladeshi workers.',
    category: 'Jobs',
    date: 'Mar 13, 2024',
    slug: 'uk-seasonal-worker-visa',
  },
  {
    title: 'Cultural Festivals Bringing NRB Communities Together in France',
    excerpt: 'From Paris to Lyon, Bangladeshi cultural associations are organizing large-scale events to celebrate heritage and foster unity.',
    category: 'Lifestyle',
    date: 'Mar 12, 2024',
    slug: 'nrb-cultural-festivals-france',
  },
  {
    title: 'Impact of European Green Deal on Bangladeshi Exporters',
    excerpt: 'New sustainability regulations are reshaping trade dynamics, prompting Bangladeshi businesses to adapt quickly.',
    category: 'Business',
    date: 'Mar 11, 2024',
    slug: 'green-deal-bangladeshi-exporters',
  },
  {
    title: 'How NRBs Can Navigate Healthcare Systems in Scandinavia',
    excerpt: 'A practical guide to understanding public and private healthcare in Sweden, Norway, and Denmark.',
    category: 'Lifestyle',
    date: 'Mar 10, 2024',
    slug: 'healthcare-scandinavia-nrbs',
  },
]

export default async function Home({
  params: { lang },
}: {
  params: { lang: Locale }
}) {
  const dictionary = await getDictionary(lang)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {dictionary.home.title}
        </h1>
        <p className="text-xl text-gray-600">{dictionary.home.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAMPLE_ARTICLES.map((article) => (
          <ArticleCard
            key={article.slug}
            title={article.title}
            description={article.excerpt}
            imageUrl="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80"
            slug={article.slug}
            author="NRB Europe"
            date={article.date}
          />
        ))}
      </div>
    </div>
  )
}
