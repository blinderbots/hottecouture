import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    console.log('🔍 Simple Labels API: Looking for order ID:', orderId);

    const supabase = await createServiceRoleClient();

    // Get order with basic info
    const { data: order, error: orderError } = await supabase
      .from('order')
      .select('id, order_number, rush, created_at, status, due_date, client_id')
      .eq('id', orderId)
      .single();

    console.log('🔍 Simple Labels API: Order query result:', {
      order,
      orderError,
    });

    if (orderError) {
      console.error('❌ Simple Labels API: Order query failed:', orderError);
      return NextResponse.json(
        {
          error: 'Order query failed',
          details: orderError.message,
          orderId,
        },
        { status: 500 }
      );
    }

    if (!order) {
      console.warn('❌ Simple Labels API: Order not found for ID:', orderId);
      return NextResponse.json(
        { error: 'Order not found', orderId },
        { status: 404 }
      );
    }

    // Fetch garments for this order
    const { data: garments, error: garmentsError } = await supabase
      .from('garment')
      .select('id, type, label_code')
      .eq('order_id', orderId);

    console.log('🔍 Simple Labels API: Garments query result:', {
      garments,
      garmentsError,
    });

    if (garmentsError) {
      console.error(
        '❌ Simple Labels API: Garments query failed:',
        garmentsError
      );
      return NextResponse.json(
        {
          error: 'Failed to fetch garments',
          details: garmentsError.message,
        },
        { status: 500 }
      );
    }

    // Fetch client data
    const { data: client, error: clientError } = await supabase
      .from('client')
      .select('first_name, last_name')
      .eq('id', (order as any).client_id)
      .single();

    console.log('🔍 Simple Labels API: Client query result:', {
      client,
      clientError,
    });

    if (clientError) {
      console.error('❌ Simple Labels API: Client query failed:', clientError);
      return NextResponse.json(
        {
          error: 'Failed to fetch client data',
          details: clientError.message,
        },
        { status: 500 }
      );
    }

    // Return simple data without PDF generation
    return NextResponse.json({
      success: true,
      order: {
        id: (order as any).id,
        orderNumber: (order as any).order_number,
        rush: (order as any).rush,
        createdAt: (order as any).created_at,
        status: (order as any).status,
        dueDate: (order as any).due_date,
        client: client,
        garments: garments,
      },
      message: 'Order data fetched successfully (simplified version)',
    });
  } catch (error) {
    console.error('❌ Simple Labels API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
