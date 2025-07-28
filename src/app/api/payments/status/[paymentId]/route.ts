// app/api/payments/status/[paymentId]/route.ts - CORRECTED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Check payment status
export async function GET(
    request: NextRequest,
    { params }: { params: { paymentId: string } }
) {
    try {
        const paymentId = params.paymentId

        if (!paymentId) {
            return NextResponse.json(
                { success: false, error: 'Payment ID is required' },
                { status: 400 }
            )
        }

        // Find payment by ID or transaction ID
        const payment = await prisma.payment.findFirst({
            where: {
                OR: [
                    { id: paymentId },
                    { transaction_id: paymentId }
                ]
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
                        },
                        order_items: {
                            include: {
                                product: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!payment) {
            return NextResponse.json(
                { success: false, error: 'Payment not found' },
                { status: 404 }
            )
        }

        // Check with Paythor API for latest status (optional)
        let paythorStatus = null
        try {
            const paythorResponse = await fetch(`https://api.paythor.com/payment/${payment.transaction_id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.PAYTHOR_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            })

            if (paythorResponse.ok) {
                const paythorData = await paythorResponse.json()
                if (paythorData.status === 'success') {
                    paythorStatus = paythorData.data
                }
            }
        } catch (error) {
            console.warn('Could not fetch status from Paythor:', error)
        }

        // Prepare response
        const paymentStatus = {
            payment_id: payment.id,
            transaction_id: payment.transaction_id,
            amount: parseFloat(payment.amount.toString()),
            currency: 'TRY',
            method: payment.method,
            status: payment.status.toLowerCase(),
            created_at: payment.created_at.toISOString(),
            updated_at: payment.updated_at.toISOString(),
            payment_date: payment.payment_date?.toISOString(),
            
            // Order information
            order_info: {
                id: payment.order.id,
                order_number: payment.order.id.slice(-8),
                status: payment.order.status.toLowerCase(),
                total_amount: parseFloat(payment.order.total_amount.toString()),
                customer_name: `${payment.order.customer.user.first_name} ${payment.order.customer.user.last_name}`,
                customer_email: payment.order.customer.user.email,
                items_count: payment.order.order_items.length
            },
            
            // Status details
            status_details: getPaymentStatusDetails(payment.status),
            
            // Paythor information (if available)
            paythor_info: paythorStatus ? {
                gateway_status: paythorStatus.status,
                gateway_reference: paythorStatus.id,
                payment_link: paythorStatus.payment_link,
                expires_at: paythorStatus.date_due
            } : null,
            
            // Available actions
            available_actions: getAvailablePaymentActions(payment.status)
        }

        return NextResponse.json({
            success: true,
            data: paymentStatus
        })

    } catch (error) {
        console.error('Get Payment Status Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch payment status',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// PATCH - Update payment status manually (for admin use)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { paymentId: string } }
) {
    try {
        const paymentId = params.paymentId
        const body = await request.json()
        const { status, notes } = body

        if (!paymentId || !status) {
            return NextResponse.json(
                { success: false, error: 'Payment ID and status are required' },
                { status: 400 }
            )
        }

        const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED']
        if (!validStatuses.includes(status.toUpperCase())) {
            return NextResponse.json(
                { success: false, error: 'Invalid payment status' },
                { status: 400 }
            )
        }

        // Find payment
        const payment = await prisma.payment.findFirst({
            where: {
                OR: [
                    { id: paymentId },
                    { transaction_id: paymentId }
                ]
            },
            include: { order: true }
        })

        if (!payment) {
            return NextResponse.json(
                { success: false, error: 'Payment not found' },
                { status: 404 }
            )
        }

        // Update payment status
        const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: status.toUpperCase(),
                updated_at: new Date(),
                ...(status.toUpperCase() === 'COMPLETED' && !payment.payment_date && {
                    payment_date: new Date()
                })
            }
        })

        // Update order status based on payment status
        let newOrderStatus = payment.order.status
        if (status.toUpperCase() === 'COMPLETED' && payment.order.status === 'PENDING') {
            newOrderStatus = 'PROCESSING'
        } else if (['FAILED', 'CANCELLED'].includes(status.toUpperCase())) {
            newOrderStatus = 'CANCELLED'
        }

        if (newOrderStatus !== payment.order.status) {
            await prisma.order.update({
                where: { id: payment.order_id },
                data: { 
                    status: newOrderStatus,
                    updated_at: new Date()
                }
            })
        }

        return NextResponse.json({
            success: true,
            data: {
                payment_id: updatedPayment.id,
                old_status: payment.status,
                new_status: updatedPayment.status,
                order_status: newOrderStatus,
                updated_at: updatedPayment.updated_at.toISOString()
            },
            message: 'Payment status updated successfully'
        })

    } catch (error) {
        console.error('Update Payment Status Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update payment status',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// Helper function to get payment status details
function getPaymentStatusDetails(status: string): any {
    const statusDetails = {
        'PENDING': {
            description: 'Payment is awaiting completion',
            color: 'yellow',
            icon: '⏳',
            user_message: 'Please complete your payment to proceed with the order.'
        },
        'PROCESSING': {
            description: 'Payment is being processed',
            color: 'blue',
            icon: '⚙️',
            user_message: 'Your payment is being processed. Please wait.'
        },
        'COMPLETED': {
            description: 'Payment completed successfully',
            color: 'green',
            icon: '✅',
            user_message: 'Payment completed successfully. Your order is being prepared.'
        },
        'FAILED': {
            description: 'Payment failed or was declined',
            color: 'red',
            icon: '❌',
            user_message: 'Payment failed. Please try again or use a different payment method.'
        },
        'CANCELLED': {
            description: 'Payment was cancelled',
            color: 'gray',
            icon: '🚫',
            user_message: 'Payment was cancelled. You can retry payment if needed.'
        },
        'REFUNDED': {
            description: 'Payment was refunded',
            color: 'purple',
            icon: '💰',
            user_message: 'Payment has been refunded. Refund will appear in your account within 3-5 business days.'
        }
    }

    return statusDetails[status as keyof typeof statusDetails] || {
        description: 'Unknown payment status',
        color: 'gray',
        icon: '❓',
        user_message: 'Payment status is unknown. Please contact support.'
    }
}

// Helper function to get available actions based on payment status
function getAvailablePaymentActions(status: string): string[] {
    const actions = {
        'PENDING': ['cancel', 'retry'],
        'PROCESSING': ['check_status'],
        'COMPLETED': ['view_receipt', 'request_refund'],
        'FAILED': ['retry', 'change_method'],
        'CANCELLED': ['retry', 'new_payment'],
        'REFUNDED': ['view_refund_details']
    }

    return actions[status as keyof typeof actions] || []
}