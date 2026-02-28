import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'
import * as Sentry from '@sentry/nextjs'

const { logger } = Sentry

export const dynamic = 'force-dynamic'

export async function GET() {
  return Sentry.startSpan(
    { op: 'cron', name: 'publish-scheduled-posts' },
    async (span) => {
  try {
    // Get scheduled posts that are ready to publish
    const now = new Date().toISOString()
    
    const scheduledPosts = await client.fetch(`
      *[_type == "post" 
        && status == "approved" 
        && defined(scheduledPublish) 
        && scheduledPublish <= $now
      ] {
        _id,
        title,
        scheduledPublish
      }
    `, { now })

    if (scheduledPosts.length === 0) {
      return NextResponse.json({ 
        message: 'No posts ready to publish',
        count: 0
      })
    }

    // Update posts to published status
    const results = await Promise.all(
      scheduledPosts.map(async (post: any) => {
        try {
          await client
            .patch(post._id)
            .set({ 
              status: 'published',
              publishedAt: new Date().toISOString()
            })
            .commit()
          
          return { id: post._id, title: post.title, success: true }
        } catch (error) {
          Sentry.captureException(error)
          logger.error(logger.fmt`Failed to publish post ${post._id}: ${post.title}`)
          return { id: post._id, title: post.title, success: false, error }
        }
      })
    )

    span.setAttribute('posts.total', scheduledPosts.length)
    span.setAttribute('posts.published', results.filter((r: any) => r.success).length)
    span.setAttribute('posts.failed', results.filter((r: any) => !r.success).length)

    return NextResponse.json({
      message: 'Scheduled posts processed',
      count: scheduledPosts.length,
      results
    })
  } catch (error) {
    Sentry.captureException(error)
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to process scheduled posts' },
      { status: 500 }
    )
  }
    },
  )
}
