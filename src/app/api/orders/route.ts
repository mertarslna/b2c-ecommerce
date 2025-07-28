// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get customer orders
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const customerId = searchParams.get('customerId')

        if (!customerId) {
            return NextResponse.json(
                { success: false, error: 'Customer ID is required' },
                { status: 400 }
            )
        }

        const orders = await prisma.order.findMany({
            where: { customer_id: customerId },
            include: {
                order_items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { is_main: true },
                                    select: { path: true }
                                }
                            }
                        }
                    }
                },
                shipping_address: true,
                billing_address: true,
                payments: true,
                shippings: true
            },
            orderBy: { created_at: 'desc' }
        })

        // Transform orders to match frontend interface
        const transformedOrders = orders.map(order => ({
            id: order.id,
            date: order.order_date.toISOString().split('T')[0],
            status: order.status.toLowerCase(),
            total: parseFloat(order.total_amount.toString()),
            items: order.order_items.map(item => ({
                id: item.product.id,
                name: item.product.name,
                price: parseFloat(item.unit_price.toString()),
                quantity: item.quantity,
                image: item.product.images[0]?.path || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'
            })),
            shipping: {
                method: order.shippings[0]?.carrier || 'Standard Delivery',
                cost: parseFloat(order.shippings[0]?.shipping_cost.toString() || '0'),
                address: `${order.shipping_address.address_line1}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}`
            },
            payment: {
                method: order.payments[0]?.method || 'Credit Card',
                last4: order.payments[0]?.transaction_id?.slice(-4) || '****'
            },
            tracking: {
                number: order.shippings[0]?.tracking_number || `TRK${Date.now()}`,
                updates: generateTrackingUpdates(order)
            }
        }))

        return NextResponse.json({
            success: true,
            data: transformedOrders
        })

    } catch (error) {
        console.error('Get Orders Error:', error)
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to fetch orders',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// POST - Create new order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            customerId,
            items,
            shippingInfo,
            paymentInfo,
            shippingMethod,
            orderSummary
        } = body

        // Validation
        if (!customerId || !items || !shippingInfo || !orderSummary) {
            return NextResponse.json(
                { success: false, error: 'Missing required order information' },
                { status: 400 }
            )
        }

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Order must contain at least one item' },
                { status: 400 }
            )
        }

        // Get customer's user_id
        const customerProfile = await prisma.customerProfile.findUnique({
            where: { id: customerId },
            select: { user_id: true }
        })

        if (!customerProfile) {
            return NextResponse.json(
                { success: false, error: 'Customer profile not found' },
                { status: 404 }
            )
        }

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create shipping address
            const shippingAddress = await tx.address.create({
                data: {
                    user_id: customerProfile.user_id,
                    title: 'Shipping',
                    first_name: shippingInfo.firstName,
                    last_name: shippingInfo.lastName,
                    address_line1: shippingInfo.address,
                    city: shippingInfo.city,
                    state: shippingInfo.state || '',
                    postal_code: shippingInfo.zipCode,
                    country: shippingInfo.country,
                    phone: shippingInfo.phone || '',
                    is_default: false
                }
            })

            // 2. Create order
            const order = await tx.order.create({
                data: {
                    customer_id: customerId,
                    total_amount: orderSummary.total,
                    status: 'PENDING',
                    shipping_address_id: shippingAddress.id,
                    billing_address_id: shippingAddress.id // Using same address for billing
                }
            })

            // 3. Create order items and check stock
            for (const item of items) {
                // Check product exists and has enough stock
                const product = await tx.product.findUnique({
                    where: { id: item.id }
                })

                if (!product) {
                    throw new Error(`Product with ID ${item.id} not found`)
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`)
                }

                // Create order item
                await tx.orderItem.create({
                    data: {
                        order_id: order.id,
                        product_id: item.id,
                        quantity: item.quantity,
                        unit_price: item.price,
                        total_price: item.price * item.quantity
                    }
                })

                // Update product stock
                await tx.product.update({
                    where: { id: item.id },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                })
            }

            // 4. Create payment record (placeholder - actual payment will be handled by your friend)
            const payment = await tx.payment.create({
                data: {
                    order_id: order.id,
                    amount: orderSummary.total,
                    method: paymentInfo?.method?.toUpperCase() || 'CREDIT_CARD',
                    status: 'PENDING',
                    transaction_id: `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                }
            })

            // 5. Create shipping record
            const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
            const shipping = await tx.shipping.create({
                data: {
                    order_id: order.id,
                    customer_id: customerId,
                    seller_id: '550e8400-e29b-41d4-a716-446655440030', // Default seller from seed
                    shipping_address_id: shippingAddress.id,
                    tracking_number: trackingNumber,
                    carrier: getShippingCarrier(shippingMethod),
                    shipping_cost: orderSummary.shipping || 0,
                    status: 'PENDING',
                    estimated_delivery_date: calculateEstimatedDelivery(shippingMethod)
                }
            })

            return { order, payment, shipping, trackingNumber }
        }, {
            timeout: 10000 // 10 second timeout
        })

        // Clear cart after successful order (if it was a cart checkout)
        try {
            const cart = await prisma.cart.findUnique({
                where: { customer_id: customerId }
            })

            if (cart) {
                await prisma.cartItem.deleteMany({
                    where: { cart_id: cart.id }
                })
                
                await prisma.cart.update({
                    where: { id: cart.id },
                    data: { 
                        total_amount: 0,
                        updated_at: new Date()
                    }
                })
                console.log('✅ Cart cleared after order creation')
            }
        } catch (cartError) {
            console.error('⚠️ Failed to clear cart after order:', cartError)
            // Don't fail the order if cart clearing fails
        }

        return NextResponse.json({
            success: true,
            data: {
                orderId: result.order.id,
                trackingNumber: result.trackingNumber,
                total: parseFloat(result.order.total_amount.toString()),
                status: result.order.status
            },
            message: 'Order created successfully'
        }, { status: 201 })

    } catch (error) {
        console.error('Create Order Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create order',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// Helper function to generate tracking updates based on order status
function generateTrackingUpdates(order: any) {
    const updates = []
    const orderDate = new Date(order.created_at)
    
    // Always add order placed
    updates.push({
        date: orderDate.toISOString().split('T')[0],
        status: 'Order Placed',
        description: 'Order received and being processed'
    })

    // Add status-based updates
    if (order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
        const processingDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000) // +1 day
        updates.push({
            date: processingDate.toISOString().split('T')[0],
            status: 'Processing',
            description: 'Order is being prepared for shipment'
        })
    }

    if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
        const shippedDate = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000) // +2 days
        updates.push({
            date: shippedDate.toISOString().split('T')[0],
            status: 'Shipped',
            description: 'Package has been shipped and is in transit'
        })
    }

    if (order.status === 'DELIVERED') {
        const deliveredDate = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000) // +5 days
        updates.push({
            date: deliveredDate.toISOString().split('T')[0],
            status: 'Delivered',
            description: 'Package delivered successfully'
        })
    }

    return updates.reverse() // Most recent first
}

// Helper function to get shipping carrier based on method
function getShippingCarrier(shippingMethod?: string): string {
    const carriers = {
        'standard': 'Standard Delivery',
        'express': 'Express Delivery',
        'overnight': 'Overnight Delivery'
    }
    
    return carriers[shippingMethod as keyof typeof carriers] || 'Standard Delivery'
}

// Helper function to calculate estimated delivery date
function calculateEstimatedDelivery(shippingMethod?: string): Date {
    const now = new Date()
    const daysToAdd = {
        'standard': 7,    // 5-7 business days
        'express': 3,     // 2-3 business days  
        'overnight': 1    // 1 business day
    }
    
    const days = daysToAdd[shippingMethod as keyof typeof daysToAdd] || 7
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
}