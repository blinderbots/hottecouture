import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/api/error-handler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const lastName = searchParams.get('lastName')

    if (!phone || !lastName) {
      return NextResponse.json(
        { error: 'Phone and last name are required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Search for orders by phone and last name
    const { data: orders, error } = await supabase
      .from('order')
      .select(`
        id,
        order_number,
        status,
        due_date,
        rush,
        created_at,
        client:client_id (
          first_name,
          last_name,
          phone
        ),
        garments (
          id,
          type,
          label_code
        ),
        tasks (
          id,
          stage,
          assignee
        )
      `)
      .eq('client.phone', phone)
      .ilike('client.last_name', `%${lastName}%`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: 'No orders found for this phone number and last name' },
        { status: 404 }
      )
    }

    // Return the most recent order
    const order = orders[0]

    // Determine the current stage based on tasks
    let currentStage = 'pending'
    if (order.tasks && order.tasks.length > 0) {
      // Get the most advanced stage
      const stageOrder = ['pending', 'working', 'done', 'ready', 'delivered']
      const maxStageIndex = Math.max(
        ...order.tasks.map((task: any) => stageOrder.indexOf(task.stage))
      )
      currentStage = stageOrder[maxStageIndex] || 'pending'
    }

    const response = {
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        stage: currentStage,
        dueDate: order.due_date,
        rush: order.rush,
        client: order.client,
        garments: order.garments || [],
        tasks: order.tasks || [],
      },
      // Include additional orders if multiple found
      additionalOrders: orders.slice(1).map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        dueDate: o.due_date,
        rush: o.rush,
        createdAt: o.created_at,
      })),
    }

    return NextResponse.json(response)

  } catch (error) {
    return handleApiError(error, 'Failed to search orders')
  }
}
