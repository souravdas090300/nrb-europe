/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://nrbeurope.com',
  generateRobotsTxt: false,       // We already have src/app/robots.ts
  generateIndexSitemap: false,
  outDir: './public',
  exclude: [
    '/admin',
    '/admin/*',
    '/admin-login',
    '/api/*',
    '/apple-icon.png',
    '/forgot-password',
    '/icon.png',
    '/login',
    '/news-sitemap.xml',
    '/profile',
    '/register',
    '/reset-password',
    '/robots.txt',
    '/sitemap.xml',
    '/studio/*',
    '/subscribe/success',
    '/verify',
  ],
  additionalPaths: async (config) => {
    const paths = []

    // Static pages
    const staticPages = ['/', '/subscribe']
    for (const page of staticPages) {
      paths.push({
        loc: page,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      })
    }

    // Locales
    const locales = ['en', 'bn', 'es', 'de', 'fr']
    for (const locale of locales) {
      paths.push({
        loc: `/${locale}`,
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      })
    }

    return paths
  },
}
