'use client'

import { useState, useEffect } from 'react'

export default function BoardWorkingPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use fetch to call our API instead of direct Supabase
        const response = await fetch('/api/test-supabase-simple')
        const data = await response.json()

        if (data.success) {
          setOrders(data.data || [])
        } else {
          setError(data.error || 'Failed to load orders')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Working Board</h1>
        <div className="text-lg">Loading orders...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Working Board</h1>
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Working Board</h1>
      
      <div className="mb-4">
        <p>Found {orders.length} orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="p-4 border rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
            <p className="text-sm text-gray-600">ID: {order.id}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
