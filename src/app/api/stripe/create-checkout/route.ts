import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { plan, articleId } = await request.json()
    
    // TODO: Implement Stripe checkout session
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'subscription',
    //   line_items: [{ price: plans[plan].priceId, quantity: 1 }],
    //   success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/article/${articleId}?subscribed=true`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/article/${articleId}`,
    // })
    
    return NextResponse.json({ 
      url: '/article/' + articleId + '?demo=true' 
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
