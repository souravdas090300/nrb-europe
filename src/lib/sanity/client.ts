import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Lazy-initialized client to prevent build-time crashes when env vars are unavailable
let _client: ReturnType<typeof createClient> | undefined
let _builder: ReturnType<typeof imageUrlBuilder> | undefined

function getClient() {
  if (!_client) {
    _client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
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
    _builder = imageUrlBuilder(getClient())
  }
  return _builder.image(source)
}
