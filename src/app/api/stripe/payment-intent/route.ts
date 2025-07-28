import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set')
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { amount, currency, orderId, customerEmail, metadata } = body

    if (!amount || !currency) {
      return NextResponse.json({ success: false, error: { message: 'Amount and currency are required' } }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      metadata: {
        orderId: orderId || '',
        ...metadata
      },
      receipt_email: customerEmail,
      description: `Order #${orderId}`,
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({ success: true, data: { clientSecret: paymentIntent.client_secret } })
  } catch (error: any) {
    console.error('Stripe PaymentIntent error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Stripe error' } }, { status: 500 })
  }
}
