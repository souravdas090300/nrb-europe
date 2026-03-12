import { withSentryConfig } from '@sentry/nextjs'

const isProduction = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io https://js.stripe.com https://*.vercel-scripts.com https://*.vercel-analytics.com https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://cdn.sanity.io https://images.unsplash.com https://*.googleusercontent.com https://www.google-analytics.com https://www.googletagmanager.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://cdn.sanity.io https://*.sanity.io https://api.stripe.com https://*.sentry.io https://*.vercel-analytics.com https://www.google-analytics.com https://www.googletagmanager.com https://region1.google-analytics.com",
              "frame-src 'self' https://js.stripe.com https://*.vercel.app",
              "frame-ancestors 'self' https://*.vercel.app",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              isProduction && "upgrade-insecure-requests",
            ].filter(Boolean).join('; ')
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: isProduction ? 'same-origin' : 'unsafe-none'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none'
          }
        ],
      },
      {
        source: '/news-sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate',
          },
        ],
      },
      {
        source: '/rss.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/rss+xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate',
          },
        ],
      },
    ]
  },
};

export default withSentryConfig(nextConfig, {
  // Suppresses source map uploading logs during build
  silent: true,
  // Upload source maps for better stack traces
  widenClientFileUpload: true,
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});
