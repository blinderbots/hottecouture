import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServiceRoleClient()
    
    // Test simple query
    const { data: orders, error } = await supabase
      .from('order')
      .select('id, order_number')
      .limit(1)
    
    console.log('Test API: Orders query result:', { orders, error })
    
    return NextResponse.json({ 
      success: true, 
      orders: orders || [],
      error: error?.message || null
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ 
      error: 'Test API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
