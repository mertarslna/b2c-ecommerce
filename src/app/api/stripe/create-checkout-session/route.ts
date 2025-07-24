import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

interface OrderItem {
  name: string
  description?: string
  price: number // in cents
  quantity: number
  images?: string[]
}

interface CreateCheckoutSessionBody {
  orderId: string
  customerId?: string
  items: OrderItem[]
  customerEmail?: string
  successUrl?: string
  cancelUrl?: string
  metadata?: Record<string, string>
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'STRIPE_NOT_CONFIGURED',
            message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.'
          }
        },
        { status: 503 }
      )
    }

    const body: CreateCheckoutSessionBody = await request.json()
    
    const { 
      orderId, 
      customerId, 
      items, 
      customerEmail,
      successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
      cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      metadata = {}
    } = body

    // Validate required fields
    if (!orderId || !items || items.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Order ID and items are required'
          }
        },
        { status: 400 }
      )
    }

    // Validate items
    for (const item of items) {
      if (!item.name || !item.price || !item.quantity) {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'All items must have name, price, and quantity'
            }
          },
          { status: 400 }
        )
      }
    }

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
      price_data: {
        currency: 'try', // Turkish Lira
        product_data: {
          name: item.name,
          description: item.description,
          images: item.images || []
        },
        unit_amount: item.price // already in cents
      },
      quantity: item.quantity
    }))

    // Stripe Customer handling
    let customer: string | undefined = customerId
    if (!customer && customerEmail) {
      // Try to find existing customer or create new one
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      })
      
      if (customers.data.length > 0) {
        customer = customers.data[0].id
      } else {
        const newCustomer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            orderId: orderId
          }
        })
        customer = newCustomer.id
      }
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${cancelUrl}?order_id=${orderId}`,
      customer: customer,
      customer_email: !customer ? customerEmail : undefined,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['TR'] // Turkey only for now
      },
      metadata: {
        orderId: orderId,
        ...metadata
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      // Enable payment method options
      payment_intent_data: {
        metadata: {
          orderId: orderId,
          ...metadata
        },
        setup_future_usage: 'off_session' // Save payment method for future use
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        customerId: customer
      }
    })

  } catch (error) {
    console.error('Stripe Checkout Session creation error:', error)
    
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
          message: 'Failed to create checkout session'
        }
      },
      { status: 500 }
    )
  }
}
