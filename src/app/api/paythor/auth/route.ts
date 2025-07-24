import { NextRequest, NextResponse } from 'next/server'

interface PayThorAuthRequest {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const { email, password }: PayThorAuthRequest = await request.json()

    const authRequest = {
      auth_query: {
        auth_method: "email_password_panel",
        email,
        password,
        program_id: 1,
        app_id: 102,
        store_url: "https://ornekmagaza.com"
      }
    }

    const response = await fetch('https://dev-api.paythor.com/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authRequest)
    })

    const result = await response.json()

    if (response.ok) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { 
          status: 'error',
          message: result.message || 'Authentication failed',
          error: result.error
        },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('PayThor auth API error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
