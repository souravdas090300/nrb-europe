import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

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
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

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
        await prisma.payment.create({
          data: {
            userId:
              (
                await prisma.subscription.findFirst({
                  where: {
                    stripeSubscriptionId: invoice.subscription as string,
                  },
                })
              )?.userId || '',
            stripePaymentIntentId: invoice.payment_intent as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: 'succeeded',
            description: `Invoice ${invoice.number}`,
          },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
