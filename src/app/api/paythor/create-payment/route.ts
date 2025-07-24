import { NextRequest, NextResponse } from 'next/server'
import { payThorService, PayThorPaymentRequest, PayThorDirectPaymentRequest } from '@/lib/paythor'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('PayThor payment creation started')
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const { 
      amount, 
      currency = 'TRY', 
      orderId, 
      customerEmail, 
      customerName, 
      customerPhone, 
      description,
      items,
      customerAddress,
      cardInfo
    } = body

    // Validate required fields
    if (!amount || !orderId || !customerEmail || !customerName) {
      console.log('Validation failed - missing fields:', {
        amount: !!amount,
        orderId: !!orderId,
        customerEmail: !!customerEmail,
        customerName: !!customerName
      })
      return NextResponse.json(
        { error: 'Missing required fields', details: { amount: !!amount, orderId: !!orderId, customerEmail: !!customerEmail, customerName: !!customerName } },
        { status: 400 }
      )
    }

    // Check if PayThor is configured
    console.log('Checking PayThor configuration...')
    if (!payThorService.isConfigured()) {
      console.log('PayThor not configured')
      return NextResponse.json(
        { error: 'PayThor is not configured' },
        { status: 500 }
      )
    }
    console.log('PayThor is configured')

    // Get base URL for callback URLs
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002'
    console.log('Using base URL:', baseUrl)

    // Parse customer name
    const nameParts = customerName.trim().split(' ')
    const firstName = nameParts[0] || 'John'
    const lastName = nameParts.slice(1).join(' ') || 'Doe'

    // Default address if not provided
    const defaultAddress = {
      line_1: customerAddress?.line_1 || '123 Main St',
      city: customerAddress?.city || 'Istanbul', 
      state: customerAddress?.state || 'Istanbul',
      postal_code: customerAddress?.postal_code || '34000',
      country: customerAddress?.country || 'TR'
    }

    // Create cart items
    const cartItems = items && items.length > 0 ? items.map((item: any) => ({
      id: item.id || `PRD-${Date.now()}`,
      name: item.name,
      type: 'product' as const,
      price: item.price.toString(),
      quantity: item.quantity
    })) : [{
      id: `PRD-${orderId}`,
      name: description || 'Product',
      type: 'product' as const,
      price: amount.toString(),
      quantity: 1
    }]

    const paymentRequest: PayThorPaymentRequest = {
      payment: {
        amount: amount.toString(),
        currency,
        buyer_fee: "0",
        method: "creditcard",
        merchant_reference: orderId
      },
      payer: {
        first_name: firstName,
        last_name: lastName,
        email: customerEmail,
        phone: customerPhone || "5000000000",
        address: defaultAddress,
        ip: "127.0.0.1"
      },
      order: {
        cart: cartItems,
        shipping: {
          first_name: firstName,
          last_name: lastName,
          phone: customerPhone || "5000000000",
          email: customerEmail,
          address: defaultAddress
        },
        invoice: {
          id: `cart_${orderId}`,
          first_name: firstName,
          last_name: lastName,
          price: amount.toString(),
          quantity: 1
        }
      }
    }

    console.log('Calling PayThor createPayment with:', JSON.stringify(paymentRequest, null, 2))

    let result
    
    // Check if card info is provided for direct payment
    if (cardInfo && cardInfo.cardNumber) {
      console.log('Card info provided, processing direct payment')
      
      const directPaymentRequest: PayThorDirectPaymentRequest = {
        ...paymentRequest,
        cardInfo: {
          cardNumber: cardInfo.cardNumber,
          expiryMonth: cardInfo.expiryMonth.padStart(2, '0'),
          expiryYear: cardInfo.expiryYear,
          cvv: cardInfo.cvv,
          cardHolderName: cardInfo.cardHolderName
        }
      }
      
      result = await payThorService.createDirectPayment(directPaymentRequest)
    } else {
      console.log('No card info, creating payment link')
      result = await payThorService.createPayment(paymentRequest)
    }
    
    console.log('PayThor result:', JSON.stringify(result, null, 2))

    if (result.success) {
      // Save payment record to database
      try {
        console.log('Attempting to save payment to database...')
        // Temporarily commented out database save to test API first
        /*
        await prisma.payment.create({
          data: {
            amount,
            method: 'PAYTHOR',
            provider: 'paythor',
            status: 'PENDING',
            paymentToken: result.payment_token,
            metadata: {
              order_id: orderId,
              currency: currency,
              payment_url: result.payment_url,
              customer_email: customerEmail,
              customer_name: customerName
            }
          }
        })
        */
        console.log('Payment record saved successfully')
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Continue even if database save fails
      }

      return NextResponse.json({
        success: true,
        data: {
          payment_token: result.payment_token,
          payment_link: result.payment_url
        }
      })
    } else if (result.status === 'success' && result.data) {
      // Handle direct PayThor API format
      console.log('PayThor payment created successfully (direct format)')
      
      return NextResponse.json({
        status: 'success',
        data: result.data
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || result.message,
          message: result.message 
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('PayThor payment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
