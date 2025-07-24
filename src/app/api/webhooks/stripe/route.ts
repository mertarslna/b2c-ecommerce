import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { paymentService } from '@/lib/services/payment.service'
import { headers } from 'next/headers'

/**
 * POST /api/webhooks/stripe
 * Stripe webhook events handler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Stripe webhook: Missing signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe webhook: Missing webhook secret')
      return NextResponse.json(
        { error: 'Missing webhook secret' },
        { status: 500 }
      )
    }

    // Verify webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Stripe webhook: Invalid signature', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Stripe webhook event:', event.type, event.id)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const paymentId = paymentIntent.metadata?.paymentId

        if (paymentId) {
          await paymentService.completePayment(paymentId, paymentIntent.id)
          console.log('Payment completed:', paymentId)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const paymentId = paymentIntent.metadata?.paymentId

        if (paymentId) {
          await paymentService.cancelPayment(paymentId, 'Payment failed')
          console.log('Payment failed:', paymentId)
        }
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object
        const paymentIntentId = dispute.payment_intent
        
        // Handle dispute (chargeback)
        console.log('Dispute created for payment intent:', paymentIntentId)
        // TODO: Implement dispute handling logic
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        console.log('Invoice payment succeeded:', invoice.id)
        // TODO: Handle subscription payments if needed
        break
      }

      case 'payment_method.attached': {
        const paymentMethod = event.data.object
        console.log('Payment method attached:', paymentMethod.id)
        // TODO: Handle saved payment methods
        break
      }

      default:
        console.log('Unhandled Stripe webhook event:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
