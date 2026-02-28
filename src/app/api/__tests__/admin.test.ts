/**
 * @jest-environment node
 */
/**
 * Integration tests for admin API routes:
 *   GET  /api/admin/users
 *   POST /api/admin/users
 *   PATCH /api/admin/users/[id]
 *   DELETE /api/admin/users/[id]
 *   GET  /api/admin/analytics
 *   GET  /api/admin/subscriptions
 *   GET  /api/admin/newsletter/subscribers
 *   POST /api/admin/newsletter/send
 */
import { createJsonRequest, mockSession, parseJson } from './helpers'

// ── Mocks ────────────────────────────────────────────────
const mockGetServerSession = jest.fn()
jest.mock('next-auth', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    subscription: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    payment: { findMany: jest.fn() },
    newsletterSubscriber: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    comment: { count: jest.fn() },
  },
}))

const mockSendEmail = jest.fn()
jest.mock('@/lib/email', () => ({ sendEmail: (...args: unknown[]) => mockSendEmail(...args) }))

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}))

import { GET as usersGET, POST as usersPOST } from '../admin/users/route'
import { PATCH as userPATCH, DELETE as userDELETE } from '../admin/users/[id]/route'
import { GET as analyticsGET } from '../admin/analytics/route'
import { GET as subscriptionsGET } from '../admin/subscriptions/route'
import { GET as subscribersGET } from '../admin/newsletter/subscribers/route'
import { POST as sendNewsletterPOST } from '../admin/newsletter/send/route'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockPrisma = (require('@/lib/prisma') as any).prisma

// ═══════════════════════════════════════════════════════════
// /api/admin/users
// ═══════════════════════════════════════════════════════════
describe('GET /api/admin/users', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)
    const res = await usersGET()
    expect(res.status).toBe(401)
  })

  it('returns 401 for non-admin user', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'subscriber' }))
    const res = await usersGET()
    expect(res.status).toBe(401)
  })

  it('returns user list for admin', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'admin' }))
    const users = [
      { id: '1', email: 'a@test.com', name: 'A', role: 'admin', createdAt: '2026-01-01T00:00:00.000Z' },
    ]
    mockPrisma.user.findMany.mockResolvedValueOnce(users)

    const res = await usersGET()
    expect(res.status).toBe(200)
    expect(await parseJson(res)).toEqual(users)
  })
})

describe('POST /api/admin/users', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 for non-admin', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'subscriber' }))
    const req = createJsonRequest('/api/admin/users', {
      email: 'new@test.com', name: 'New', password: 'pass123', role: 'subscriber',
    })
    const res = await usersPOST(req)
    expect(res.status).toBe(401)
  })

  it('creates a user with hashed password', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'admin' }))
    const created = { id: '2', email: 'new@test.com', name: 'New', role: 'subscriber' }
    mockPrisma.user.create.mockResolvedValueOnce(created)

    const req = createJsonRequest('/api/admin/users', {
      email: 'new@test.com', name: 'New', password: 'pass123', role: 'subscriber',
    })
    const res = await usersPOST(req)

    expect(res.status).toBe(200)
    expect(await parseJson(res)).toEqual(created)
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'new@test.com',
        password: 'hashed-password',
        role: 'subscriber',
      }),
    })
  })
})

// ═══════════════════════════════════════════════════════════
// /api/admin/users/[id]
// ═══════════════════════════════════════════════════════════
describe('PATCH /api/admin/users/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 for non-admin', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)
    const req = createJsonRequest('/api/admin/users/u1', { role: 'editor' }, 'PATCH')
    const res = await userPATCH(req, { params: Promise.resolve({ id: 'u1' }) })
    expect(res.status).toBe(401)
  })

  it('updates user role', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'admin' }))
    const updated = { id: 'u1', role: 'editor' }
    mockPrisma.user.update.mockResolvedValueOnce(updated)

    const req = createJsonRequest('/api/admin/users/u1', { role: 'editor' }, 'PATCH')
    const res = await userPATCH(req, { params: Promise.resolve({ id: 'u1' }) })

    expect(res.status).toBe(200)
    expect(await parseJson(res)).toEqual(updated)
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { role: 'editor' },
    })
  })
})

describe('DELETE /api/admin/users/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 for non-admin', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'subscriber' }))
    const req = new Request('http://localhost:3000/api/admin/users/u1', { method: 'DELETE' })
    const res = await userDELETE(req, { params: Promise.resolve({ id: 'u1' }) })
    expect(res.status).toBe(401)
  })

  it('deletes user and returns 204', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'admin' }))
    mockPrisma.user.delete.mockResolvedValueOnce({})

    const req = new Request('http://localhost:3000/api/admin/users/u1', { method: 'DELETE' })
    const res = await userDELETE(req, { params: Promise.resolve({ id: 'u1' }) })

    expect(res.status).toBe(204)
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } })
  })
})

// ═══════════════════════════════════════════════════════════
// /api/admin/analytics
// ═══════════════════════════════════════════════════════════
describe('GET /api/admin/analytics', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 for non-admin', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)
    const res = await analyticsGET()
    expect(res.status).toBe(401)
  })

  it('returns analytics data for admin', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'admin' }))
    mockPrisma.user.findMany.mockResolvedValueOnce([])
    mockPrisma.payment.findMany.mockResolvedValueOnce([])
    mockPrisma.subscription.groupBy.mockResolvedValueOnce([])
    mockPrisma.user.count.mockResolvedValueOnce(10)
    mockPrisma.subscription.count.mockResolvedValueOnce(5)
    mockPrisma.newsletterSubscriber.count.mockResolvedValueOnce(100)

    const res = await analyticsGET()
    expect(res.status).toBe(200)
    const data = (await parseJson(res)) as Record<string, unknown>
    expect(data).toHaveProperty('totalUsers', 10)
    expect(data).toHaveProperty('activeSubscriptions', 5)
    expect(data).toHaveProperty('newsletterSubs', 100)
    expect(data).toHaveProperty('totalRevenue', 0)
    expect(data).toHaveProperty('userGrowth')
    expect(data).toHaveProperty('revenue')
  })
})

// ═══════════════════════════════════════════════════════════
// /api/admin/subscriptions
// ═══════════════════════════════════════════════════════════
describe('GET /api/admin/subscriptions', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 for non-admin', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'subscriber' }))
    const res = await subscriptionsGET()
    expect(res.status).toBe(401)
  })

  it('returns subscriptions for admin', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'admin' }))
    const subs = [{ id: 's1', plan: 'monthly', user: { email: 'a@test.com' } }]
    mockPrisma.subscription.findMany.mockResolvedValueOnce(subs)

    const res = await subscriptionsGET()
    expect(res.status).toBe(200)
    expect(await parseJson(res)).toEqual(subs)
  })
})

// ═══════════════════════════════════════════════════════════
// /api/admin/newsletter/subscribers
// ═══════════════════════════════════════════════════════════
describe('GET /api/admin/newsletter/subscribers', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)
    const res = await subscribersGET()
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'subscriber', email: 'user@test.com' }))
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'subscriber' })
    const res = await subscribersGET()
    expect(res.status).toBe(403)
  })

  it('returns subscribers with stats for admin', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'admin' }))
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'admin' })
    const subs = [
      { email: 'a@test.com', status: 'active' },
      { email: 'b@test.com', status: 'active' },
      { email: 'c@test.com', status: 'unsubscribed' },
    ]
    mockPrisma.newsletterSubscriber.findMany.mockResolvedValueOnce(subs)

    const res = await subscribersGET()
    expect(res.status).toBe(200)
    const data = (await parseJson(res)) as Record<string, unknown>
    expect(data).toEqual({
      subscribers: subs,
      stats: { total: 3, active: 2, unsubscribed: 1 },
    })
  })
})

// ═══════════════════════════════════════════════════════════
// POST /api/admin/newsletter/send
// ═══════════════════════════════════════════════════════════
describe('POST /api/admin/newsletter/send', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    mockGetServerSession.mockResolvedValueOnce(null)
    const req = createJsonRequest('/api/admin/newsletter/send', { subject: 'Hi', html: '<p>Hi</p>' })
    const res = await sendNewsletterPOST(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'subscriber', email: 'user@test.com' }))
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'subscriber' })
    const req = createJsonRequest('/api/admin/newsletter/send', { subject: 'Hi', html: '<p>Hi</p>' })
    const res = await sendNewsletterPOST(req)
    expect(res.status).toBe(403)
  })

  it('returns 400 when subject or html is missing', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession())
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'admin' })
    const req = createJsonRequest('/api/admin/newsletter/send', { subject: '', html: '' })
    const res = await sendNewsletterPOST(req)
    expect(res.status).toBe(400)
  })

  it('sends newsletter to all active subscribers', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession())
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'admin' })
    mockPrisma.newsletterSubscriber.findMany.mockResolvedValueOnce([
      { email: 'a@test.com', token: 'tok-a' },
      { email: 'b@test.com', token: 'tok-b' },
    ])
    mockSendEmail.mockResolvedValue(undefined)

    const req = createJsonRequest('/api/admin/newsletter/send', {
      subject: 'Weekly update',
      html: '<p>News</p>',
    })
    const res = await sendNewsletterPOST(req)

    expect(res.status).toBe(200)
    const data = (await parseJson(res)) as Record<string, unknown>
    expect(data).toEqual({
      success: true,
      message: 'Newsletter sent: 2 delivered, 0 failed',
      sent: 2,
      failed: 0,
    })
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
  })

  it('reports partial failures', async () => {
    mockGetServerSession.mockResolvedValueOnce(mockSession())
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'admin' })
    mockPrisma.newsletterSubscriber.findMany.mockResolvedValueOnce([
      { email: 'a@test.com', token: 'tok-a' },
      { email: 'bad@test.com', token: 'tok-b' },
    ])
    mockSendEmail
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('SMTP error'))

    const req = createJsonRequest('/api/admin/newsletter/send', {
      subject: 'Weekly',
      html: '<p>News</p>',
    })
    const res = await sendNewsletterPOST(req)

    expect(res.status).toBe(200)
    const data = (await parseJson(res)) as Record<string, unknown>
    expect(data).toEqual({
      success: true,
      message: 'Newsletter sent: 1 delivered, 1 failed',
      sent: 1,
      failed: 1,
    })
  })
})
