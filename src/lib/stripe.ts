/**
 * @file stripe.ts — Stripe billing integration
 *
 * Handles subscription checkout, customer management, and plan configuration
 * for the NRB Europe premium subscription system.
 *
 * Environment:
 *  - `STRIPE_SECRET_KEY`        — Stripe secret API key
 *  - `STRIPE_MONTHLY_PRICE_ID`  — Stripe Price ID for monthly plan ($10)
 *  - `STRIPE_YEARLY_PRICE_ID`   — Stripe Price ID for yearly plan ($100)
 *  - `STRIPE_WEBHOOK_SECRET`    — Webhook signing secret (used in webhook route)
 *
 * @see {@link src/app/api/stripe/create-checkout/route.ts} for checkout flow
 * @see {@link src/app/api/stripe/webhook/route.ts} for webhook handling
 */

import Stripe from 'stripe'
import { prisma } from './prisma'

/** Singleton Stripe SDK instance */
let _stripe: Stripe | null = null

/**
 * Lazily initialise and return the Stripe SDK client.
 * Throws if `STRIPE_SECRET_KEY` is not configured.
 */
export function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return _stripe
}

/**
 * Backwards-compatible Stripe proxy.
 * @deprecated Use `getStripe()` directly for explicit initialisation.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop]
  },
})

/**
 * Subscription plan definitions.
 * Each plan maps to a Stripe Price object via its `priceId`.
 * Amounts are in the smallest currency unit (cents for USD).
 */
export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 1000, // $10.00
    name: 'Monthly',
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    amount: 10000, // $100.00
    name: 'Yearly',
  },
}

/**
 * Get or create a Stripe Customer for the given user.
 * Stores the `stripeCustomerId` on the User record so subsequent
 * checkouts reuse the same Stripe Customer.
 *
 * @param userId - Internal NRB Europe user ID
 * @param email  - User's email (used when creating a new Stripe Customer)
 * @returns The Stripe Customer ID (e.g. `cus_xxxxx`)
 */
export const getStripeCustomer = async (userId: string, email: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId
  }

  const customer = await getStripe().customers.create({
    email,
    metadata: { userId },
  })

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}
