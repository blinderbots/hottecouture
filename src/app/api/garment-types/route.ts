import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServiceRoleClient()
    
    const { data: garmentTypes, error } = await supabase
      .from('garment_type')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('is_common', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching garment types:', error)
      return NextResponse.json(
        { error: 'Failed to fetch garment types' },
        { status: 500 }
      )
    }

    // Group by category
    const groupedTypes: Record<string, any[]> = {}
    if (garmentTypes) {
      garmentTypes.forEach((type: any) => {
        if (type.category) {
          if (!groupedTypes[type.category]) {
            groupedTypes[type.category] = []
          }
          groupedTypes[type.category]!.push(type)
        }
      })
    }

    return NextResponse.json({
      success: true,
      garmentTypes: garmentTypes || [],
      groupedTypes,
      categories: {
        womens: 'Women\'s Clothing',
        mens: 'Men\'s Clothing',
        outerwear: 'Outerwear',
        formal: 'Formal Wear',
        activewear: 'Activewear',
        other: 'Other'
      }
    })
  } catch (error) {
    console.error('Error in garment types API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
