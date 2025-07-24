import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer']
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get payment intent details
    const paymentIntent = session.payment_intent as Stripe.PaymentIntent
    
    const paymentDetails = {
      paymentId: session.id,
      orderId: session.metadata?.orderId || 'N/A',
      amount: session.amount_total || 0,
      currency: session.currency || 'try',
      status: session.payment_status,
      method: paymentIntent?.payment_method_types?.[0] || 'card',
      createdAt: new Date(session.created * 1000).toISOString(),
      customerEmail: session.customer_email || session.customer_details?.email,
      customerName: session.customer_details?.name,
      paymentIntentId: paymentIntent?.id
    }

    return NextResponse.json({
      success: true,
      data: paymentDetails
    })

  } catch (error) {
    console.error('Stripe session retrieval error:', error)
    
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
          message: 'Failed to retrieve session details'
        }
      },
      { status: 500 }
    )
  }
}
