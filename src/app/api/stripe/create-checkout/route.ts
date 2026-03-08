/**
 * @file POST /api/stripe/create-checkout — Create a Stripe Checkout Session
 *
 * Requires an authenticated user session. Accepts a `plan` in the request
 * body ("monthly" | "yearly"), resolves or creates a Stripe Customer for
 * the user, and returns a Checkout Session ID for client-side redirect.
 *
 * The `userId` and `plan` are stored in Stripe session metadata so the
 * webhook handler can link the subscription back to the correct user.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, PLANS, getStripeCustomer } from '@/lib/stripe'
import * as Sentry from '@sentry/nextjs'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { plan } = await request.json()
    const planConfig = PLANS[plan as keyof typeof PLANS]

    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const customerId = await getStripeCustomer(
      session.user.id,
      session.user.email!
    )

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscribe`,
      metadata: {
        userId: session.user.id,
        plan,
      },
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error) {
    Sentry.captureException(error)
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
