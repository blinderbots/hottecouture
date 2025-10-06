'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugBoardPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runDebug = async () => {
      try {
        console.log('🔍 Debug: Starting board debug...')
        
        // Check environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        console.log('🔧 Environment variables:', {
          supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
          supabaseAnonKey: supabaseAnonKey ? 'Set' : 'Missing'
        })

        // Test Supabase client
        const supabase = createClient()
        console.log('✅ Supabase client created:', supabase)

        // Test simple query
        const { data, error } = await supabase
          .from('order')
          .select('id, order_number, status')
          .limit(5)

        console.log('📊 Query result:', { data, error })

        setDebugInfo({
          envVars: {
            supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
            supabaseAnonKey: supabaseAnonKey ? 'Set' : 'Missing'
          },
          supabaseClient: 'Created successfully',
          queryResult: { data, error }
        })

      } catch (err) {
        console.error('❌ Debug error:', err)
        setDebugInfo({
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      } finally {
        setLoading(false)
      }
    }

    runDebug()
  }, [])

  if (loading) {
    return <div className="p-8">Loading debug info...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Board Debug Info</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}
