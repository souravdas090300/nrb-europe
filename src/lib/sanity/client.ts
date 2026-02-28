import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Lazy-initialized client to prevent build-time crashes when env vars are unavailable
let _client: ReturnType<typeof createClient> | undefined
let _builder: ReturnType<typeof imageUrlBuilder> | undefined

function getClient() {
  if (!_client) {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    if (!projectId) {
      // Return a stub client that returns empty results during build when env vars are missing
      return new Proxy({} as ReturnType<typeof createClient>, {
        get(_, prop) {
          if (prop === 'fetch') return async () => []
          if (prop === 'config') return () => ({})
          return undefined
        },
      })
    }
    _client = createClient({
      projectId,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2026-01-29',
      useCdn: process.env.NODE_ENV === 'production',
      token: process.env.SANITY_API_TOKEN,
    })
  }
  return _client
}

// Proxy preserves backward compatibility — all existing `client.fetch(...)` calls work unchanged
export const client: ReturnType<typeof createClient> = new Proxy(
  {} as ReturnType<typeof createClient>,
  {
    get(_, prop) {
      const real = getClient()
      const value = (real as any)[prop]
      return typeof value === 'function' ? value.bind(real) : value
    },
  }
)

export function urlFor(source: any) {
  if (!_builder) {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    if (!projectId) {
      // Return a stub that won't crash
      return { url: () => '', width: () => ({ url: () => '' }), height: () => ({ url: () => '' }) } as any
    }
    _builder = imageUrlBuilder(getClient() as any)
  }
  return _builder.image(source)
}
