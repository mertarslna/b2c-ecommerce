import { NextRequest, NextResponse } from 'next/server'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    // Token'ı header'dan al (client-side'dan gönderilen)
    const authHeader = request.headers.get('authorization')
    console.log('Auth header received:', authHeader)
    
    let token = null
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7) // "Bearer " kısmını çıkar
    }
    
    if (!token) {
      console.log('No token found in header - PayThor authentication required')
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'PayThor authentication required. Please login first at /paythor-login' 
        },
        { status: 401, headers: corsHeaders }
      )
    }

    console.log('Token found in header, proceeding with payment creation')

    // Request body'yi al
    const paymentData = await request.json()
    console.log('PayThor proxy - received payment data:', paymentData)

    // PayThor API'ye direkt token ile istek gönder
    const response = await fetch(`${process.env.PAYTHOR_BASE_URL || 'https://dev-api.paythor.com'}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    })

    const paymentResponse = await response.json()
    console.log('PayThor proxy - API response:', paymentResponse)

    if (!response.ok) {
      throw new Error(`PayThor API Error: ${response.status} - ${paymentResponse.message || paymentResponse.error || 'Unknown error'}`)
    }

    return NextResponse.json(paymentResponse, { 
      status: 200, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('PayThor proxy error:', error)
    
    let errorMessage = 'Payment creation failed'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message
      // PayThor API hatalarını kontrol et
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        statusCode = 401
      } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
        statusCode = 400
      }
    }

    return NextResponse.json(
      { 
        status: 'error', 
        message: errorMessage 
      },
      { status: statusCode, headers: corsHeaders }
    )
  }
}