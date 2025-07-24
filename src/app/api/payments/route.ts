import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/services/payment.service'
import { z } from 'zod'

// Validation schema for payment creation
const createPaymentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().optional().default('TRY'),
  method: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'STRIPE', 'PAYTHOR']),
  customerId: z.string().uuid(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

/**
 * POST /api/payments
 * Create new payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    const validatedData = createPaymentSchema.parse(body)
    
    // Create payment
    const result = await paymentService.createPayment(validatedData)
    
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
    console.error('Payment creation API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid data',
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
          message: 'Server error'
        }
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments
 * Get payments list (admin or user's own payments)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const orderId = searchParams.get('orderId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // TODO: Add authentication and authorization check
    
    // Simple response for now
    return NextResponse.json({
      success: true,
      data: {
        payments: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      }
    })
    
  } catch (error) {
    console.error('Get payments API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Server error'
        }
      },
      { status: 500 }
    )
  }
}
