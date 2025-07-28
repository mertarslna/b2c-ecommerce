// app/api/payments/retry/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Retry failed payment
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { paymentId, paymentMethod = 'creditcard' } = body

        if (!paymentId) {
            return NextResponse.json(
                { success: false, error: 'Payment ID is required' },
                { status: 400 }
            )
        }

        // Find the failed payment
        const failedPayment = await prisma.payment.findFirst({
            where: {
                OR: [
                    { id: paymentId },
                    { transaction_id: paymentId }
                ],
                status: { in: ['FAILED', 'CANCELLED'] }
            },
            include: {
                order: {
                    include: {
                        order_items: {
                            include: {
                                product: { select: { name: true, price: true } }
                            }
                        },
                        customer: {
                            include: {
                                user: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                        email: true,
                                        phone: true
                                    }
                                }
                            }
                        },
                        shipping_address: true,
                        billing_address: true
                    }
                }
            }
        })

        if (!failedPayment) {
            return NextResponse.json(
                { success: false, error: 'Failed payment not found or payment is not retryable' },
                { status: 404 }
            )
        }

        // Create new payment attempt
        const retryPayment = await prisma.payment.create({
            data: {
                order_id: failedPayment.order_id,
                amount: failedPayment.amount,
                method: paymentMethod.toUpperCase() as any,
                status: 'PENDING',
                transaction_id: `RETRY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
        })

        // Mark old payment as superseded
        await prisma.payment.update({
            where: { id: failedPayment.id },
            data: {
                status: 'CANCELLED',
                updated_at: new Date()
            }
        })

        // Call payment creation endpoint to get new Paythor payment
        const createPaymentResponse = await fetch(`${request.nextUrl.origin}/api/payments/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: failedPayment.order_id,
                paymentMethod: paymentMethod
            })
        })

        const createPaymentResult = await createPaymentResponse.json()

        if (!createPaymentResult.success) {
            // Revert the retry payment if creation failed
            await prisma.payment.update({
                where: { id: retryPayment.id },
                data: { status: 'FAILED' }
            })

            return NextResponse.json(
                { success: false, error: createPaymentResult.error },
                { status: 400 }
            )
        }

        // Update retry payment with Paythor details
        await prisma.payment.update({
            where: { id: retryPayment.id },
            data: {
                transaction_id: createPaymentResult.data.payment_token
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                payment_id: retryPayment.id,
                payment_token: createPaymentResult.data.payment_token,
                payment_link: createPaymentResult.data.payment_link,
                amount: parseFloat(retryPayment.amount.toString()),
                currency: 'TRY',
                retry_attempt: true,
                original_payment_id: failedPayment.id
            },
            message: 'Payment retry created successfully'
        })

    } catch (error) {
        console.error('Retry Payment Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to retry payment',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}