import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { taskId, userId } = await request.json()

    if (!taskId || !userId) {
      return NextResponse.json({ error: 'Task ID and User ID are required' }, { status: 400 })
    }

    // Get the current task to calculate time spent
    const { data: currentTask, error: getError } = await supabase
      .from('task')
      .select('started_at, actual_minutes')
      .eq('id', taskId)
      .eq('assignee', userId)
      .eq('is_active', true)
      .single()

    if (getError || !currentTask) {
      return NextResponse.json({ error: 'Active task not found' }, { status: 404 })
    }

    // Calculate time spent
    const startTime = new Date((currentTask as any).started_at)
    const endTime = new Date()
    const timeSpentMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    const totalMinutes = ((currentTask as any).actual_minutes || 0) + timeSpentMinutes

    // Stop the task and update time
    const { data: task, error: stopError } = await (supabase as any)
      .from('task')
      .update({
        is_active: false,
        stopped_at: endTime.toISOString(),
        actual_minutes: totalMinutes
      })
      .eq('id', taskId)
      .eq('assignee', userId)
      .select()
      .single()

    if (stopError) {
      console.error('Error stopping task:', stopError)
      return NextResponse.json({ error: 'Failed to stop task' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      task,
      timeSpent: timeSpentMinutes,
      totalTime: totalMinutes,
      message: 'Task stopped successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}