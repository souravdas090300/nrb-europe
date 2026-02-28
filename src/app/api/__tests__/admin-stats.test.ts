/**
 * @jest-environment node
 */
/**
 * Integration tests for GET /api/admin/stats
 */
import { TextEncoder, TextDecoder } from 'util'

Object.assign(global, { TextEncoder, TextDecoder })

import { createGetRequest, parseJson } from './helpers'

// ── Mocks ────────────────────────────────────────────────
const mockFetch = jest.fn()
jest.mock('@/lib/sanity/client', () => ({
  client: { fetch: (...args: unknown[]) => mockFetch(...args) },
}))

import { GET } from '../admin/stats/route'

describe('GET /api/admin/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns dashboard stats for default 7d range', async () => {
    mockFetch
      .mockResolvedValueOnce({ articlesPublished: 5, totalViews: 1000 })
      .mockResolvedValueOnce({ articlesPublished: 3, totalViews: 800 })
      .mockResolvedValueOnce([{ title: 'Top Article', views: 500 }])
      .mockResolvedValueOnce([{ name: 'Germany' }, { name: 'Germany' }, { name: 'France' }])

    const req = createGetRequest('/api/admin/stats')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const data = (await parseJson(res)) as Record<string, unknown>
    expect(data).toHaveProperty('totalViews')
    expect(data).toHaveProperty('articlesPublished')
    expect(data).toHaveProperty('avgArticlesPerDay')
    expect(data).toHaveProperty('topArticles')
    expect(data).toHaveProperty('topCountries')
    expect(data).toHaveProperty('viewsGrowth')
  })

  it('accepts custom range parameter (30d)', async () => {
    mockFetch
      .mockResolvedValueOnce({ articlesPublished: 20, totalViews: 5000 })
      .mockResolvedValueOnce({ articlesPublished: 15, totalViews: 4000 })
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const req = createGetRequest('/api/admin/stats?range=30d')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const data = (await parseJson(res)) as Record<string, unknown>
    expect(data).toHaveProperty('articlesPublished', 20)
    // Verify growth: (5000-4000)/4000 * 100 = 25
    expect(data).toHaveProperty('viewsGrowth', 25)
  })

  it('handles zero views in previous period (no division by zero)', async () => {
    mockFetch
      .mockResolvedValueOnce({ articlesPublished: 2, totalViews: 100 })
      .mockResolvedValueOnce({ articlesPublished: 0, totalViews: 0 })
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    const req = createGetRequest('/api/admin/stats?range=7d')
    const res = await GET(req)

    expect(res.status).toBe(200)
    const data = (await parseJson(res)) as Record<string, unknown>
    expect(data).toHaveProperty('viewsGrowth', 0)
  })

  it('returns 500 on Sanity error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Sanity error'))

    const req = createGetRequest('/api/admin/stats?range=7d')
    const res = await GET(req)

    expect(res.status).toBe(500)
  })
})
