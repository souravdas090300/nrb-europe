import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio/', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/studio/', '/api/'],
      },
    ],
    sitemap: [
      'https://nrbeurope.com/sitemap.xml',
      'https://nrbeurope.com/news-sitemap.xml',
    ],
  };
}
