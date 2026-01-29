import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ArticleCard from '@/components/ArticleCard'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Latest Articles</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ArticleCard 
            title="Sample Article"
            description="This is a sample article description"
            imageUrl="/placeholder.jpg"
            slug="sample-article"
          />
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
