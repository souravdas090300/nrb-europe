import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { i18n } from './lib/i18n-config'

// Blocked user-agent patterns (bots, scanners, scrapers)
const BLOCKED_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /havij/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /semrush/i,
  /ahref.*bot/i,
  /mj12bot/i,
  /dotbot/i,
  /blexbot/i,
]

// Suspicious path patterns (common attack vectors)
const BLOCKED_PATHS = [
  /\.\.\//, // path traversal
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/wp-content/i,
  /\/wp-includes/i,
  /\/xmlrpc\.php/i,
  /\/phpmyadmin/i,
  /\/\.env/,
  /\/\.git/,
  /\/\.htaccess/,
  /\/config\.php/i,
  /\/eval\(/i,
  /\/exec\(/i,
  /\/(union|select|insert|update|delete|drop)\b.*\b(from|into|table|where)\b/i,
]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const userAgent = request.headers.get('user-agent') || ''

  // --- SECURITY LAYER ---

  // 1. Block malicious user agents
  if (BLOCKED_USER_AGENTS.some((pattern) => pattern.test(userAgent))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // 2. Block suspicious paths (attack probes)
  if (BLOCKED_PATHS.some((pattern) => pattern.test(pathname))) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // 3. Block requests with suspiciously long URLs (buffer overflow attempts)
  if (pathname.length > 2048) {
    return new NextResponse('URI Too Long', { status: 414 })
  }

  // 4. Block requests with null bytes in path (injection attempts)
  if (pathname.includes('\0') || pathname.includes('%00')) {
    return new NextResponse('Bad Request', { status: 400 })
  }

  // 5. Set security nonce header for CSP (forwarded to API responses)
  const response = NextResponse.next()

  // Add request ID for traceability  
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-Id', requestId)

  // --- I18N ROUTING ---

  const isStaticAsset = /\.[^/]+$/.test(pathname)
  const isSystemPath = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/verify') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password') || pathname.startsWith('/profile') || pathname.startsWith('/subscribe')

  if (isStaticAsset || isSystemPath) {
    return response
  }
  
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }

  return response
}

function getLocale(request: NextRequest): string {
  // Check for locale in cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeCookie && i18n.locales.includes(localeCookie as any)) {
    return localeCookie
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const locale = acceptLanguage.split(',')[0].split('-')[0]
    if (i18n.locales.includes(locale as any)) {
      return locale
    }
  }

  return i18n.defaultLocale
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|manifest.json|robots.txt|sw.js|admin|login|register|verify|forgot-password|reset-password|profile|subscribe).*)'],
}
