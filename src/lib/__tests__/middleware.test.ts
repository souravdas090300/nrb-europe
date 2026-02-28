/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// We need to manually test the middleware logic since it uses Next.js internals
describe('Middleware', () => {
  describe('path classification', () => {
    const testPaths = [
      { path: '/api/auth/session', isSystem: true, desc: 'API routes are system paths' },
      { path: '/_next/static/chunk.js', isSystem: true, desc: 'Next.js static files are system paths' },
      { path: '/studio', isSystem: true, desc: 'Studio is a system path' },
      { path: '/admin', isSystem: true, desc: 'Admin is a system path' },
      { path: '/admin/users', isSystem: true, desc: 'Admin sub-routes are system paths' },
      { path: '/login', isSystem: true, desc: 'Login is a system path' },
      { path: '/en/news', isSystem: false, desc: 'Localized paths are not system paths' },
      { path: '/some-page', isSystem: false, desc: 'Regular paths are not system paths' },
    ]

    test.each(testPaths)('$desc ($path)', ({ path, isSystem }) => {
      const result =
        path.startsWith('/_next') ||
        path.startsWith('/api') ||
        path.startsWith('/studio') ||
        path.startsWith('/admin') ||
        path.startsWith('/login')
      expect(result).toBe(isSystem)
    })
  })

  describe('static asset detection', () => {
    const testAssets = [
      { path: '/favicon.ico', isStatic: true },
      { path: '/manifest.json', isStatic: true },
      { path: '/sw.js', isStatic: true },
      { path: '/robots.txt', isStatic: true },
      { path: '/icon-192x192.png', isStatic: true },
      { path: '/en', isStatic: false },
      { path: '/news', isStatic: false },
    ]

    test.each(testAssets)('$path is static: $isStatic', ({ path, isStatic }) => {
      const result = /\.[^/]+$/.test(path)
      expect(result).toBe(isStatic)
    })
  })

  describe('locale detection', () => {
    const locales = ['en', 'bn', 'es', 'de', 'fr']

    test.each(locales)('recognises /%s as a valid locale path', (locale) => {
      const path = `/${locale}/news`
      const isMissingLocale = locales.every(
        (l) => !path.startsWith(`/${l}/`) && path !== `/${l}`
      )
      expect(isMissingLocale).toBe(false)
    })

    it('detects missing locale for root path', () => {
      const path = '/'
      const isMissingLocale = locales.every(
        (l) => !path.startsWith(`/${l}/`) && path !== `/${l}`
      )
      expect(isMissingLocale).toBe(true)
    })

    it('detects missing locale for unlocalized path', () => {
      const path = '/news/article'
      const isMissingLocale = locales.every(
        (l) => !path.startsWith(`/${l}/`) && path !== `/${l}`
      )
      expect(isMissingLocale).toBe(true)
    })
  })

  describe('matcher pattern', () => {
    const matcherRegex = /^\/((?!api|_next\/static|_next\/image|favicon\.ico|icon\.png|apple-icon\.png|manifest\.json|robots\.txt|sw\.js|studio|admin|login).*)$/

    it('excludes /api routes', () => {
      expect(matcherRegex.test('/api/auth/session')).toBe(false)
    })

    it('excludes /admin routes', () => {
      expect(matcherRegex.test('/admin')).toBe(false)
      expect(matcherRegex.test('/admin/users')).toBe(false)
    })

    it('excludes /login', () => {
      expect(matcherRegex.test('/login')).toBe(false)
    })

    it('excludes /studio', () => {
      expect(matcherRegex.test('/studio')).toBe(false)
    })

    it('excludes static files', () => {
      expect(matcherRegex.test('/manifest.json')).toBe(false)
      expect(matcherRegex.test('/sw.js')).toBe(false)
      expect(matcherRegex.test('/robots.txt')).toBe(false)
    })

    it('allows regular pages', () => {
      expect(matcherRegex.test('/en/news')).toBe(true)
      expect(matcherRegex.test('/de/about')).toBe(true)
    })
  })
})
