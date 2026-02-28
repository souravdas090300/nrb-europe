import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { subject, html } = await request.json()

    if (!subject || !html) {
      return NextResponse.json({ error: 'Subject and content required' }, { status: 400 })
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: 'active' },
    })

    let sent = 0
    let failed = 0

    for (const subscriber of subscribers) {
      try {
        const unsubscribeLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/newsletter/unsubscribe?token=${subscriber.token}`
        const emailHtml = `${html}<hr style="margin-top: 40px;"><p style="font-size: 12px; color: #888;">
          <a href="${unsubscribeLink}">Unsubscribe</a> from NRB Europe newsletter.</p>`

        await sendEmail({ to: subscriber.email, subject, html: emailHtml })
        sent++
      } catch {
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter sent: ${sent} delivered, ${failed} failed`,
      sent,
      failed,
    })
  } catch (error) {
    console.error('Error sending newsletter:', error)
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 })
  }
}
