import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'
import * as Sentry from '@sentry/nextjs'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json({ error: 'Already subscribed' }, { status: 409 })
      }
      // Re-activate
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { status: 'active' },
      })
      return NextResponse.json({ success: true, message: 'Subscription reactivated' })
    }

    const token = crypto.randomUUID()

    await prisma.newsletterSubscriber.create({
      data: { email, name: name || null, token },
    })

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to NRB Europe Newsletter!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Welcome to NRB Europe!</h1>
            <p>Thank you for subscribing to our newsletter. You'll receive the latest updates
            on immigration policies, job opportunities, business news, and community stories.</p>
            <p>To unsubscribe at any time, click
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/newsletter/unsubscribe?token=${token}">here</a>.
            </p>
            <p>Best regards,<br/>The NRB Europe Team</p>
          </div>
        `,
      })
    } catch (emailError) {
      Sentry.captureException(emailError)
      console.error('Failed to send welcome email:', emailError)
    }

    return NextResponse.json({ success: true, message: 'Successfully subscribed!' })
  } catch (error) {
    Sentry.captureException(error)
    console.error('Newsletter error:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
