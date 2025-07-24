import { NextRequest, NextResponse } from 'next/server'
import { paytrService } from '@/lib/paytr'

export async function POST(request: NextRequest) {
  try {
    // Check if PayTR is configured
    if (!paytrService.isConfigured()) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'PAYTR_NOT_CONFIGURED',
            message: 'PayTR is not configured. Please set PayTR environment variables.'
          }
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const {
      orderId,
      email,
      amount,
      userName,
      userAddress,
      userPhone,
      items
    } = body

    // Get user IP
    const forwardedFor = request.headers.get('x-forwarded-for')
    const userIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1'

    // Validate required fields
    if (!orderId || !email || !amount || !userName || !userAddress || !userPhone || !items || items.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'All fields are required: orderId, email, amount, userName, userAddress, userPhone, items'
          }
        },
        { status: 400 }
      )
    }

    // Create PayTR payment token
    const result = await paytrService.createPaymentToken({
      orderId,
      email,
      amount,
      userIp,
      userName,
      userAddress,
      userPhone,
      items
    })

    if (result.success && result.token) {
      return NextResponse.json({
        success: true,
        data: {
          token: result.token,
          iframeUrl: `https://www.paytr.com/odeme/guvenli/${result.token}`
        }
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'PAYTR_ERROR',
            message: result.error || 'Failed to create PayTR token'
          }
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('PayTR token creation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error'
        }
      },
      { status: 500 }
    )
  }
}
