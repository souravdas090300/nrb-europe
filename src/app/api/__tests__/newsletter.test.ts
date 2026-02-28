/**
 * @jest-environment node
 * @jest-global-setup <rootDir>/jest.setup.js
 */
/**
 * Integration tests for /api/newsletter/subscribe and /api/newsletter/unsubscribe
 */
import { createGetRequest, createJsonRequest, parseJson } from './helpers'

// ── Mocks ────────────────────────────────────────────────
jest.mock('@/lib/prisma', () => ({
  prisma: {
    newsletterSubscriber: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

const mockSendEmail = jest.fn()
jest.mock('@/lib/email', () => ({ sendEmail: (...args: unknown[]) => mockSendEmail(...args) }))

import { POST } from '../newsletter/subscribe/route'
import { GET } from '../newsletter/unsubscribe/route'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockPrisma = (require('@/lib/prisma') as any).prisma

describe('POST /api/newsletter/subscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 for missing email', async () => {
    const req = createJsonRequest('/api/newsletter/subscribe', { email: '' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await parseJson(res)).toEqual({ error: 'Valid email required' })
  })

  it('returns 400 for invalid email', async () => {
    const req = createJsonRequest('/api/newsletter/subscribe', { email: 'notanemail' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 409 for already active subscriber', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValueOnce({
      email: 'user@test.com',
      status: 'active',
    })

    const req = createJsonRequest('/api/newsletter/subscribe', { email: 'user@test.com' })
    const res = await POST(req)

    expect(res.status).toBe(409)
    expect(await parseJson(res)).toEqual({ error: 'Already subscribed' })
  })

  it('reactivates unsubscribed user', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValueOnce({
      email: 'user@test.com',
      status: 'unsubscribed',
    })
    mockPrisma.newsletterSubscriber.update.mockResolvedValueOnce({})

    const req = createJsonRequest('/api/newsletter/subscribe', { email: 'user@test.com' })
    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(await parseJson(res)).toEqual({ success: true, message: 'Subscription reactivated' })
    expect(mockPrisma.newsletterSubscriber.update).toHaveBeenCalledWith({
      where: { email: 'user@test.com' },
      data: { status: 'active' },
    })
  })

  it('creates new subscriber and sends welcome email', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValueOnce(null)
    mockPrisma.newsletterSubscriber.create.mockResolvedValueOnce({})
    mockSendEmail.mockResolvedValueOnce(undefined)

    const req = createJsonRequest('/api/newsletter/subscribe', {
      email: 'new@test.com',
      name: 'New User',
    })
    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(await parseJson(res)).toEqual({ success: true, message: 'Successfully subscribed!' })
    expect(mockPrisma.newsletterSubscriber.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'new@test.com',
        name: 'New User',
        token: expect.any(String),
      }),
    })
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'new@test.com',
        subject: 'Welcome to NRB Europe Newsletter!',
      })
    )
  })

  it('still succeeds when welcome email fails', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValueOnce(null)
    mockPrisma.newsletterSubscriber.create.mockResolvedValueOnce({})
    mockSendEmail.mockRejectedValueOnce(new Error('SMTP error'))

    const req = createJsonRequest('/api/newsletter/subscribe', { email: 'new@test.com' })
    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(await parseJson(res)).toEqual({ success: true, message: 'Successfully subscribed!' })
  })

  it('returns 500 on database error', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockRejectedValueOnce(new Error('DB'))

    const req = createJsonRequest('/api/newsletter/subscribe', { email: 'new@test.com' })
    const res = await POST(req)

    expect(res.status).toBe(500)
  })
})

describe('GET /api/newsletter/unsubscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when token is missing', async () => {
    const req = createGetRequest('/api/newsletter/unsubscribe')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 404 when subscriber not found', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValueOnce(null)

    const req = createGetRequest('/api/newsletter/unsubscribe?token=invalid-token')
    const res = await GET(req)

    expect(res.status).toBe(404)
  })

  it('unsubscribes and returns HTML confirmation', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValueOnce({
      email: 'user@test.com',
      token: 'valid-token',
    })
    mockPrisma.newsletterSubscriber.update.mockResolvedValueOnce({})

    const req = createGetRequest('/api/newsletter/unsubscribe?token=valid-token')
    const res = await GET(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/html')
    const body = await res.text()
    expect(body).toContain('Successfully Unsubscribed')
    expect(mockPrisma.newsletterSubscriber.update).toHaveBeenCalledWith({
      where: { token: 'valid-token' },
      data: { status: 'unsubscribed' },
    })
  })

  it('returns 500 on error', async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockRejectedValueOnce(new Error('DB'))

    const req = createGetRequest('/api/newsletter/unsubscribe?token=valid-token')
    const res = await GET(req)

    expect(res.status).toBe(500)
  })
})
