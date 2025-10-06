import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    const supabase = await createClient()
    
    // Test basic connection
    const { data, error } = await supabase
      .from('order')
      .select('id, order_number')
      .limit(1)
    
    console.log('Supabase test result:', { data, error })
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: data || [],
      message: 'Supabase connection successful'
    })
    
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
