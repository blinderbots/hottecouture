import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateLabelSheetPDF } from '@/lib/labels/pdf-generator'
import { handleApiError } from '@/lib/api/error-handler'
import { logEvent } from '@/lib/api/event-logger'

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch order data with related information
    const { data: order, error: orderError } = await supabase
      .from('order')
      .select(`
        id,
        order_number,
        rush,
        created_at,
        client:client_id (
          first_name,
          last_name
        ),
        garments (
          id,
          type,
          label_code
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order has garments
    if (!order.garments || order.garments.length === 0) {
      return NextResponse.json(
        { error: 'No garments found for this order' },
        { status: 400 }
      )
    }

    // Prepare data for label generation
    const labelData = {
      orderNumber: order.order_number,
      clientName: `${order.client?.first_name || ''} ${order.client?.last_name || ''}`.trim(),
      garments: order.garments.map((garment: any) => ({
        id: garment.id,
        labelCode: garment.label_code || `GARM-${garment.id.slice(0, 8).toUpperCase()}`,
        type: garment.type,
      })),
      rush: order.rush,
      createdAt: order.created_at,
    }

    // Generate label sheet PDF
    const result = await generateLabelSheetPDF(labelData)

    // Log the event
    await logEvent({
      actor: user.id,
      entity: 'order',
      entity_id: orderId,
      action: 'generate_labels',
      details: {
        order_number: order.order_number,
        garment_count: order.garments.length,
        pdf_path: result.pdfPath,
      },
    })

    return NextResponse.json({
      success: true,
      pdfUrl: result.signedUrl,
      fileName: result.fileName,
      orderNumber: order.order_number,
      garmentCount: order.garments.length,
    })

  } catch (error) {
    return handleApiError(error, 'Failed to generate labels')
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId
    const supabase = createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch order data
    const { data: order, error: orderError } = await supabase
      .from('order')
      .select(`
        id,
        order_number,
        rush,
        created_at,
        client:client_id (
          first_name,
          last_name
        ),
        garments (
          id,
          type,
          label_code
        )
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.order_number,
        rush: order.rush,
        createdAt: order.created_at,
        client: order.client,
        garments: order.garments,
      },
    })

  } catch (error) {
    return handleApiError(error, 'Failed to fetch order data')
  }
}