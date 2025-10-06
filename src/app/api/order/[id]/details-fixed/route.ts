import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // For now, let's return the enhanced data structure
    // This will show you what the enhanced features will look like
    const orderId = params.id
    
    return NextResponse.json({ 
      success: true, 
      order: {
        id: orderId,
        order_number: 5,
        client_name: "Raj Singh",
        client_phone: "2043334440",
        client_email: null,
        client_language: "en",
        client_notes: "VIP customer - prefers rush service",
        type: "alteration",
        status: "pending",
        rush: false,
        rush_fee_type: null,
        due_date: "2025-10-06",
        created_at: "2025-10-04T21:47:01.203212+00:00",
        rack_position: null,
        subtotal_cents: 7500,
        tax_cents: 900,
        total_cents: 8400,
        rush_fee_cents: 0,
        deposit_cents: 0,
        balance_due_cents: 8400,
        work_started_at: null,
        work_completed_at: null,
        actual_work_minutes: 0,
        notes: {
          measurements: "dfadfadf",
          specialInstructions: "dfadfa"
        },
        garments: [{
          id: "07b9b64f-31d4-4b26-9ba3-97aee00d5c71",
          type: "Dress Shirt",
          color: "Blue",
          brand: "Calvin Klein",
          notes: "Customer wants sleeves shortened by 1 inch",
          label_code: "GARM-N7OLMPWQ",
          photo_path: "garment-photo-123.jpg",
          measurements: {
            chest: "42 inches",
            waist: "38 inches", 
            sleeve_length: "25 inches",
            shoulder_width: "18 inches"
          },
          garment_type: {
            id: "shirt-001",
            name: "Dress Shirt",
            icon: "👔",
            category: "mens"
          },
          services: [{
            id: "gs-0",
            quantity: 1,
            custom_price_cents: null,
            notes: "Customer specifically requested 1 inch shorter",
            service: {
              id: "123e4567-e89b-12d3-a456-426614174000",
              name: "Basic Alteration",
              description: "General alteration work",
              base_price_cents: 5000,
              category: "alteration",
              estimated_minutes: 60
            }
          }, {
            id: "gs-1", 
            quantity: 1,
            custom_price_cents: null,
            notes: "Rush job - customer needs by tomorrow",
            service: {
              id: "d4e022b7-8296-4119-acb7-1b3fa3730b30",
              name: "Lengthen Sleeves",
              description: "Lengthen sleeve length",
              base_price_cents: 2500,
              category: "alteration", 
              estimated_minutes: 45
            }
          }]
        }],
        time_tracking: {
          total_estimated_minutes: 105,
          total_actual_minutes: 0,
          is_tracking: false,
          estimated_time: "1h 45m",
          actual_time: "0h 0m"
        }
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
