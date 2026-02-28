/**
 * @jest-environment node
 */
/**
 * Integration tests for:
 *   POST /api/push/subscribe
 *   POST /api/push/unsubscribe
 *   GET  /api/cron/publish-scheduled
 */

import { createJsonRequest, parseJson } from './helpers'

// ── Push mocks ───────────────────────────────────────────
import { POST as pushSubscribe } from '../push/subscribe/route'
import { POST as pushUnsubscribe } from '../push/unsubscribe/route'

describe('POST /api/push/subscribe', () => {
  it('accepts a subscription payload', async () => {
    const req = createJsonRequest('/api/push/subscribe', {
      endpoint: 'https://example.com/push',
      keys: { p256dh: 'key1', auth: 'key2' },
    })
    const res = await pushSubscribe(req)

    expect(res.status).toBe(200)
    expect(await parseJson(res)).toEqual({ success: true })
  })

  it('returns 500 when body is invalid', async () => {
    // Create request with invalid JSON
    const req = new (await import('next/server')).NextRequest(
      new URL('/api/push/subscribe', 'http://localhost:3000'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid-json{',
      }
    )
    const res = await pushSubscribe(req)
    expect(res.status).toBe(500)
  })
})

describe('POST /api/push/unsubscribe', () => {
  it('accepts an unsubscribe request', async () => {
    const req = createJsonRequest('/api/push/unsubscribe', {
      endpoint: 'https://example.com/push',
    })
    const res = await pushUnsubscribe(req)

    expect(res.status).toBe(200)
    expect(await parseJson(res)).toEqual({ success: true })
  })
})

// ── Cron mocks ───────────────────────────────────────────
const mockSanityFetch = jest.fn()
const mockPatch = jest.fn()
const mockSet = jest.fn()
const mockCommit = jest.fn()
jest.mock('@/lib/sanity/client', () => ({
  client: {
    fetch: (...args: unknown[]) => mockSanityFetch(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
}))

import { GET as cronGET } from '../cron/publish-scheduled/route'

describe('GET /api/cron/publish-scheduled', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCommit.mockResolvedValue({})
    mockSet.mockReturnValue({ commit: mockCommit })
    mockPatch.mockReturnValue({ set: mockSet })
  })

  it('returns zero count when no posts are scheduled', async () => {
    mockSanityFetch.mockResolvedValueOnce([])

    const res = await cronGET()
    expect(res.status).toBe(200)
    const data = (await parseJson(res)) as Record<string, unknown>
    expect(data).toEqual({
      message: 'No posts ready to publish',
      count: 0,
    })
  })

  it('publishes scheduled posts and returns results', async () => {
    const scheduled = [
      { _id: 'post-1', title: 'Scheduled Post 1', scheduledPublish: '2026-02-27T00:00:00Z' },
      { _id: 'post-2', title: 'Scheduled Post 2', scheduledPublish: '2026-02-28T00:00:00Z' },
    ]
    mockSanityFetch.mockResolvedValueOnce(scheduled)

    const res = await cronGET()
    expect(res.status).toBe(200)
    const data = (await parseJson(res)) as Record<string, unknown>
    expect(data).toHaveProperty('count', 2)
    expect(data).toHaveProperty('message', 'Scheduled posts processed')
    expect(mockPatch).toHaveBeenCalledTimes(2)
  })

  it('returns 500 on Sanity error', async () => {
    mockSanityFetch.mockRejectedValueOnce(new Error('Sanity unavailable'))

    const res = await cronGET()
    expect(res.status).toBe(500)
  })
})
