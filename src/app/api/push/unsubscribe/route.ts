import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json()
    
    // TODO: Remove subscription from database
    // await db.pushSubscriptions.delete({ where: { endpoint } })
    
    console.log('Push subscription removed:', endpoint)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push unsubscribe error:', error)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
}
