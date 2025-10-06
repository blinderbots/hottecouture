import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateMeasurements } from '@/lib/measurements/measurement-types'
import { logEvent } from '@/lib/api/error-handler'

export async function POST(request: NextRequest) {
  try {
    const { orderId, garmentId, measurements, takenBy } = await request.json()

    if (!orderId || !garmentId || !measurements || !takenBy) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, garmentId, measurements, takenBy' },
        { status: 400 }
      )
    }

    // Validate measurements
    const validation = validateMeasurements(measurements)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid measurements', details: validation.errors },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Save measurements to database
    const { data, error } = await (supabase as any)
      .from('measurements')
      .insert({
        order_id: orderId,
        garment_id: garmentId,
        taken_by: takenBy,
        measurements: measurements,
        taken_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving measurements:', error)
      return NextResponse.json(
        { error: 'Failed to save measurements' },
        { status: 500 }
      )
    }

    await logEvent('measurements', data.id, 'created', {
      orderId,
      garmentId,
      takenBy,
      pointCount: measurements.points.length
    })

    return NextResponse.json({
      success: true,
      measurementId: data.id,
      measurements: data.measurements
    })

  } catch (error) {
    console.error('Error in measurements API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const garmentId = searchParams.get('garmentId')

    const supabase = await createClient()

    let query = supabase.from('measurements').select('*')

    if (orderId) {
      query = query.eq('order_id', orderId)
    }

    if (garmentId) {
      query = query.eq('garment_id', garmentId)
    }

    const { data, error } = await query.order('taken_at', { ascending: false })

    if (error) {
      console.error('Error fetching measurements:', error)
      return NextResponse.json(
        { error: 'Failed to fetch measurements' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      measurements: data || []
    })

  } catch (error) {
    console.error('Error in measurements GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
