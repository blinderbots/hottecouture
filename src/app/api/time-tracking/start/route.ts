import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { taskId, userId } = await request.json()

    if (!taskId || !userId) {
      return NextResponse.json({ error: 'Task ID and User ID are required' }, { status: 400 })
    }

    // Stop any currently active tasks for this user
    const { error: stopError } = await (supabase as any)
      .from('task')
      .update({ 
        is_active: false,
        stopped_at: new Date().toISOString()
      })
      .eq('assignee', userId)
      .eq('is_active', true)

    if (stopError) {
      console.error('Error stopping active tasks:', stopError)
    }

    // Start the new task
    const { data: task, error: startError } = await (supabase as any)
      .from('task')
      .update({
        is_active: true,
        started_at: new Date().toISOString(),
        stage: 'working'
      })
      .eq('id', taskId)
      .eq('assignee', userId)
      .select()
      .single()

    if (startError) {
      console.error('Error starting task:', startError)
      return NextResponse.json({ error: 'Failed to start task' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      task,
      message: 'Task started successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}