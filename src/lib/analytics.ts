// Track article views
export const trackView = async (articleId: string, title: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'article_view', {
      article_id: articleId,
      article_title: title,
    })
  }
}

// Track search queries
export const trackSearch = (query: string, resultsCount: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'search', {
      search_term: query,
      search_results: resultsCount,
    })
  }
}

// Track category views
export const trackCategoryView = (category: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'category_view', {
      category_name: category,
    })
  }
}
