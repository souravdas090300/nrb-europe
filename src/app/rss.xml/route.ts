import { client } from '@/lib/sanity/client'
import { NextResponse } from 'next/server'

export async function GET() {
  const articles = await client.fetch(`
    *[_type == "post"] | order(publishedAt desc)[0..20] {
      title,
      slug,
      publishedAt,
      excerpt
    }
  `)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nrb-europe.vercel.app'

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>NRB Europe News</title>
  <link>${baseUrl}</link>
  <description>Latest news from NRB Europe</description>
  <language>en</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>

  ${articles
    .map(
      (article: any) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${baseUrl}/en/news/${article.slug.current}</link>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(article.excerpt || '')}</description>
      <guid isPermaLink="true">${baseUrl}/en/news/${article.slug.current}</guid>
    </item>
  `
    )
    .join('')}

</channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  })
}

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
