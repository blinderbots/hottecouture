import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get active task for this user
    const { data: activeTask, error } = await supabase
      .from('task')
      .select(`
        id,
        operation,
        started_at,
        actual_minutes,
        garment:garment_id (
          type,
          label_code
        )
      `)
      .eq('assignee', userId)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching active task:', error)
      return NextResponse.json({ error: 'Failed to fetch active task' }, { status: 500 })
    }

    if (!activeTask) {
      return NextResponse.json({ 
        success: true, 
        activeTask: null,
        message: 'No active task'
      })
    }

    // Calculate current session time
    const startTime = new Date((activeTask as any).started_at)
    const currentTime = new Date()
    const sessionMinutes = Math.round((currentTime.getTime() - startTime.getTime()) / (1000 * 60))

    return NextResponse.json({ 
      success: true, 
      activeTask: {
        ...(activeTask as any),
        sessionMinutes
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}