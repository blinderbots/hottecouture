import { NextRequest, NextResponse } from 'next/server'
import { getTimeTrackingStats } from '@/lib/time-tracking/time-tracking'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') as 'today' | 'week' | 'month' | 'all' || 'all'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const stats = await getTimeTrackingStats(userId, period)

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error getting time tracking stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get time tracking stats' },
      { status: 500 }
    )
  }
}
