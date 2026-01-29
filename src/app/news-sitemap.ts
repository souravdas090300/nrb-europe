import { MetadataRoute } from 'next';
import { client } from '@/lib/sanity/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nrbeurope.com';

  // Fetch articles from last 2 days for Google News
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const query = `*[_type == "post" && publishedAt > $twoDaysAgo] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    _updatedAt
  }`;

  const recentArticles = await client.fetch(query, { twoDaysAgo: twoDaysAgo.toISOString() });

  return recentArticles.map((article: any) => ({
    url: `${baseUrl}/article/${article.slug.current}`,
    lastModified: new Date(article._updatedAt || article.publishedAt),
    changeFrequency: 'hourly' as const,
    priority: 1,
  }));
}
