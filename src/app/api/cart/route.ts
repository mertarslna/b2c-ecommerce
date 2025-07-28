// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get user's cart
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

        // Find or create cart for customer
        let cart = await prisma.cart.findUnique({
            where: { customer_id: customerId },
            include: {
                cart_items: {
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
                }
            }
        })

        // Create cart if doesn't exist
        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    customer_id: customerId,
                    total_amount: 0
                },
                include: {
                    cart_items: {
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
                    }
                }
            })
        }

        // Transform cart items to match frontend interface
        const transformedItems = cart.cart_items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: parseFloat(item.unit_price.toString()),
image: item.product.images[0]?.path || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',            category: item.product.category.name,
            quantity: item.quantity,
            selectedSize: item.selected_size,
            selectedColor: item.selected_color,
            cartItemId: item.id // For identification in updates/deletes
        }))

        return NextResponse.json({
            success: true,
            data: {
                id: cart.id,
                items: transformedItems,
                totalAmount: parseFloat(cart.total_amount.toString()),
                itemCount: cart.cart_items.length,
                totalItems: cart.cart_items.reduce((sum, item) => sum + item.quantity, 0)
            }
        })

    } catch (error) {
        console.error('Get Cart Error:', error)
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to fetch cart',
                message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
            },
            { status: 500 }
        )
    }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            customerId,
            productId,
            quantity = 1,
            selectedSize,
            selectedColor
        } = body

        if (!customerId || !productId) {
            return NextResponse.json(
                { success: false, error: 'Customer ID and Product ID are required' },
                { status: 400 }
            )
        }

        // Get product details
        const product = await prisma.product.findUnique({
            where: { id: productId }
        })

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            )
        }

        // Check stock
        if (product.stock < quantity) {
            return NextResponse.json(
                { success: false, error: 'Insufficient stock' },
                { status: 400 }
            )
        }

        // Find or create cart
        let cart = await prisma.cart.findUnique({
            where: { customer_id: customerId }
        })

        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    customer_id: customerId,
                    total_amount: 0
                }
            })
        }

        // Check if item already exists in cart (same product, size, color)
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cart_id: cart.id,
                product_id: productId,
                selected_size: selectedSize || null,
                selected_color: selectedColor || null
            }
        })

        let cartItem
        if (existingItem) {
            // Update quantity
            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + quantity,
                    updated_at: new Date()
                }
            })
        } else {
            // Create new cart item
            cartItem = await prisma.cartItem.create({
                data: {
                    cart_id: cart.id,
                    product_id: productId,
                    quantity,
                    unit_price: product.price,
                    selected_size: selectedSize || null,
                    selected_color: selectedColor || null
                }
            })
        }

        // Update cart total
        const cartItems = await prisma.cartItem.findMany({
            where: { cart_id: cart.id }
        })

        const newTotal = cartItems.reduce((sum, item) =>
            sum + (parseFloat(item.unit_price.toString()) * item.quantity), 0
        )

        await prisma.cart.update({
            where: { id: cart.id },
            data: {
                total_amount: newTotal,
                updated_at: new Date()
            }
        })

        return NextResponse.json({
            success: true,
            data: cartItem,
            message: 'Item added to cart successfully'
        }, { status: 201 })

    } catch (error) {
        console.error('Add to Cart Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to add item to cart',
                message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
            },
            { status: 500 }
        )
    }
}

// DELETE - Clear entire cart
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json()
        const { customerId } = body

        if (!customerId) {
            return NextResponse.json(
                { success: false, error: 'Customer ID is required' },
                { status: 400 }
            )
        }

        // Find cart
        const cart = await prisma.cart.findUnique({
            where: { customer_id: customerId }
        })

        if (!cart) {
            return NextResponse.json(
                { success: false, error: 'Cart not found' },
                { status: 404 }
            )
        }

        // Delete all cart items and reset total
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

        return NextResponse.json({
            success: true,
            message: 'Cart cleared successfully'
        })

    } catch (error) {
        console.error('Clear Cart Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to clear cart',
                message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
            },
            { status: 500 }
        )
    }
}