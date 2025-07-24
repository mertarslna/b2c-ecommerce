import { NextRequest, NextResponse } from 'next/server'
import { payThorService } from '@/lib/paythor'

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

    if (!payThorService.isConfigured()) {
      return NextResponse.json(
        { error: 'PayThor is not configured' },
        { status: 500 }
      )
    }

    const paymentStatus = await payThorService.getPaymentStatus(token)

    if (!paymentStatus) {
      return NextResponse.json(
        { error: 'Payment not found or error occurred' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: paymentStatus
    })
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
