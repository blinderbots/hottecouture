'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BoardOrder, TaskStage } from './types'

export function useBoardData() {
  const [orders, setOrders] = useState<BoardOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<Set<string>>(new Set())

  const supabase = createClient()
  
  console.log('🔧 Board data hook initialized, Supabase client:', supabase)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Fetching orders from Supabase...')

      // Fetch orders with related data
      const { data: ordersData, error: ordersError } = await supabase
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
            id,
            type
          ),
          tasks (
            id,
            stage,
            assignee
          )
        `)
        .order('created_at', { ascending: false }) as any

      console.log('📊 Orders query result:', { ordersData, ordersError })

      if (ordersError) {
        throw new Error(`Failed to fetch orders: ${ordersError.message}`)
      }

      // Transform the data to match our BoardOrder interface
      const transformedOrders: BoardOrder[] = ordersData?.map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        type: order.type,
        status: order.status,
        due_date: order.due_date,
        rush: order.rush,
        rack_position: order.rack_position,
        client_name: `${order.client?.first_name || ''} ${order.client?.last_name || ''}`.trim() || 'Unknown Client',
        client: {
          first_name: order.client?.first_name || '',
          last_name: order.client?.last_name || ''
        },
        garments: order.garments || [],
        tasks: order.tasks || [],
        services_count: order.garments?.reduce((count: number, _garment: any) => {
          // This would need to be calculated based on garment_services
          // For now, we'll use a placeholder
          return count + 1
        }, 0) || 0
      })) || []

      console.log('✅ Transformed orders:', transformedOrders)
      setOrders(transformedOrders)
    } catch (err) {
      console.error('❌ Error fetching orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const updateOrderStage = useCallback(async (orderId: string, newStage: TaskStage) => {
    try {
      setUpdating(prev => new Set(prev).add(orderId))

      // Update all tasks for this order to the new stage
      const { error: tasksError } = await (supabase as any)
        .from('task')
        .update({ stage: newStage })
        .eq('order_id', orderId)

      if (tasksError) {
        throw new Error(`Failed to update tasks: ${tasksError.message}`)
      }

      // Update order status based on stage
      let newOrderStatus = 'pending'
      if (newStage === 'working') {
        newOrderStatus = 'in_progress'
      } else if (newStage === 'done') {
        newOrderStatus = 'completed'
      } else if (newStage === 'ready') {
        newOrderStatus = 'ready'
      } else if (newStage === 'delivered') {
        newOrderStatus = 'delivered'
      }

      const { error: orderError } = await (supabase as any)
        .from('order')
        .update({ status: newOrderStatus as any })
        .eq('id', orderId)

      if (orderError) {
        throw new Error(`Failed to update order: ${orderError.message}`)
      }

      // Refresh the data
      await fetchOrders()
    } catch (err) {
      console.error('Error updating order stage:', err)
      setError(err instanceof Error ? err.message : 'Failed to update order stage')
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }, [supabase, fetchOrders])

  const assignOrder = useCallback(async (orderId: string, assignee: string) => {
    try {
      setUpdating(prev => new Set(prev).add(orderId))

      // Update all tasks for this order to assign them to the user
      const { error } = await (supabase as any)
        .from('task')
        .update({ assignee })
        .eq('order_id', orderId)

      if (error) {
        throw new Error(`Failed to assign order: ${error.message}`)
      }

      // Refresh the data
      await fetchOrders()
    } catch (err) {
      console.error('Error assigning order:', err)
      setError(err instanceof Error ? err.message : 'Failed to assign order')
    } finally {
      setUpdating(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }, [supabase, fetchOrders])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    updating,
    updateOrderStage,
    assignOrder,
    refetch: fetchOrders
  }
}
