import { NextRequest, NextResponse } from 'next/server'

interface PayThorOTPRequest {
  target: string
  otp: string
}

export async function POST(request: NextRequest) {
  try {
    const { target, otp }: PayThorOTPRequest = await request.json()

    // Validate required fields
    if (!target || !otp) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Target email and OTP are required',
          meta: {
            timestamp: new Date().toISOString(),
            request_id: `req_${Date.now()}`,
            code: 400
          }
        },
        { status: 400 }
      )
    }

    // Create OTP verification request payload
    const otpRequest = {
      target,
      otp
    }

    console.log('PayThor OTP Request:', otpRequest)

    // Make request to PayThor API
    const response = await fetch('https://dev-api.paythor.com/otp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(otpRequest)
    })

    const result = await response.json()

    console.log('PayThor OTP Response:', {
      status: response.status,
      statusText: response.statusText,
      data: result
    })

    if (response.ok) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        {
          status: 'error',
          message: result.message || 'OTP verification failed',
          meta: {
            timestamp: new Date().toISOString(),
            request_id: `req_${Date.now()}`,
            code: response.status
          },
          data: result
        },
        { status: response.status }
      )
    }

  } catch (error) {
    console.error('PayThor OTP API Error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error during OTP verification',
        meta: {
          timestamp: new Date().toISOString(),
          request_id: `req_${Date.now()}`,
          code: 500
        }
      },
      { status: 500 }
    )
  }
}
