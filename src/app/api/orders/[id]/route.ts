// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get specific order details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const orderId = params.id

        if (!orderId) {
            return NextResponse.json(
                { success: false, error: 'Order ID is required' },
                { status: 400 }
            )
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                order_items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { is_main: true },
                                    select: { path: true }
                                },
                                category: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                },
                shipping_address: true,
                billing_address: true,
                payments: {
                    orderBy: { created_at: 'desc' }
                },
                shippings: {
                    orderBy: { created_at: 'desc' }
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
                }
            }
        })

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            )
        }

        // Transform order to detailed format
        const transformedOrder = {
            id: order.id,
            order_date: order.order_date.toISOString(),
            status: order.status.toLowerCase(),
            total_amount: parseFloat(order.total_amount.toString()),
            
            // Customer information
            customer: {
                name: `${order.customer.user.first_name} ${order.customer.user.last_name}`,
                email: order.customer.user.email,
                phone: order.customer.user.phone
            },
            
            // Order items
            items: order.order_items.map(item => ({
                id: item.product.id,
                name: item.product.name,
                category: item.product.category.name,
                price: parseFloat(item.unit_price.toString()),
                quantity: item.quantity,
                total: parseFloat(item.total_price.toString()),
                image: item.product.images[0]?.path || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
                delivered_at: item.delivered_at?.toISOString() || null
            })),
            
            // Shipping information
            shipping: {
                address: {
                    name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
                    company: order.shipping_address.company_name,
                    address_line1: order.shipping_address.address_line1,
                    address_line2: order.shipping_address.address_line2,
                    city: order.shipping_address.city,
                    state: order.shipping_address.state,
                    postal_code: order.shipping_address.postal_code,
                    country: order.shipping_address.country,
                    phone: order.shipping_address.phone
                },
                method: order.shippings[0]?.carrier || 'Standard Delivery',
                cost: parseFloat(order.shippings[0]?.shipping_cost.toString() || '0'),
                status: order.shippings[0]?.status || 'PENDING',
                tracking_number: order.shippings[0]?.tracking_number,
                estimated_delivery: order.shippings[0]?.estimated_delivery_date?.toISOString(),
                actual_delivery: order.shippings[0]?.actual_delivery_date?.toISOString()
            },
            
            // Payment information
            payment: {
                method: order.payments[0]?.method || 'CREDIT_CARD',
                status: order.payments[0]?.status || 'PENDING',
                amount: parseFloat(order.payments[0]?.amount.toString() || '0'),
                transaction_id: order.payments[0]?.transaction_id,
                payment_date: order.payments[0]?.payment_date?.toISOString()
            },
            
            // Tracking information
            tracking: {
                number: order.shippings[0]?.tracking_number || `TRK${Date.now()}`,
                carrier: order.shippings[0]?.carrier || 'Standard Delivery',
                updates: generateDetailedTrackingUpdates(order)
            },
            
            // Timestamps
            created_at: order.created_at.toISOString(),
            updated_at: order.updated_at.toISOString()
        }

        return NextResponse.json({
            success: true,
            data: transformedOrder
        })

    } catch (error) {
        console.error('Get Order Details Error:', error)
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to fetch order details',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// PATCH - Update order status (for admin/seller use)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const orderId = params.id
        const body = await request.json()
        const { status, shipping_status, notes } = body

        if (!orderId) {
            return NextResponse.json(
                { success: false, error: 'Order ID is required' },
                { status: 400 }
            )
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        })

        if (!order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            )
        }

        // Update order status if provided
        if (status) {
            const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
            if (!validStatuses.includes(status.toUpperCase())) {
                return NextResponse.json(
                    { success: false, error: 'Invalid order status' },
                    { status: 400 }
                )
            }

            await prisma.order.update({
                where: { id: orderId },
                data: { 
                    status: status.toUpperCase(),
                    updated_at: new Date()
                }
            })
        }

        // Update shipping status if provided
        if (shipping_status) {
            const validShippingStatuses = ['PENDING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'DELIVERY_ATTEMPTED', 'CANCELED', 'RETURNED', 'LOST']
            if (!validShippingStatuses.includes(shipping_status.toUpperCase())) {
                return NextResponse.json(
                    { success: false, error: 'Invalid shipping status' },
                    { status: 400 }
                )
            }

            await prisma.shipping.updateMany({
                where: { order_id: orderId },
                data: { 
                    status: shipping_status.toUpperCase(),
                    last_status_update: new Date(),
                    ...(shipping_status.toUpperCase() === 'DELIVERED' && {
                        actual_delivery_date: new Date()
                    })
                }
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Order updated successfully'
        })

    } catch (error) {
        console.error('Update Order Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update order',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// Helper function to generate detailed tracking updates
function generateDetailedTrackingUpdates(order: any) {
    const updates = []
    const orderDate = new Date(order.created_at)
    
    // Order placed - always present
    updates.push({
        date: orderDate.toISOString().split('T')[0],
        time: orderDate.toTimeString().slice(0, 5),
        status: 'Order Placed',
        description: 'Order received and payment confirmed',
        location: 'Online Store'
    })

    // Processing
    if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
        const processingDate = new Date(orderDate.getTime() + 2 * 60 * 60 * 1000) // +2 hours
        updates.push({
            date: processingDate.toISOString().split('T')[0],
            time: processingDate.toTimeString().slice(0, 5),
            status: 'Processing',
            description: 'Order is being prepared and packed',
            location: 'Fulfillment Center'
        })
    }

    // Shipped
    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
        const shippedDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000) // +1 day
        updates.push({
            date: shippedDate.toISOString().split('T')[0],
            time: shippedDate.toTimeString().slice(0, 5),
            status: 'Shipped',
            description: 'Package picked up by carrier and in transit',
            location: 'Distribution Center'
        })
    }

    // Out for delivery
    if (order.status === 'DELIVERED') {
        const outForDeliveryDate = new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000) // +3 days
        updates.push({
            date: outForDeliveryDate.toISOString().split('T')[0],
            time: outForDeliveryDate.toTimeString().slice(0, 5),
            status: 'Out for Delivery',
            description: 'Package is on delivery vehicle',
            location: 'Local Facility'
        })
    }

    // Delivered
    if (order.status === 'DELIVERED') {
        const deliveredDate = order.shippings?.[0]?.actual_delivery_date || 
                             new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000) // +4 days
        updates.push({
            date: deliveredDate.toISOString().split('T')[0],
            time: new Date(deliveredDate).toTimeString().slice(0, 5),
            status: 'Delivered',
            description: 'Package delivered successfully',
            location: order.shipping_address?.city || 'Destination'
        })
    }

    // Cancelled
    if (order.status === 'CANCELLED') {
        updates.push({
            date: order.updated_at.toISOString().split('T')[0],
            time: new Date(order.updated_at).toTimeString().slice(0, 5),
            status: 'Cancelled',
            description: 'Order has been cancelled',
            location: 'System'
        })
    }

    return updates.reverse() // Most recent first
}