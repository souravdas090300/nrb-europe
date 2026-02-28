interface Article {
  title: string
  views: number
  slug: string
}

export default function TopArticles({ articles }: { articles: Article[] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Top Articles</h3>
      <div className="space-y-4">
        {articles.length === 0 && (
          <p className="text-gray-500">No article data available yet.</p>
        )}
        {articles.map((article, index) => (
          <div
            key={article.slug}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                {index + 1}
              </span>
              <span className="font-medium">{article.title}</span>
            </div>
            <span className="text-gray-600">
              {article.views?.toLocaleString() || 0} views
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
