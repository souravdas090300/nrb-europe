/**
 * @jest-environment node
 */
/**
 * Integration tests for GET /api/breaking-news
 */
import { NextResponse } from 'next/server'

const mockFetch = jest.fn()
jest.mock('@/lib/sanity/client', () => ({
  client: { fetch: (...args: unknown[]) => mockFetch(...args) },
}))

import { GET } from '../breaking-news/route'

describe('GET /api/breaking-news', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns breaking news articles', async () => {
    const articles = [
      { _id: '1', title: 'Breaking: EU summit', slug: { current: 'eu-summit' }, publishedAt: '2026-02-28T10:00:00Z', category: 'Politics' },
    ]
    mockFetch.mockResolvedValueOnce(articles)

    const res = await GET()

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual(articles)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    // Verify GROQ filters for isBreaking
    expect(mockFetch.mock.calls[0][0]).toContain('isBreaking == true')
  })

  it('returns empty array on error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Sanity error'))

    const res = await GET()

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual([])
  })
})
