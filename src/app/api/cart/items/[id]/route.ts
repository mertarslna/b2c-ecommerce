// app/api/cart/items/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
    params: {
        id: string
    }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const { id } = params
        const body = await request.json()
        const { quantity } = body

        if (!quantity || quantity < 0) {
            return NextResponse.json(
                { success: false, error: 'Valid quantity is required' },
                { status: 400 }
            )
        }

        // Find cart item
        const cartItem = await prisma.cartItem.findUnique({
            where: { id },
            include: {
                product: true,
                cart: true
            }
        })

        if (!cartItem) {
            return NextResponse.json(
                { success: false, error: 'Cart item not found' },
                { status: 404 }
            )
        }

        // Check stock
        if (cartItem.product.stock < quantity) {
            return NextResponse.json(
                { success: false, error: 'Insufficient stock' },
                { status: 400 }
            )
        }

        // Update quantity
        const updatedItem = await prisma.cartItem.update({
            where: { id },
            data: {
                quantity,
                updated_at: new Date()
            }
        })

        // Recalculate cart total
        const cartItems = await prisma.cartItem.findMany({
            where: { cart_id: cartItem.cart_id }
        })

        const newTotal = cartItems.reduce((sum, item) =>
            sum + (parseFloat(item.unit_price.toString()) * item.quantity), 0
        )

        await prisma.cart.update({
            where: { id: cartItem.cart_id },
            data: {
                total_amount: newTotal,
                updated_at: new Date()
            }
        })

        return NextResponse.json({
            success: true,
            data: updatedItem,
            message: 'Cart item updated successfully'
        })

    } catch (error) {
        console.error('Update Cart Item Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update cart item',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = params

        // Find cart item
        const cartItem = await prisma.cartItem.findUnique({
            where: { id },
            include: { cart: true }
        })

        if (!cartItem) {
            return NextResponse.json(
                { success: false, error: 'Cart item not found' },
                { status: 404 }
            )
        }

        // Delete cart item
        await prisma.cartItem.delete({
            where: { id }
        })

        // Recalculate cart total
        const remainingItems = await prisma.cartItem.findMany({
            where: { cart_id: cartItem.cart_id }
        })

        const newTotal = remainingItems.reduce((sum, item) =>
            sum + (parseFloat(item.unit_price.toString()) * item.quantity), 0
        )

        await prisma.cart.update({
            where: { id: cartItem.cart_id },
            data: {
                total_amount: newTotal,
                updated_at: new Date()
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Item removed from cart successfully'
        })

    } catch (error) {
        console.error('Remove Cart Item Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to remove cart item',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    }
}