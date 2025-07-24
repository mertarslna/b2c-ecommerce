import { NextRequest, NextResponse } from 'next/server'
import { payThorAPI } from '@/lib/paythor-api'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json(
        { error: 'Payment token is required' },
        { status: 400 }
      )
    }

    if (!payThorAPI.isAuthenticated()) {
      return NextResponse.json(
        { error: 'PayThor authentication required' },
        { status: 401 }
      )
    }

    const result = await payThorAPI.getPaymentStatus(token)

    if (result.status === 'success' && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data
      })
    } else {
      return NextResponse.json(
        { error: result.message || 'Payment status check failed' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('PayThor payment status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
