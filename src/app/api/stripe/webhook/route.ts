import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      console.error('Stripe webhook: Stripe is not configured')
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      )
    }

    // Check if webhook secret is configured
    if (!webhookSecret) {
      console.error('Stripe webhook: STRIPE_WEBHOOK_SECRET is not configured')
      return NextResponse.json(
        { error: 'Webhook secret is not configured' },
        { status: 503 }
      )
    }

    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(checkoutSession)
        break

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent)
        break

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentFailed(failedPaymentIntent)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)
  
  try {
    const orderId = session.metadata?.orderId
    const customerId = session.customer as string
    const paymentIntentId = session.payment_intent as string

    if (!orderId) {
      console.error('No order ID found in session metadata')
      return
    }

    // TODO: Update order status in your database
    // Example:
    // await updateOrderStatus(orderId, 'PAID', {
    //   stripeSessionId: session.id,
    //   stripePaymentIntentId: paymentIntentId,
    //   stripeCustomerId: customerId,
    //   amount: session.amount_total,
    //   currency: session.currency
    // })

    // TODO: Send confirmation email to customer
    // await sendOrderConfirmationEmail(orderId, session.customer_details?.email)

    // TODO: Update inventory
    // await updateInventory(orderId)

    console.log(`Order ${orderId} marked as paid`)
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id)
  
  try {
    const orderId = paymentIntent.metadata?.orderId

    if (!orderId) {
      console.error('No order ID found in payment intent metadata')
      return
    }

    // TODO: Additional payment processing if needed
    console.log(`Payment for order ${orderId} succeeded`)
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id)
  
  try {
    const orderId = paymentIntent.metadata?.orderId

    if (!orderId) {
      console.error('No order ID found in payment intent metadata')
      return
    }

    // TODO: Update order status to failed
    // await updateOrderStatus(orderId, 'PAYMENT_FAILED', {
    //   stripePaymentIntentId: paymentIntent.id,
    //   failureReason: paymentIntent.last_payment_error?.message
    // })

    // TODO: Send payment failed notification
    // await sendPaymentFailedEmail(orderId)

    console.log(`Payment for order ${orderId} failed`)
  } catch (error) {
    console.error('Error handling payment intent failed:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id)
  
  try {
    // TODO: Handle subscription invoice payments
    console.log('Invoice payment processed')
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)
  
  try {
    // TODO: Handle new subscription
    console.log('Subscription processed')
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}
