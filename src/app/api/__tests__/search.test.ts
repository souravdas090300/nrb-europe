/**
 * @jest-environment node
 */
/**
 * Integration tests for GET /api/search
 */
import { createGetRequest, parseJson } from './helpers'

// ── Mocks ────────────────────────────────────────────────
const mockFetch = jest.fn()
jest.mock('@/lib/sanity/client', () => ({
  client: { fetch: (...args: unknown[]) => mockFetch(...args) },
}))

import { GET } from '../search/route'

describe('GET /api/search', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns empty array when query is missing', async () => {
    const req = createGetRequest('/api/search')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(await parseJson(res)).toEqual([])
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns empty array when query is too short', async () => {
    const req = createGetRequest('/api/search?q=a')
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(await parseJson(res)).toEqual([])
  })

  it('returns articles matching query', async () => {
    const articles = [
      { _id: '1', title: 'EU trade policy', slug: { current: 'eu-trade' } },
      { _id: '2', title: 'EU elections', slug: { current: 'eu-elections' } },
    ]
    mockFetch.mockResolvedValueOnce(articles)

    const req = createGetRequest('/api/search?q=EU')
    const res = await GET(req)

    expect(res.status).toBe(200)
    expect(await parseJson(res)).toEqual(articles)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    // Verify the GROQ query pattern
    expect(mockFetch.mock.calls[0][1]).toEqual({ searchQuery: '*EU*' })
  })

  it('returns 500 when Sanity fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Sanity down'))

    const req = createGetRequest('/api/search?q=europe')
    const res = await GET(req)

    expect(res.status).toBe(500)
    expect(await parseJson(res)).toEqual([])
  })
})
