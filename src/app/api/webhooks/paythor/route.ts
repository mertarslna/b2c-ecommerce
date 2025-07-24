import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/services/payment.service'
import { PaymentStatus } from '@prisma/client'
import crypto from 'crypto'

/**
 * POST /api/webhooks/paythor
 * PayThor webhook events handler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paythor-signature')

    if (!signature) {
      console.error('PayThor webhook: Missing signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    if (!process.env.PAYTHOR_WEBHOOK_SECRET) {
      console.error('PayThor webhook: Missing webhook secret')
      return NextResponse.json(
        { error: 'Missing webhook secret' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.PAYTHOR_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('PayThor webhook: Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    console.log('PayThor webhook event:', event.type, event.id)

    // Handle different event types
    switch (event.type) {
      case 'payment.completed': {
        const payment = event.data
        const paymentId = payment.metadata?.paymentId

        if (paymentId) {
          await paymentService.completePayment(paymentId, payment.transactionId)
          console.log('PayThor payment completed:', paymentId)
        }
        break
      }

      case 'payment.failed': {
        const payment = event.data
        const paymentId = payment.metadata?.paymentId

        if (paymentId) {
          await paymentService.cancelPayment(paymentId, payment.failureReason || 'Payment failed')
          console.log('PayThor payment failed:', paymentId)
        }
        break
      }

      case 'payment.refunded': {
        const payment = event.data
        const paymentId = payment.metadata?.paymentId

        if (paymentId) {
          await paymentService.handleWebhook({
            paymentId,
            status: 'REFUNDED' as PaymentStatus,
            transactionId: payment.transactionId
          })
          console.log('PayThor payment refunded:', paymentId)
        }
        break
      }

      case 'payment.chargeback': {
        const payment = event.data
        const paymentId = payment.metadata?.paymentId

        if (paymentId) {
          // Handle chargeback
          console.log('PayThor chargeback for payment:', paymentId)
          // TODO: Implement chargeback handling logic
        }
        break
      }

      default:
        console.log('Unhandled PayThor webhook event:', event.type)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully' 
    })

  } catch (error) {
    console.error('PayThor webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
