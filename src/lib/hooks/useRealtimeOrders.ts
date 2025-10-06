import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export function useRealtimeOrders() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to order table changes
    const channel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'order'
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('🔄 Real-time order change detected:', payload.eventType, payload.new)
          setRefreshTrigger(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return refreshTrigger
}
