import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

interface CreatePaymentIntentBody {
  amount: number // in cents
  currency?: string
  customerId?: string
  description?: string
  metadata?: Record<string, string>
  paymentMethodTypes?: string[]
  setupFutureUsage?: 'off_session' | 'on_session'
  receiptEmail?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { 
          error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
          code: 'STRIPE_NOT_CONFIGURED'
        },
        { status: 503 }
      )
    }
    
    const body: CreatePaymentIntentBody = await request.json()
    
    const { 
      amount,
      currency = 'try',
      customerId,
      description,
      metadata = {},
      setupFutureUsage,
      receiptEmail
    } = body

    // Validate required fields
    if (!amount || amount < 50) { // Minimum 50 cents for TRY
      return NextResponse.json(
        { error: 'Amount must be at least 50 cents' },
        { status: 400 }
      )
    }

    // Create PaymentIntent
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true
      }
    }

    // Add optional parameters
    if (customerId) {
      paymentIntentParams.customer = customerId
    }

    if (description) {
      paymentIntentParams.description = description
    }

    if (setupFutureUsage) {
      paymentIntentParams.setup_future_usage = setupFutureUsage
    }

    if (receiptEmail) {
      paymentIntentParams.receipt_email = receiptEmail
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      }
    })

  } catch (error) {
    console.error('Stripe PaymentIntent creation error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: error.code,
            message: error.message,
            type: error.type
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create payment intent'
        }
      },
      { status: 500 }
    )
  }
}

// Retrieve PaymentIntent
export async function GET(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { 
          error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
          code: 'STRIPE_NOT_CONFIGURED'
        },
        { status: 503 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent_id')
    const clientSecret = searchParams.get('client_secret')

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      )
    }

    const retrieveParams: Stripe.PaymentIntentRetrieveParams = {}
    
    if (clientSecret) {
      retrieveParams.client_secret = clientSecret
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId,
      retrieveParams
    )

    return NextResponse.json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
        clientSecret: paymentIntent.client_secret
      }
    })

  } catch (error) {
    console.error('Stripe PaymentIntent retrieval error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: error.code,
            message: error.message,
            type: error.type
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve payment intent'
        }
      },
      { status: 500 }
    )
  }
}
