/**
 * @jest-environment node
 */
/**
 * Integration tests for /api/comments and /api/comments/moderate
 */
import { createGetRequest, createJsonRequest, mockSession, parseJson } from './helpers'

// ── Mocks ────────────────────────────────────────────────
const mockGetServerSession = jest.fn()
jest.mock('next-auth', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    comment: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

import { GET, POST } from '../comments/route'
import { GET as moderateGET, PATCH as moderatePATCH } from '../comments/moderate/route'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockPrisma = (require('@/lib/prisma') as any).prisma

describe('/api/comments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── GET /api/comments ──────────────────────────────────
  describe('GET', () => {
    it('returns 400 when articleId is missing', async () => {
      const req = createGetRequest('/api/comments')
      const res = await GET(req)
      expect(res.status).toBe(400)
      expect(await parseJson(res)).toEqual({ error: 'articleId required' })
    })

    it('returns comments for a given articleId', async () => {
      const comments = [
        { id: 'c1', content: 'Great article!', user: { id: 'u1', name: 'John' }, replies: [] },
      ]
      mockPrisma.comment.findMany.mockResolvedValueOnce(comments)

      const req = createGetRequest('/api/comments?articleId=art-1')
      const res = await GET(req)

      expect(res.status).toBe(200)
      expect(await parseJson(res)).toEqual(comments)
      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ articleId: 'art-1', status: 'approved' }),
        })
      )
    })

    it('returns 500 on database error', async () => {
      mockPrisma.comment.findMany.mockRejectedValueOnce(new Error('DB'))

      const req = createGetRequest('/api/comments?articleId=art-1')
      const res = await GET(req)

      expect(res.status).toBe(500)
    })
  })

  // ── POST /api/comments ─────────────────────────────────
  describe('POST', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null)

      const req = createJsonRequest('/api/comments', { content: 'Hi', articleId: 'art-1' })
      const res = await POST(req)

      expect(res.status).toBe(401)
    })

    it('returns 400 when content or articleId is missing', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession())

      const req = createJsonRequest('/api/comments', { content: '', articleId: '' })
      const res = await POST(req)

      expect(res.status).toBe(400)
    })

    it('returns 404 when user not found in DB', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession())
      mockPrisma.user.findUnique.mockResolvedValueOnce(null)

      const req = createJsonRequest('/api/comments', { content: 'Hello', articleId: 'art-1' })
      const res = await POST(req)

      expect(res.status).toBe(404)
    })

    it('creates approved comment for admin', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'admin' }))
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', email: 'admin@test.com', role: 'admin' })
      const created = { id: 'c1', content: 'Admin comment', status: 'approved', user: { id: 'u1', name: 'Admin' } }
      mockPrisma.comment.create.mockResolvedValueOnce(created)

      const req = createJsonRequest('/api/comments', { content: 'Admin comment', articleId: 'art-1' })
      const res = await POST(req)

      expect(res.status).toBe(201)
      expect(await parseJson(res)).toEqual(created)
      expect(mockPrisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'approved' }),
        })
      )
    })

    it('creates pending comment for regular user', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'subscriber', email: 'user@test.com' }))
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u2', email: 'user@test.com', role: 'subscriber' })
      const created = { id: 'c2', content: 'User comment', status: 'pending', user: { id: 'u2', name: 'User' } }
      mockPrisma.comment.create.mockResolvedValueOnce(created)

      const req = createJsonRequest('/api/comments', { content: 'User comment', articleId: 'art-1' })
      const res = await POST(req)

      expect(res.status).toBe(201)
      expect(mockPrisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'pending' }),
        })
      )
    })

    it('supports replies via parentId', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'editor' }))
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', email: 'admin@test.com', role: 'editor' })
      mockPrisma.comment.create.mockResolvedValueOnce({ id: 'c3', parentId: 'c1' })

      const req = createJsonRequest('/api/comments', { content: 'Reply', articleId: 'art-1', parentId: 'c1' })
      const res = await POST(req)

      expect(res.status).toBe(201)
      expect(mockPrisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ parentId: 'c1', status: 'approved' }),
        })
      )
    })
  })
})

describe('/api/comments/moderate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── GET /api/comments/moderate ─────────────────────────
  describe('GET', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null)
      const res = await moderateGET()
      expect(res.status).toBe(401)
    })

    it('returns 403 for non-admin/editor users', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'subscriber' }))
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'subscriber' })
      const res = await moderateGET()
      expect(res.status).toBe(403)
    })

    it('returns pending comments for admin', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'admin' }))
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'admin' })
      const pending = [{ id: 'c1', content: 'Pending', status: 'pending' }]
      mockPrisma.comment.findMany.mockResolvedValueOnce(pending)

      const res = await moderateGET()
      expect(res.status).toBe(200)
      expect(await parseJson(res)).toEqual(pending)
    })
  })

  // ── PATCH /api/comments/moderate ───────────────────────
  describe('PATCH', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValueOnce(null)
      const req = createJsonRequest('/api/comments/moderate', { commentId: 'c1', action: 'approve' }, 'PATCH')
      const res = await moderatePATCH(req)
      expect(res.status).toBe(401)
    })

    it('returns 403 for non-admin/editor', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession({ role: 'subscriber' }))
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'subscriber' })
      const req = createJsonRequest('/api/comments/moderate', { commentId: 'c1', action: 'approve' }, 'PATCH')
      const res = await moderatePATCH(req)
      expect(res.status).toBe(403)
    })

    it('returns 400 for invalid action', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession())
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'admin' })
      const req = createJsonRequest('/api/comments/moderate', { commentId: 'c1', action: 'invalid' }, 'PATCH')
      const res = await moderatePATCH(req)
      expect(res.status).toBe(400)
    })

    it('approves a comment', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession())
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'admin' })
      const updated = { id: 'c1', status: 'approved' }
      mockPrisma.comment.update.mockResolvedValueOnce(updated)

      const req = createJsonRequest('/api/comments/moderate', { commentId: 'c1', action: 'approve' }, 'PATCH')
      const res = await moderatePATCH(req)

      expect(res.status).toBe(200)
      expect(await parseJson(res)).toEqual(updated)
      expect(mockPrisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { status: 'approved' },
      })
    })

    it('marks comment as spam', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession())
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'admin' })
      mockPrisma.comment.update.mockResolvedValueOnce({ id: 'c1', status: 'spam' })

      const req = createJsonRequest('/api/comments/moderate', { commentId: 'c1', action: 'spam' }, 'PATCH')
      const res = await moderatePATCH(req)

      expect(res.status).toBe(200)
      expect(mockPrisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { status: 'spam' },
      })
    })

    it('deletes a comment', async () => {
      mockGetServerSession.mockResolvedValueOnce(mockSession())
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'u1', role: 'admin' })
      mockPrisma.comment.delete.mockResolvedValueOnce({})

      const req = createJsonRequest('/api/comments/moderate', { commentId: 'c1', action: 'delete' }, 'PATCH')
      const res = await moderatePATCH(req)

      expect(res.status).toBe(200)
      expect(await parseJson(res)).toEqual({ success: true, message: 'Comment deleted' })
    })
  })
})
