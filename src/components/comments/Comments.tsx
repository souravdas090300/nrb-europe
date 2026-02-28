'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface CommentUser {
  id: string
  name: string | null
  image: string | null
}

interface CommentData {
  id: string
  content: string
  articleId: string
  userId: string
  user: CommentUser
  parentId: string | null
  status: string
  createdAt: string
  replies?: CommentData[]
}

interface CommentsProps {
  articleId: string
}

function SingleComment({
  comment,
  onReply,
}: {
  comment: CommentData
  onReply: (parentId: string) => void
}) {
  const timeAgo = getTimeAgo(new Date(comment.createdAt))

  return (
    <div className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-sm font-bold text-red-600">
          {comment.user.name?.charAt(0) || '?'}
        </div>
        <span className="font-semibold text-sm text-gray-900 dark:text-white">
          {comment.user.name || 'Anonymous'}
        </span>
        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{comment.content}</p>
      <button
        onClick={() => onReply(comment.id)}
        className="text-xs text-red-600 hover:text-red-700 font-medium"
      >
        Reply
      </button>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 ml-4">
          {comment.replies.map((reply) => (
            <SingleComment key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Comments({ articleId }: CommentsProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<CommentData[]>([])
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [articleId])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?articleId=${articleId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch {
      console.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, articleId, parentId: replyTo }),
      })

      if (res.ok) {
        const newComment = await res.json()
        if (newComment.status === 'approved') {
          await fetchComments()
          toast.success('Comment posted!')
        } else {
          toast.success('Comment submitted for moderation.')
        }
        setContent('')
        setReplyTo(null)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to post comment')
      }
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Comments ({comments.length})
      </h3>

      {/* Comment form */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-8">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
              <span>Replying to comment</span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Cancel
              </button>
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            required
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {submitting ? 'Posting...' : replyTo ? 'Post Reply' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          <a href="/login" className="text-red-600 hover:underline">
            Sign in
          </a>{' '}
          to leave a comment.
        </p>
      )}

      {/* Comments list */}
      {loading ? (
        <p className="text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <SingleComment
              key={comment.id}
              comment={comment}
              onReply={(parentId) => setReplyTo(parentId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}
