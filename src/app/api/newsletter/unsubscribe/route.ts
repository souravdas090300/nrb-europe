import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return new NextResponse('Invalid unsubscribe link', { status: 400 })
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { token } })

    if (!subscriber) {
      return new NextResponse('Subscriber not found', { status: 404 })
    }

    await prisma.newsletterSubscriber.update({
      where: { token },
      data: { status: 'unsubscribed' },
    })

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
      <head><title>Unsubscribed</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 60px;">
        <h1>Successfully Unsubscribed</h1>
        <p>You have been unsubscribed from the NRB Europe newsletter.</p>
        <p>We're sorry to see you go. You can re-subscribe at any time on our website.</p>
        <a href="/" style="color: #dc2626;">Return to NRB Europe</a>
      </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return new NextResponse('Failed to unsubscribe', { status: 500 })
  }
}
