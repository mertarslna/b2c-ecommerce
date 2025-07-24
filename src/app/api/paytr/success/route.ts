import { NextRequest, NextResponse } from 'next/server'
import { paytrService } from '@/lib/paytr'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const postData: Record<string, string> = {}
    
    formData.forEach((value, key) => {
      postData[key] = value.toString()
    })

    console.log('PayTR Success Callback:', postData)

    // Verify the callback
    if (!paytrService.verifyCallback(postData)) {
      console.error('PayTR callback verification failed')
      return NextResponse.json(
        { error: 'Invalid callback verification' },
        { status: 400 }
      )
    }

    const {
      merchant_oid: orderId,
      status,
      total_amount,
      payment_type,
      installment_count
    } = postData

    // Update order status in database
    if (status === 'success') {
      try {
        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'PROCESSING'
          }
        })

        // Create payment record
        await prisma.payment.create({
          data: {
            order_id: orderId,
            amount: parseFloat(total_amount) / 100, // Kuruştan TL'ye çevir
            method: 'CREDIT_CARD',
            status: 'COMPLETED',
            transaction_id: `paytr_${orderId}_${Date.now()}`,
            payment_date: new Date()
          }
        })

        console.log(`Order ${orderId} marked as paid via PayTR`)
      } catch (dbError) {
        console.error('Database update error:', dbError)
        // PayTR'a başarılı döndük ama DB güncellenemedi
        return new Response('OK', { status: 200 })
      }
    }

    // PayTR'a başarılı yanıt döndür
    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('PayTR success callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET route for redirect after payment
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orderId = searchParams.get('merchant_oid')
  
  if (orderId) {
    // Redirect to success page
    return NextResponse.redirect(new URL(`/checkout/success?order_id=${orderId}`, request.url))
  }
  
  return NextResponse.redirect(new URL('/checkout/success', request.url))
}
