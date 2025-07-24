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

    console.log('PayTR Fail Callback:', postData)

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
      failed_reason_code,
      failed_reason_msg
    } = postData

    // Update order status in database
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED'
        }
      })

      // Create failed payment record
      await prisma.payment.create({
        data: {
          order_id: orderId,
          amount: 0,
          method: 'CREDIT_CARD',
          status: 'FAILED',
          transaction_id: `paytr_failed_${orderId}_${Date.now()}`,
          payment_date: new Date()
        }
      })

      console.log(`Order ${orderId} marked as failed via PayTR: ${failed_reason_msg}`)
    } catch (dbError) {
      console.error('Database update error:', dbError)
    }

    // PayTR'a başarılı yanıt döndür
    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('PayTR fail callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET route for redirect after failed payment
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orderId = searchParams.get('merchant_oid')
  
  if (orderId) {
    // Redirect to failure page
    return NextResponse.redirect(new URL(`/checkout/failed?order_id=${orderId}`, request.url))
  }
  
  return NextResponse.redirect(new URL('/checkout/failed', request.url))
}
