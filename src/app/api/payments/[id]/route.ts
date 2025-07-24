import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/services/payment.service'
import { z } from 'zod'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/payments/[id]
 * Belirli bir ödeme bilgisini getirir
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    
    // Validate payment ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PAYMENT_ID',
            message: 'Valid payment ID required'
          }
        },
        { status: 400 }
      )
    }
    
    // Get payment
    const result = await paymentService.getPayment(id)
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    })
    
  } catch (error) {
    console.error('Get payment API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Sunucu hatası'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/payments/[id]
 * Ödeme durumunu günceller
 */
const updatePaymentSchema = z.object({
  action: z.enum(['complete', 'cancel', 'refund']),
  transactionId: z.string().optional(),
  amount: z.number().positive().optional(),
  reason: z.string().optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Validate request
    const validatedData = updatePaymentSchema.parse(body)
    
    let result
    
    switch (validatedData.action) {
      case 'complete':
        result = await paymentService.completePayment(id, validatedData.transactionId)
        break
        
      case 'cancel':
        result = await paymentService.cancelPayment(id, validatedData.reason)
        break
        
      case 'refund':
        result = await paymentService.refundPayment(id, validatedData.amount, validatedData.reason)
        break
        
      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_ACTION',
              message: 'Geçersiz işlem'
            }
          },
          { status: 400 }
        )
    }
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    })
    
  } catch (error) {
    console.error('Update payment API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Geçersiz veri',
            details: error.errors
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
          message: 'Sunucu hatası'
        }
      },
      { status: 500 }
    )
  }
}
