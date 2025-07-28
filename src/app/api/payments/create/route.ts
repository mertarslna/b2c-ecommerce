// app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Create payment with Paythor
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            orderId,
            paymentMethod = 'creditcard',
            returnUrl,
            cancelUrl
        } = body

        if (!orderId) {
            return NextResponse.json(
                { success: false, error: 'Order ID is required' },
                { status: 400 }
            )
        }

        // Get order details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                order_items: {
                    include: {
                        product: {
                            select: { name: true, price: true }
                        }
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
                billing_address: true,
                shippings: {
                    select: { shipping_cost: true }
                }
            }
        })

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            )
        }

        // Check if payment already exists and is completed
        const existingPayment = await prisma.payment.findFirst({
            where: {
                order_id: orderId,
                status: 'COMPLETED'
            }
        })

        if (existingPayment) {
            return NextResponse.json(
                { success: false, error: 'Payment already completed for this order' },
                { status: 409 }
            )
        }

        // Calculate order totals
        const subtotal = parseFloat(order.total_amount.toString())
        const shippingCost = order.shippings[0]?.shipping_cost ? parseFloat(order.shippings[0].shipping_cost.toString()) : 0
        const tax = subtotal * 0.1 // 10% tax
        const total = subtotal + shippingCost + tax

        // Prepare cart items for Paythor
        const cartItems = []

        // Add product items
        order.order_items.forEach(item => {
            cartItems.push({
                id: item.product_id,
                name: item.product.name,
                type: 'product',
                price: parseFloat(item.unit_price.toString()).toFixed(2),
                quantity: item.quantity
            })
        })

        // Add shipping if applicable
        if (shippingCost > 0) {
            cartItems.push({
                id: 'SHIP-' + orderId.slice(-8),
                name: 'Shipping',
                type: 'shipping',
                price: shippingCost.toFixed(2),
                quantity: 1
            })
        }

        // Add tax
        if (tax > 0) {
            cartItems.push({
                id: 'TAX-' + orderId.slice(-8),
                name: 'Tax (10%)',
                type: 'tax',
                price: tax.toFixed(2),
                quantity: 1
            })
        }

        // Prepare Paythor payment request
        const paythorRequest = {
            payment: {
                amount: total.toFixed(2),
                currency: 'TRY',
                buyer_fee: '0',
                method: paymentMethod,
                merchant_reference: orderId
            },
            payer: {
                first_name: order.customer.user.first_name,
                last_name: order.customer.user.last_name,
                email: order.customer.user.email,
                phone: order.customer.user.phone?.replace(/[^\d]/g, '') || '5000000000', // Clean phone number
                address: {
                    line_1: order.billing_address.address_line1,
                    city: order.billing_address.city,
                    state: order.billing_address.state,
                    postal_code: order.billing_address.postal_code,
                    country: order.billing_address.country === 'Turkey' ? 'TR' : order.billing_address.country
                },
                ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
            },
            order: {
                cart: cartItems,
                shipping: {
                    first_name: order.shipping_address.first_name,
                    last_name: order.shipping_address.last_name,
                    phone: order.shipping_address.phone?.replace(/[^\d]/g, '') || '5000000000',
                    email: order.customer.user.email,
                    address: {
                        line_1: order.shipping_address.address_line1,
                        city: order.shipping_address.city,
                        state: order.shipping_address.state,
                        postal_code: order.shipping_address.postal_code,
                        country: order.shipping_address.country === 'Turkey' ? 'TR' : order.shipping_address.country
                    }
                },
                invoice: {
                    id: 'INV-' + orderId.slice(-8),
                    first_name: order.customer.user.first_name,
                    last_name: order.customer.user.last_name,
                    price: total.toFixed(2),
                    quantity: 1
                }
            }
        }

        // Call Paythor API
        const paythorResponse = await fetch('https://api.paythor.com/payment/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYTHOR_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paythorRequest)
        })

        const paythorResult = await paythorResponse.json()

        if (paythorResult.status !== 'success') {
            console.error('Paythor API Error:', paythorResult)
            
            // Create failed payment record
            await prisma.payment.create({
                data: {
                    order_id: orderId,
                    amount: total,
                    method: paymentMethod.toUpperCase() as any,
                    status: 'FAILED',
                    transaction_id: `FAILED_${Date.now()}`,
                    payment_date: new Date()
                }
            })

            return NextResponse.json(
                { 
                    success: false, 
                    error: paythorResult.message || 'Payment processing failed',
                    details: paythorResult.details || []
                },
                { status: 400 }
            )
        }

        // Create pending payment record in database
        const payment = await prisma.payment.create({
            data: {
                order_id: orderId,
                amount: total,
                method: paymentMethod.toUpperCase() as any,
                status: 'PENDING',
                transaction_id: paythorResult.data.payment_token,
                payment_date: new Date()
            }
        })

        // Update order status to awaiting payment
        await prisma.order.update({
            where: { id: orderId },
            data: { 
                status: 'PENDING',
                updated_at: new Date()
            }
        })

        // Return payment details
        return NextResponse.json({
            success: true,
            data: {
                payment_id: payment.id,
                payment_token: paythorResult.data.payment_token,
                payment_link: paythorResult.data.payment_link,
                amount: total,
                currency: 'TRY',
                status: 'pending',
                merchant_reference: orderId,
                expires_at: paythorResult.data.date_due,
                return_url: returnUrl,
                cancel_url: cancelUrl,
                paythor_data: paythorResult.data
            },
            message: 'Payment created successfully'
        }, { status: 201 })

    } catch (error) {
        console.error('Create Payment Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create payment',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}