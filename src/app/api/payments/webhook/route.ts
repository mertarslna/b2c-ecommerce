// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Handle Paythor webhook notifications
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        
        console.log('🔔 Webhook received:', JSON.stringify(body, null, 2))

        // Verify webhook authenticity (if Paythor provides signature verification)
        const signature = request.headers.get('x-paythor-signature')
        if (!verifyWebhookSignature(body, signature)) {
            console.error('❌ Invalid webhook signature')
            return NextResponse.json(
                { success: false, error: 'Invalid signature' },
                { status: 401 }
            )
        }

        const {
            event_type,
            data: paymentData
        } = body

        if (!event_type || !paymentData) {
            return NextResponse.json(
                { success: false, error: 'Invalid webhook payload' },
                { status: 400 }
            )
        }

        // Find payment record by transaction ID (payment_token)
        const payment = await prisma.payment.findFirst({
            where: {
                transaction_id: paymentData.payment_token || paymentData.id?.toString()
            },
            include: {
                order: {
                    include: {
                        customer: {
                            include: {
                                user: {
                                    select: {
                                        first_name: true,
                                        last_name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!payment) {
            console.error('❌ Payment not found for token:', paymentData.payment_token)
            return NextResponse.json(
                { success: false, error: 'Payment not found' },
                { status: 404 }
            )
        }

        // Handle different event types
        switch (event_type) {
            case 'payment.completed':
            case 'payment.success':
                await handlePaymentSuccess(payment, paymentData)
                break

            case 'payment.failed':
            case 'payment.declined':
                await handlePaymentFailure(payment, paymentData)
                break

            case 'payment.cancelled':
                await handlePaymentCancellation(payment, paymentData)
                break

            case 'payment.refunded':
                await handlePaymentRefund(payment, paymentData)
                break

            case 'payment.pending':
                await handlePaymentPending(payment, paymentData)
                break

            default:
                console.log('🤷 Unhandled event type:', event_type)
                return NextResponse.json(
                    { success: true, message: 'Event acknowledged but not processed' }
                )
        }

        return NextResponse.json({
            success: true,
            message: 'Webhook processed successfully'
        })

    } catch (error) {
        console.error('Webhook Processing Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to process webhook',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// Handle successful payment
async function handlePaymentSuccess(payment: any, paymentData: any) {
    try {
        console.log('✅ Processing successful payment for order:', payment.order.id)

        // Update payment status
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'COMPLETED',
                payment_date: new Date(),
                transaction_id: paymentData.payment_token || paymentData.id?.toString(),
                updated_at: new Date()
            }
        })

        // Update order status
        await prisma.order.update({
            where: { id: payment.order_id },
            data: {
                status: 'PROCESSING',
                updated_at: new Date()
            }
        })

        // Update shipping status
        await prisma.shipping.updateMany({
            where: { order_id: payment.order_id },
            data: {
                status: 'PENDING',
                last_status_update: new Date()
            }
        })

        // Send confirmation email (optional)
        await sendPaymentConfirmationEmail(payment.order)

        console.log('✅ Payment success processed for order:', payment.order.id)

    } catch (error) {
        console.error('Error handling payment success:', error)
        throw error
    }
}

// Handle failed payment
async function handlePaymentFailure(payment: any, paymentData: any) {
    try {
        console.log('❌ Processing failed payment for order:', payment.order.id)

        // Update payment status
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'FAILED',
                updated_at: new Date()
            }
        })

        // Keep order in PENDING status for retry
        await prisma.order.update({
            where: { id: payment.order_id },
            data: {
                updated_at: new Date()
            }
        })

        // Send failure notification email (optional)
        await sendPaymentFailureEmail(payment.order, paymentData.decline_reason || 'Payment declined')

        console.log('❌ Payment failure processed for order:', payment.order.id)

    } catch (error) {
        console.error('Error handling payment failure:', error)
        throw error
    }
}

// Handle cancelled payment
async function handlePaymentCancellation(payment: any, paymentData: any) {
    try {
        console.log('🚫 Processing cancelled payment for order:', payment.order.id)

        // Update payment status
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'CANCELLED',
                updated_at: new Date()
            }
        })

        // Cancel order
        await prisma.order.update({
            where: { id: payment.order_id },
            data: {
                status: 'CANCELLED',
                updated_at: new Date()
            }
        })

        // Restore product stock
        const orderItems = await prisma.orderItem.findMany({
            where: { order_id: payment.order_id }
        })

        for (const item of orderItems) {
            await prisma.product.update({
                where: { id: item.product_id },
                data: {
                    stock: {
                        increment: item.quantity
                    }
                }
            })
        }

        console.log('🚫 Payment cancellation processed for order:', payment.order.id)

    } catch (error) {
        console.error('Error handling payment cancellation:', error)
        throw error
    }
}

// Handle payment refund
async function handlePaymentRefund(payment: any, paymentData: any) {
    try {
        console.log('💰 Processing refund for order:', payment.order.id)

        // Update payment status
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'REFUNDED',
                updated_at: new Date()
            }
        })

        // Update order status
        await prisma.order.update({
            where: { id: payment.order_id },
            data: {
                status: 'CANCELLED',
                updated_at: new Date()
            }
        })

        // Restore product stock
        const orderItems = await prisma.orderItem.findMany({
            where: { order_id: payment.order_id }
        })

        for (const item of orderItems) {
            await prisma.product.update({
                where: { id: item.product_id },
                data: {
                    stock: {
                        increment: item.quantity
                    }
                }
            })
        }

        // Send refund confirmation email (optional)
        await sendRefundConfirmationEmail(payment.order, paymentData.refund_amount)

        console.log('💰 Refund processed for order:', payment.order.id)

    } catch (error) {
        console.error('Error handling payment refund:', error)
        throw error
    }
}

// Handle pending payment
async function handlePaymentPending(payment: any, paymentData: any) {
    try {
        console.log('⏳ Processing pending payment for order:', payment.order.id)

        // Update payment status
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'PROCESSING',
                updated_at: new Date()
            }
        })

        console.log('⏳ Payment pending processed for order:', payment.order.id)

    } catch (error) {
        console.error('Error handling payment pending:', error)
        throw error
    }
}

// Verify webhook signature (implement based on Paythor's documentation)
function verifyWebhookSignature(payload: any, signature: string | null): boolean {
    // This is a placeholder - implement actual signature verification
    // based on Paythor's webhook security documentation
    
    if (!signature) {
        console.warn('⚠️ No signature provided, skipping verification')
        return true // In development, you might want to skip this
    }

    // Example implementation (replace with actual Paythor method):
    // const expectedSignature = crypto
    //     .createHmac('sha256', process.env.PAYTHOR_WEBHOOK_SECRET!)
    //     .update(JSON.stringify(payload))
    //     .digest('hex')
    
    // return signature === expectedSignature

    return true // Placeholder - implement actual verification
}

// Email notification functions (optional - implement as needed)
async function sendPaymentConfirmationEmail(order: any) {
    try {
        console.log('📧 Sending payment confirmation email for order:', order.id)
        // Implement email sending logic here
        // You can use services like SendGrid, AWS SES, or Nodemailer
    } catch (error) {
        console.error('Error sending confirmation email:', error)
    }
}

async function sendPaymentFailureEmail(order: any, reason: string) {
    try {
        console.log('📧 Sending payment failure email for order:', order.id)
        // Implement email sending logic here
    } catch (error) {
        console.error('Error sending failure email:', error)
    }
}

async function sendRefundConfirmationEmail(order: any, refundAmount: number) {
    try {
        console.log('📧 Sending refund confirmation email for order:', order.id)
        // Implement email sending logic here
    } catch (error) {
        console.error('Error sending refund email:', error)
    }
}