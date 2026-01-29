import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'
    
    // TODO: Fetch real stats from database/analytics
    // This is mock data for demonstration
    const mockStats = {
      totalViews: 125000,
      viewsGrowth: 12.5,
      articlesPublished: 48,
      avgArticlesPerDay: 6.8,
      newsletterSubs: 10234,
      subsGrowth: 23,
      revenue: 4250,
      revenueGrowth: 8.3,
      topArticles: [
        { title: 'Breaking: New Immigration Policy Announced', views: 12500 },
        { title: 'Essential Guide to Living in Europe', views: 8900 },
        { title: 'Top 10 Job Opportunities for NRBs', views: 7200 },
        { title: 'Bangladesh vs India: Match Highlights', views: 6100 },
        { title: 'European Business Trends 2026', views: 5800 },
      ],
      topCountries: [
        { name: 'United Kingdom', flag: '🇬🇧', percentage: 35 },
        { name: 'Germany', flag: '🇩🇪', percentage: 22 },
        { name: 'France', flag: '🇫🇷', percentage: 18 },
        { name: 'Italy', flag: '🇮🇹', percentage: 12 },
        { name: 'Spain', flag: '🇪🇸', percentage: 8 },
        { name: 'Others', flag: '🌍', percentage: 5 },
      ],
    }
    
    return NextResponse.json(mockStats, {
      headers: {
        'Cache-Control': 'private, max-age=60',
      },
    })
    
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
