import { client, urlFor } from '@/lib/sanity/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'

// AMP component type declarations are in root amp.d.ts

export const revalidate = 60

interface PageProps {
  params: { lang: string; slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0] { title, excerpt }`,
    { slug: params.slug }
  )
  
  return {
    title: article?.title,
    description: article?.excerpt,
  }
}

export default async function AMPArticlePage({ params }: PageProps) {
  const article = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      excerpt,
      mainImage,
      body,
      publishedAt,
      "author": author->name,
      "category": categories[0]->title
    }`,
    { slug: params.slug }
  )
  
  if (!article) notFound()

  const imageUrl = article.mainImage ? urlFor(article.mainImage).width(1200).url() : ''
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${params.lang}/news/${article.slug}`

  return (
    <html lang={params.lang} {...({ amp: '' } as any)}>
      <head>
        <meta charSet="utf-8" />
        <title>{article.title} - NRB Europe</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>
        
        <style amp-boilerplate="" dangerouslySetInnerHTML={{__html: `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`}} />
        <noscript>
          <style amp-boilerplate="" dangerouslySetInnerHTML={{__html: `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`}} />
        </noscript>
        
        <style amp-custom="" dangerouslySetInnerHTML={{__html: `
          body { font-family: sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 2rem; margin-bottom: 1rem; }
          .meta { color: #666; margin-bottom: 1rem; }
          .content { line-height: 1.6; }
        `}} />
      </head>
      
      <body>
        <header>
          <a href={`${process.env.NEXT_PUBLIC_SITE_URL}`}>
            <h2>NRB Europe</h2>
          </a>
        </header>
        
        <article>
          {article.category && (
            <div className="meta">
              <span>{article.category}</span>
            </div>
          )}
          
          <h1>{article.title}</h1>
          
          <div className="meta">
            By {article.author} | {new Date(article.publishedAt).toLocaleDateString()}
          </div>
          
          {imageUrl && (
            <div dangerouslySetInnerHTML={{
              __html: `<amp-img src="${imageUrl}" width="1200" height="630" layout="responsive" alt="${article.title}"></amp-img>`
            }} />
          )}
          
          <div className="content">
            <p>{article.excerpt}</p>
          </div>
        </article>
        
        <div dangerouslySetInnerHTML={{
          __html: `<amp-analytics type="googleanalytics"><script type="application/json">${JSON.stringify({
            vars: {
              account: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
            },
            triggers: {
              trackPageview: {
                on: 'visible',
                request: 'pageview',
              },
            },
          })}</script></amp-analytics>`
        }} />
      </body>
    </html>
  )
}
