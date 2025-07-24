import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/services/payment.service'

/**
 * POST /api/payment/paythor/create
 * PayThor ödeme oluşturma endpoint'i
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, customerId, description } = body

    if (!orderId || !amount || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, customerId' },
        { status: 400 }
      )
    }

    console.log('PayThor payment creation request:', { orderId, amount, customerId })

    const result = await paymentService.createPayment({
      orderId,
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'TRY',
      method: 'PAYTHOR',
      customerId,
      description: description || `Payment for order ${orderId}`
    })

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        paymentId: result.data.paymentId,
        paymentUrl: result.data.paymentUrl,
        merchantReference: result.data.merchantReference
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || 'Payment creation failed'
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('PayThor payment creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
