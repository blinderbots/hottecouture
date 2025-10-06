'use client'

import { useState, useEffect } from 'react'

export default function BoardImmediatePage() {
  const [result, setResult] = useState<string>('Initializing...')

  useEffect(() => {
    const testSupabase = async () => {
      try {
        setResult('Testing Supabase...')
        
        // Test if we can import the client
        const { createClient } = await import('@/lib/supabase/client')
        setResult('Client imported successfully')
        
        // Test if we can create the client
        const supabase = createClient()
        setResult('Client created successfully')
        
        // Test if we can make a query
        const { data, error } = await supabase
          .from('order')
          .select('id, order_number')
          .limit(1)
        
        if (error) {
          setResult('Query error: ' + error.message)
        } else {
          setResult('Success! Found ' + (data?.length || 0) + ' orders')
        }
      } catch (err) {
        setResult('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
      }
    }

    testSupabase()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Board Immediate Test</h1>
      <div className="p-4 bg-gray-100 rounded">
        <strong>Result:</strong> {result}
      </div>
    </div>
  )
}
