import { client } from '@/lib/sanity/client'
import { NextResponse } from 'next/server'

export async function GET() {
  const articles = await client.fetch(`
    *[_type == "post"] | order(publishedAt desc)[0..49] {
      slug,
      title,
      publishedAt
    }
  `)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nrb-europe.vercel.app'

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles
  .map(
    (article: any) => `
  <url>
    <loc>${baseUrl}/en/news/${article.slug.current}</loc>
    <news:news>
      <news:publication>
        <news:name>NRB Europe</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${article.publishedAt}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>
`
  )
  .join('')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
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
