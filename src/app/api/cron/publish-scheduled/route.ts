import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'

export const dynamic = 'force-dynamic'

export async function GET() {
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
          console.error(`Failed to publish ${post._id}:`, error)
          return { id: post._id, title: post.title, success: false, error }
        }
      })
    )

    return NextResponse.json({
      message: 'Scheduled posts processed',
      count: scheduledPosts.length,
      results
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to process scheduled posts' },
      { status: 500 }
    )
  }
}
