import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('PayThor login API çağrısı:', { email, password: '***' });

    // PayThor API'ye login isteği gönder
    const paythorResponse = await fetch(`${process.env.PAYTHOR_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYTHOR_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    console.log('PayThor API yanıtı:', paythorResponse.status);

    if (!paythorResponse.ok) {
      const errorData = await paythorResponse.text();
      console.error('PayThor login hatası:', errorData);
      
      return NextResponse.json(
        { 
          error: 'Login failed',
          message: 'E-posta veya şifre hatalı',
          details: errorData 
        },
        { status: 401 }
      );
    }

    const data = await paythorResponse.json();
    console.log('PayThor login başarılı, token alındı');

    return NextResponse.json({
      success: true,
      token: data.token || data.access_token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('PayThor login API hatası:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Sunucu hatası',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
