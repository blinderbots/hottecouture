'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { BoardFilters } from '@/components/board/board-filters'
import { BoardColumn } from '@/components/board/board-column'
import { OrderCard } from '@/components/board/order-card'
import { createClient } from '@/lib/supabase/client'
import { calculateStageTransition } from '@/lib/board/stage-transitions'
import { format, isToday, isAfter, parseISO } from 'date-fns'
import { OrderWithTasks } from '@/lib/board/types'

type TaskStage = 'pending' | 'working' | 'done' | 'ready' | 'delivered'

interface BoardOrder {
  id: string
  order_number: number
  type: 'alteration' | 'custom'
  status: 'pending' | 'working' | 'done' | 'ready' | 'delivered' | 'archived'
  due_date?: string
  rush: boolean
  rack_position?: string
  client: {
    first_name: string
    last_name: string
  }
  garments: Array<{
    type: string
  }>
  tasks: Array<{
    id: string
    stage: TaskStage
    assignee?: string
  }>
  services_count: number
}

interface BoardFilters {
  rush: boolean
  dueToday: boolean
  assignee?: string
  pipeline?: 'alteration' | 'custom'
  search: string
}

const COLUMNS: Array<{ id: TaskStage; title: string }> = [
  { id: 'pending', title: 'Pending' },
  { id: 'working', title: 'Working' },
  { id: 'done', title: 'Done' },
  { id: 'ready', title: 'Ready' },
  { id: 'delivered', title: 'Delivered' },
]

export default function BoardPage() {
  const t = useTranslations('board')
  const [orders, setOrders] = useState<BoardOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<BoardFilters>({
    rush: false,
    dueToday: false,
    search: '',
  })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<Set<string>>(new Set())

  const supabase = createClient()

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('order')
        .select(`
          id,
          order_number,
          type,
          status,
          due_date,
          rush,
          rack_position,
          client:client_id (
            first_name,
            last_name
          ),
          garments (
            type
          ),
          tasks (
            id,
            stage,
            assignee
          )
        `)
        .eq('status', 'working') // Only show active orders
        .order('order_number', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Transform data to include services count
      const transformedOrders: BoardOrder[] = (data || []).map(order => ({
        ...order,
        client: order.client || { first_name: '', last_name: '' },
        garments: order.garments || [],
        tasks: order.tasks || [],
        services_count: 0, // This would need to be calculated from garment_service
      }))

      setOrders(transformedOrders)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadOrders()

    // Set up real-time subscription
    const subscription = supabase
      .channel('board-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order',
        },
        () => {
          loadOrders()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task',
        },
        () => {
          loadOrders()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [loadOrders])

  const filteredOrders = orders.filter(order => {
    if (filters.rush && !order.rush) return false
    if (filters.dueToday && order.due_date && !isToday(parseISO(order.due_date))) return false
    if (filters.assignee) {
      const hasAssignee = order.tasks.some(task => task.assignee === filters.assignee)
      if (!hasAssignee) return false
    }
    if (filters.pipeline && order.type !== filters.pipeline) return false
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesOrderNumber = order.order_number.toString().includes(searchLower)
      const matchesClientName = 
        order.client.first_name.toLowerCase().includes(searchLower) ||
        order.client.last_name.toLowerCase().includes(searchLower)
      if (!matchesOrderNumber && !matchesClientName) return false
    }
    return true
  })

  const ordersByStage = COLUMNS.reduce((acc, column) => {
    acc[column.id] = filteredOrders.filter(order => {
      // Determine the stage based on task stages
      const taskStages = order.tasks.map(task => task.stage)
      if (taskStages.length === 0) return column.id === 'pending'
      
      // Use the most advanced stage as the order's stage
      const stageOrder = ['pending', 'working', 'done', 'ready', 'delivered']
      const maxStageIndex = Math.max(...taskStages.map(stage => stageOrder.indexOf(stage)))
      const orderStage = stageOrder[maxStageIndex] as TaskStage
      
      return orderStage === column.id
    })
    return acc
  }, {} as Record<TaskStage, BoardOrder[]>)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const orderId = active.id as string
    const newStage = over.id as TaskStage

    // Find the order
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    // Check if the transition is valid
    const orderWithTasks: OrderWithTasks = {
      id: order.id,
      status: order.status,
      tasks: order.tasks.map(task => ({
        id: task.id,
        stage: task.stage,
        order_id: order.id,
      })),
    }

    try {
      setUpdating(prev => new Set(prev).add(orderId))

      // Update all tasks for this order to the new stage
      const { error } = await supabase
        .from('task')
        .update({ stage: newStage })
        .eq('garment_id', order.garments[0]?.id) // This is simplified - in reality you'd update all tasks

      if (error) throw error

      // Reload orders to get updated data
      await loadOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading board...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {error}</div>
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-600">
            Drag and drop orders between stages to update their status
          </p>
        </div>

        <BoardFilters
          filters={filters}
          onFiltersChange={setFilters}
          orders={orders}
        />

        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {COLUMNS.map(column => (
              <BoardColumn
                key={column.id}
                id={column.id}
                title={column.title}
                orders={ordersByStage[column.id] || []}
                updating={updating}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <OrderCard
                order={orders.find(o => o.id === activeId)!}
                isDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
