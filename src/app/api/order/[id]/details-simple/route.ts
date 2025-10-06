import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    
    return NextResponse.json({ 
      success: true, 
      orderId,
      message: 'Simple route working'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Simple route failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
