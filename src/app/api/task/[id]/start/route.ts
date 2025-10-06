import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  withErrorHandling, 
  getCorrelationId, 
  logEvent, 
  validateRequest,
  UnauthorizedError,
  NotFoundError,
  ConflictError
} from '@/lib/api/error-handler'
import { taskStartSchema, TaskResponse } from '@/lib/dto'

async function handleTaskStart(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<TaskResponse> {
  const correlationId = getCorrelationId(request)
    const supabase = await createClient()
  
  // Validate authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new UnauthorizedError('Authentication required')
  }
  
  // Parse and validate request body
  const body = await request.json()
  validateRequest(taskStartSchema, body, correlationId)
  
  const taskId = params.id

  // Get current user ID
  const userId = user.id

  // Check if task exists
  const { data: task, error: taskError } = await supabase
    .from('task')
    .select('id, garment_id, operation, assignee, is_active, started_at')
    .eq('id', taskId)
    .single()

  if (taskError || !task) {
    throw new NotFoundError('Task', correlationId)
  }

  // Check if task is already active
  if ((task as any).is_active) {
    throw new ConflictError('Task is already active', correlationId)
  }

  // Check if user has any other active tasks
  const { data: activeTasks, error: activeTasksError } = await supabase
    .from('task')
    .select('id, operation')
    .eq('assignee', userId)
    .eq('is_active', true)

  if (activeTasksError) {
    throw new Error(`Failed to check active tasks: ${activeTasksError.message}`)
  }

  if (activeTasks && activeTasks.length > 0) {
    throw new ConflictError(
      `User already has an active task: ${(activeTasks as any[])[0].operation}`,
      correlationId
    )
  }

  // Start the task
  const now = new Date().toISOString()
  const { error: updateError } = await (supabase as any)
    .from('task')
    .update({
      assignee: userId,
      is_active: true,
      started_at: now,
      stage: 'working',
    })
    .eq('id', taskId)

  if (updateError) {
    throw new Error(`Failed to start task: ${updateError.message}`)
  }

  // Log the event
  await logEvent('task', taskId, 'started', {
    correlationId,
    assignee: userId,
    operation: (task as any).operation,
    garmentId: (task as any).garment_id,
  })

  const response: TaskResponse = {
    taskId,
    status: 'started',
    message: `Task "${(task as any).operation}" started successfully`,
  }

  return response
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(() => handleTaskStart(request, { params }), request)
}
