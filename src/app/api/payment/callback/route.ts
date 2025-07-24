import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('PayThor Callback received:', body)
    
    const merchantReference = body.merchant_reference
    const paymentStatus = body.status || body.payment_status || 'unknown'
    
    if (!merchantReference) {
      console.error('Merchant reference not found in callback')
      return new NextResponse('Merchant reference not found', { status: 400 })
    }
    
    // Burada sipariş durumunu güncelleme logic'inizi yazabilirsiniz
    // Örnek: database'de merchant_reference ile siparişi bulup statusunu güncellemek
    
    console.log('Payment Status Updated:', {
      merchant_reference: merchantReference,
      payment_status: paymentStatus
    })
    
    // PayThor'a başarılı response döndür
    return new NextResponse('OK', { status: 200 })
    
  } catch (error) {
    console.error('PayThor Callback Error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}

// GET method'u da ekleyelim (bazı sistemler GET ile callback gönderebilir)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const merchantReference = searchParams.get('merchant_reference')
    const paymentStatus = searchParams.get('status') || searchParams.get('payment_status') || 'unknown'
    
    console.log('PayThor GET Callback received:', {
      merchant_reference: merchantReference,
      payment_status: paymentStatus
    })
    
    if (!merchantReference) {
      return new NextResponse('Merchant reference not found', { status: 400 })
    }
    
    return new NextResponse('OK', { status: 200 })
    
  } catch (error) {
    console.error('PayThor GET Callback Error:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
