// app/api/orders/track/[trackingNumber]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Track order by tracking number
export async function GET(
    request: NextRequest,
    { params }: { params: { trackingNumber: string } }
) {
    try {
        const trackingNumber = params.trackingNumber

        if (!trackingNumber) {
            return NextResponse.json(
                { success: false, error: 'Tracking number is required' },
                { status: 400 }
            )
        }

        // Find shipping record by tracking number
        const shipping = await prisma.shipping.findUnique({
            where: { tracking_number: trackingNumber },
            include: {
                order: {
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
                },
                shipping_address: true
            }
        })

        if (!shipping) {
            return NextResponse.json(
                { success: false, error: 'Tracking number not found' },
                { status: 404 }
            )
        }

        // Generate detailed tracking timeline
        const trackingTimeline = generateTrackingTimeline(shipping)

        // Calculate delivery progress percentage
        const deliveryProgress = calculateDeliveryProgress(shipping.status)

        const trackingInfo = {
            tracking_number: shipping.tracking_number,
            carrier: shipping.carrier,
            current_status: shipping.status,
            status_description: getStatusDescription(shipping.status),
            delivery_progress: deliveryProgress,
            
            // Dates
            shipping_date: shipping.shipping_date.toISOString(),
            estimated_delivery: shipping.estimated_delivery_date?.toISOString(),
            actual_delivery: shipping.actual_delivery_date?.toISOString(),
            last_update: shipping.last_status_update.toISOString(),
            
            // Costs
            shipping_cost: parseFloat(shipping.shipping_cost.toString()),
            
            // Order information
            order_info: {
                id: shipping.order.id,
                order_date: shipping.order.order_date.toISOString(),
                total_amount: parseFloat(shipping.order.total_amount.toString()),
                status: shipping.order.status,
                customer_name: `${shipping.order.customer.user.first_name} ${shipping.order.customer.user.last_name}`,
                customer_email: shipping.order.customer.user.email,
                items_count: shipping.order.order_items.length,
                items: shipping.order.order_items.map(item => ({
                    name: item.product.name,
                    quantity: item.quantity,
                    price: parseFloat(item.unit_price.toString()),
                    image: item.product.images[0]?.path || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'
                }))
            },
            
            // Shipping address
            delivery_address: {
                recipient_name: `${shipping.shipping_address.first_name} ${shipping.shipping_address.last_name}`,
                company: shipping.shipping_address.company_name,
                address_line1: shipping.shipping_address.address_line1,
                address_line2: shipping.shipping_address.address_line2,
                city: shipping.shipping_address.city,
                state: shipping.shipping_address.state,
                postal_code: shipping.shipping_address.postal_code,
                country: shipping.shipping_address.country,
                phone: shipping.shipping_address.phone,
                full_address: `${shipping.shipping_address.address_line1}, ${shipping.shipping_address.city}, ${shipping.shipping_address.state} ${shipping.shipping_address.postal_code}, ${shipping.shipping_address.country}`
            },
            
            // Tracking timeline
            tracking_timeline: trackingTimeline,
            
            // Additional info
            can_cancel: shipping.order.status === 'PENDING' || shipping.order.status === 'PROCESSING',
            can_return: shipping.order.status === 'DELIVERED' && shipping.actual_delivery_date && 
                       (new Date() > new Date(shipping.actual_delivery_date.getTime() + 30 * 24 * 60 * 60 * 1000)) // 30 days return window
        }

        return NextResponse.json({
            success: true,
            data: trackingInfo
        })

    } catch (error) {
        console.error('Tracking Error:', error)
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to fetch tracking information',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}

// Helper function to generate tracking timeline
function generateTrackingTimeline(shipping: any) {
    const timeline = []
    const shippingDate = new Date(shipping.shipping_date)
    const order = shipping.order
    
    // Order placed
    timeline.push({
        date: order.order_date.toISOString().split('T')[0],
        time: new Date(order.order_date).toTimeString().slice(0, 5),
        status: 'Order Placed',
        description: 'Order has been placed and payment confirmed',
        location: 'Online Store',
        icon: '📝',
        completed: true
    })

    // Processing
    if (['PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status)) {
        const processingDate = new Date(order.order_date.getTime() + 30 * 60 * 1000) // +30 minutes
        timeline.push({
            date: processingDate.toISOString().split('T')[0],
            time: processingDate.toTimeString().slice(0, 5),
            status: 'Processing',
            description: 'Order is being prepared and items are being packed',
            location: 'Fulfillment Center',
            icon: '📦',
            completed: true
        })
    }

    // Label created / Ready to ship
    if (['SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(shipping.status)) {
        const labelDate = new Date(shippingDate.getTime() - 2 * 60 * 60 * 1000) // -2 hours before shipping
        timeline.push({
            date: labelDate.toISOString().split('T')[0],
            time: labelDate.toTimeString().slice(0, 5),
            status: 'Ready to Ship',
            description: 'Package is ready and shipping label has been created',
            location: 'Warehouse',
            icon: '🏷️',
            completed: true
        })
    }

    // Picked up / Shipped
    if (['SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(shipping.status)) {
        timeline.push({
            date: shippingDate.toISOString().split('T')[0],
            time: new Date(shippingDate).toTimeString().slice(0, 5),
            status: 'Picked Up',
            description: `Package picked up by ${shipping.carrier}`,
            location: 'Pickup Location',
            icon: '🚚',
            completed: true
        })
    }

    // In transit
    if (['IN_TRANSIT', 'DELIVERED'].includes(shipping.status)) {
        const transitDate = new Date(shippingDate.getTime() + 6 * 60 * 60 * 1000) // +6 hours
        timeline.push({
            date: transitDate.toISOString().split('T')[0],
            time: transitDate.toTimeString().slice(0, 5),
            status: 'In Transit',
            description: 'Package is on the way to sorting facility',
            location: 'En Route',
            icon: '🛣️',
            completed: true
        })
    }

    // Arrived at facility
    if (['IN_TRANSIT', 'DELIVERED'].includes(shipping.status)) {
        const facilityDate = new Date(shippingDate.getTime() + 24 * 60 * 60 * 1000) // +1 day
        timeline.push({
            date: facilityDate.toISOString().split('T')[0],
            time: facilityDate.toTimeString().slice(0, 5),
            status: 'At Sorting Facility',
            description: 'Package arrived at regional sorting facility',
            location: `${shipping.shipping_address.state} Sorting Center`,
            icon: '🏢',
            completed: shipping.status === 'DELIVERED'
        })
    }

    // Out for delivery
    if (shipping.status === 'DELIVERED') {
        const outForDeliveryDate = shipping.actual_delivery_date ? 
            new Date(new Date(shipping.actual_delivery_date).getTime() - 4 * 60 * 60 * 1000) : // -4 hours before delivery
            new Date(shippingDate.getTime() + 2 * 24 * 60 * 60 * 1000) // +2 days from shipping
        
        timeline.push({
            date: outForDeliveryDate.toISOString().split('T')[0],
            time: outForDeliveryDate.toTimeString().slice(0, 5),
            status: 'Out for Delivery',
            description: 'Package is loaded on delivery vehicle',
            location: `${shipping.shipping_address.city} Local Facility`,
            icon: '🚛',
            completed: true
        })
    }

    // Delivered
    if (shipping.status === 'DELIVERED' && shipping.actual_delivery_date) {
        const deliveryDate = new Date(shipping.actual_delivery_date)
        timeline.push({
            date: deliveryDate.toISOString().split('T')[0],
            time: deliveryDate.toTimeString().slice(0, 5),
            status: 'Delivered',
            description: 'Package has been delivered successfully',
            location: shipping.shipping_address.city,
            icon: '✅',
            completed: true
        })
    }

    // Handle special cases
    if (shipping.status === 'DELIVERY_ATTEMPTED') {
        const attemptDate = new Date(shipping.last_status_update)
        timeline.push({
            date: attemptDate.toISOString().split('T')[0],
            time: attemptDate.toTimeString().slice(0, 5),
            status: 'Delivery Attempted',
            description: 'Delivery was attempted but recipient was not available',
            location: shipping.shipping_address.city,
            icon: '⚠️',
            completed: false
        })
    }

    if (shipping.status === 'RETURNED') {
        const returnDate = new Date(shipping.last_status_update)
        timeline.push({
            date: returnDate.toISOString().split('T')[0],
            time: returnDate.toTimeString().slice(0, 5),
            status: 'Returned',
            description: 'Package is being returned to sender',
            location: 'Return Center',
            icon: '↩️',
            completed: true
        })
    }

    if (shipping.status === 'LOST') {
        const lostDate = new Date(shipping.last_status_update)
        timeline.push({
            date: lostDate.toISOString().split('T')[0],
            time: lostDate.toTimeString().slice(0, 5),
            status: 'Lost',
            description: 'Package location is unknown - investigation in progress',
            location: 'Unknown',
            icon: '❓',
            completed: false
        })
    }

    return timeline.reverse() // Most recent first
}

// Helper function to get status description
function getStatusDescription(status: string): string {
    const descriptions = {
        'PENDING': 'Your order is being prepared for shipment',
        'SHIPPED': 'Your package has been shipped and is on its way',
        'IN_TRANSIT': 'Your package is in transit to its destination',
        'DELIVERED': 'Your package has been delivered successfully',
        'DELIVERY_ATTEMPTED': 'Delivery was attempted but unsuccessful',
        'CANCELED': 'Shipping has been canceled',
        'RETURNED': 'Package is being returned to sender',
        'LOST': 'Package location is currently unknown'
    }
    
    return descriptions[status as keyof typeof descriptions] || 'Status information not available'
}

// Helper function to calculate delivery progress percentage
function calculateDeliveryProgress(status: string): number {
    const progressMap = {
        'PENDING': 10,
        'SHIPPED': 30,
        'IN_TRANSIT': 60,
        'DELIVERED': 100,
        'DELIVERY_ATTEMPTED': 85,
        'CANCELED': 0,
        'RETURNED': 20,
        'LOST': 50
    }
    
    return progressMap[status as keyof typeof progressMap] || 0
}