export const plans = {
  monthly: {
    name: 'Monthly Access',
    price: 4.99,
    priceId: 'price_monthly_placeholder', // Replace with actual Stripe price ID
    features: [
      'Ad-free experience',
      'Exclusive articles',
      'Early access to news',
      'Newsletter subscription',
    ],
  },
  yearly: {
    name: 'Annual Access',
    price: 49.99,
    priceId: 'price_yearly_placeholder', // Replace with actual Stripe price ID
    features: [
      'All monthly features',
      'Save 16%',
      'Priority support',
      'Digital magazine access',
    ],
  },
  premium: {
    name: 'Premium',
    price: 9.99,
    priceId: 'price_premium_placeholder', // Replace with actual Stripe price ID
    features: [
      'All yearly features',
      'Live Q&A with editors',
      'Community access',
      'Custom news alerts',
    ],
  },
}

export type PlanKey = keyof typeof plans
