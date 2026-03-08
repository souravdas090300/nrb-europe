/**
 * @file POST /api/stripe/webhook — Stripe webhook handler
 *
 * Receives and validates Stripe webhook events using the signing secret.
 * Each event is processed inside a Sentry span for observability.
 *
 * Handled events:
 *  - `checkout.session.completed` — Creates Subscription, upgrades user role
 *  - `customer.subscription.updated` — Syncs status & period end
 *  - `customer.subscription.deleted` — Marks subscription as canceled
 *  - `invoice.payment_succeeded` — Records Payment in the database
 *
 * @important This endpoint must receive the raw request body (not parsed JSON)
 *           for Stripe signature verification to work.
 */

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import * as Sentry from '@sentry/nextjs'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature') as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  return Sentry.startSpan(
    { op: 'webhook', name: `stripe.${event.type}` },
    async (span) => {
      span.setAttribute('stripe.event_type', event.type)
      span.setAttribute('stripe.event_id', event.id)

      try {
        switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any

      await prisma.subscription.create({
        data: {
          userId: session.metadata.userId,
          stripeSubscriptionId: session.subscription as string,
          stripeCustomerId: session.customer as string,
          plan: session.metadata.plan,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(
            Date.now() +
              (session.metadata.plan === 'yearly'
                ? 365 * 24 * 60 * 60 * 1000
                : 30 * 24 * 60 * 60 * 1000)
          ),
        },
      })

      await prisma.user.update({
        where: { id: session.metadata.userId },
        data: { role: 'subscriber' },
      })
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as any

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status,
          currentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: 'canceled' },
      })
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as any

      if (invoice.payment_intent) {
        const subscription = await prisma.subscription.findFirst({
          where: {
            stripeSubscriptionId: invoice.subscription as string,
          },
        })

        if (subscription?.userId) {
          await prisma.payment.create({
            data: {
              userId: subscription.userId,
              stripePaymentIntentId: invoice.payment_intent as string,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'succeeded',
              description: `Invoice ${invoice.number}`,
            },
          })
        } else {
          console.error('No subscription found for invoice:', invoice.id)
          Sentry.captureMessage(`Payment without matching subscription: ${invoice.id}`)
        }
      }
      break
    }
  }

        return NextResponse.json({ received: true })
      } catch (error) {
        Sentry.captureException(error)
        return NextResponse.json(
          { error: 'Webhook processing failed' },
          { status: 500 }
        )
      }
    },
  )
}
