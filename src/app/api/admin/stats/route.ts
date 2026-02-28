import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import { cached } from '@/lib/redis'

type DashboardStats = {
  totalViews: number
  viewsGrowth: number
  articlesPublished: number
  avgArticlesPerDay: number
  newsletterSubs: number
  subsGrowth: number
  revenue: number
  revenueGrowth: number
  topArticles: Array<{ title: string; views: number }>
  topCountries: Array<{ name: string; flag: string; percentage: number }>
}

const rangeToDays: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'

    const days = rangeToDays[range] || 7
    const currentPeriodStartIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    const previousPeriodStartIso = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000).toISOString()

    const [currentStats, previousStats, topArticles, countryStats] = await cached(
      `stats:${range}`,
      () => Promise.all([
        client.fetch(
          `{
            "articlesPublished": count(*[_type == "post" && defined(publishedAt) && publishedAt >= $start]),
            "totalViews": coalesce(sum(*[_type == "post" && defined(publishedAt) && publishedAt >= $start].views), 0)
          }`,
          { start: currentPeriodStartIso }
        ),
        client.fetch(
          `{
            "articlesPublished": count(*[_type == "post" && defined(publishedAt) && publishedAt >= $start && publishedAt < $end]),
            "totalViews": coalesce(sum(*[_type == "post" && defined(publishedAt) && publishedAt >= $start && publishedAt < $end].views), 0)
          }`,
          { start: previousPeriodStartIso, end: currentPeriodStartIso }
        ),
        client.fetch(
          `*[_type == "post"] | order(views desc, publishedAt desc)[0...5] {
            "title": coalesce(title, "Untitled"),
            "views": coalesce(views, 0)
          }`
        ),
        client.fetch(
          `*[_type == "post" && defined(country)] {
            "name": country
          }`
        ),
      ]),
      120, // 2 min TTL
    )

    const currentViews = Number(currentStats?.totalViews || 0)
    const previousViews = Number(previousStats?.totalViews || 0)
    const currentArticles = Number(currentStats?.articlesPublished || 0)
    const previousArticles = Number(previousStats?.articlesPublished || 0)

    const viewsGrowth = previousViews > 0
      ? Number((((currentViews - previousViews) / previousViews) * 100).toFixed(1))
      : 0

    const subsGrowth = previousArticles > 0
      ? Number((((currentArticles - previousArticles) / previousArticles) * 100).toFixed(1))
      : 0

    const avgArticlesPerDay = Number((currentArticles / days).toFixed(1))

    const countryCounts = (countryStats || []).reduce((acc: Record<string, number>, entry: { name?: string }) => {
      if (!entry?.name) {
        return acc
      }
      acc[entry.name] = (acc[entry.name] || 0) + 1
      return acc
    }, {})

    const countryCountValues = Object.values(countryCounts) as number[]
    const totalCountryMentions = countryCountValues.reduce((sum: number, count: number) => sum + count, 0)

    const countryEntries = Object.entries(countryCounts) as Array<[string, number]>

    const topCountries = countryEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({
        name,
        flag: '🌍',
        percentage: totalCountryMentions > 0 ? Math.round((count / totalCountryMentions) * 100) : 0,
      }))

    const stats: DashboardStats = {
      totalViews: currentViews,
      viewsGrowth,
      articlesPublished: currentArticles,
      avgArticlesPerDay,
      newsletterSubs: 0,
      subsGrowth,
      revenue: 0,
      revenueGrowth: 0,
      topArticles: Array.isArray(topArticles) ? topArticles : [],
      topCountries,
    }

    return NextResponse.json(stats, {
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
