import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/test
 * Simple test endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Payment API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      payments: '/api/payments',
      test: '/api/test'
    }
  })
}

/**
 * POST /api/test
 * Test POST endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'POST test successful',
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid JSON'
    }, { status: 400 })
  }
}
