import { client } from '@/lib/sanity/client'
import { NextResponse } from 'next/server'

export async function GET() {
  const articles = await client.fetch(`
    *[_type == "post"] | order(publishedAt desc)[0..49] {
      title,
      slug,
      publishedAt,
      excerpt,
      "author": author->name,
      "categories": categories[]->title,
      "imageUrl": mainImage.asset->url
    }
  `)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nrb-europe.vercel.app'

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>NRB Europe - Latest News</title>
  <link>${baseUrl}</link>
  <description>Breaking news and analysis for Non-Resident Bangladeshis in Europe</description>
  <language>en</language>
  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>

  ${articles
    .map(
      (article: any) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${baseUrl}/en/news/${article.slug.current}</link>
      <guid isPermaLink="true">${baseUrl}/en/news/${article.slug.current}</guid>
      <description>${escapeXml(article.excerpt || '')}</description>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(article.author || 'NRB Europe Editorial Team')}</dc:creator>
      ${article.categories?.map((cat: string) => `<category>${escapeXml(cat)}</category>`).join('\n      ') || ''}
      ${article.imageUrl ? `<media:content url="${article.imageUrl}" medium="image" />` : ''}
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
