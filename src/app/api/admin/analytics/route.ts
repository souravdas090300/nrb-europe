import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    // Group users by date
    const userGrowthMap = new Map<string, number>()
    users.forEach((u) => {
      const date = u.createdAt.toISOString().split('T')[0]
      userGrowthMap.set(date, (userGrowthMap.get(date) || 0) + 1)
    })
    const userGrowth = Array.from(userGrowthMap.entries()).map(
      ([date, count]) => ({ date, count })
    )

    // Get revenue data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: 'succeeded',
      },
      select: { createdAt: true, amount: true },
    })

    // Group revenue by month
    const revenueMap = new Map<string, number>()
    payments.forEach((p) => {
      const month = p.createdAt.toISOString().slice(0, 7)
      revenueMap.set(month, (revenueMap.get(month) || 0) + p.amount)
    })
    const revenue = Array.from(revenueMap.entries()).map(
      ([month, revenue]) => ({ month, revenue: revenue / 100 })
    )

    // Get subscription stats
    const subscriptionStats = await prisma.subscription.groupBy({
      by: ['plan', 'status'],
      _count: true,
    })

    // Get total counts
    const totalUsers = await prisma.user.count()
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'active' },
    })
    const totalRevenue =
      payments.reduce((sum, p) => sum + p.amount, 0) / 100
    const newsletterSubs = await prisma.newsletterSubscriber.count({
      where: { status: 'active' },
    })

    return NextResponse.json({
      userGrowth,
      revenue,
      subscriptionStats,
      totalUsers,
      activeSubscriptions,
      totalRevenue,
      newsletterSubs,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
