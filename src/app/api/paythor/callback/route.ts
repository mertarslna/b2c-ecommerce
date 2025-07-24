import { NextRequest, NextResponse } from 'next/server'
import { payThorService } from '@/lib/paythor'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify callback signature
    const isValid = payThorService.verifyCallback(body)
    if (!isValid) {
      console.error('Invalid PayThor callback signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const { 
      payment_token, 
      status, 
      order_id, 
      transaction_id,
      amount 
    } = body

    if (!payment_token || !status || !order_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update payment status in database
    try {
      const payment = await prisma.payment.findFirst({
        where: {
          paymentToken: payment_token,
          orderId: order_id
        }
      })

      if (!payment) {
        console.error('Payment not found:', { payment_token, order_id })
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        )
      }

      // Convert PayThor status to our status format
      let paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
      switch (status.toLowerCase()) {
        case 'success':
        case 'completed':
          paymentStatus = 'COMPLETED'
          break
        case 'failed':
        case 'error':
          paymentStatus = 'FAILED'
          break
        default:
          paymentStatus = 'PENDING'
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus,
          transaction_id: transaction_id
        }
      })

      // If payment is completed, update order status
      if (paymentStatus === 'COMPLETED' && payment.order_id) {
        await prisma.order.update({
          where: { id: payment.order_id },
          data: { status: 'PROCESSING' }
        })
      }

      console.log('PayThor callback processed:', {
        payment_token,
        order_id,
        status: paymentStatus
      })

      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error('Database error in PayThor callback:', dbError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('PayThor callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
