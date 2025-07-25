// 📁 Create this file: app/api/wishlist/items/[productId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
    params: {
        productId: string
    }
}

// DELETE - Remove specific item from wishlist
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { productId } = params
        const searchParams = request.nextUrl.searchParams
        const customerId = searchParams.get('customerId')

        console.log('🗑️ DELETE request:', { productId, customerId })

        if (!customerId) {
            return NextResponse.json(
                { success: false, error: 'Customer ID is required' },
                { status: 400 }
            )
        }

        if (!productId) {
            return NextResponse.json(
                { success: false, error: 'Product ID is required' },
                { status: 400 }
            )
        }

        // ✅ Ensure productId is string
        const productIdString = productId.toString()

        // Get current wishlist
        const customer = await prisma.customerProfile.findUnique({
            where: { id: customerId },
            select: { wishlist: true }
        })

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Customer not found' },
                { status: 404 }
            )
        }

        // Parse current wishlist
        const currentWishlist = Array.isArray(customer.wishlist) ? customer.wishlist : []

        console.log('📋 Current wishlist:', currentWishlist)
        console.log('🎯 Looking for productId:', productIdString)

        // Check if product is in wishlist
        if (!currentWishlist.includes(productIdString)) {
            console.log('❌ Product not found in wishlist')
            return NextResponse.json(
                { success: false, error: 'Product not in wishlist' },
                { status: 400 }
            )
        }

        // Remove product from wishlist
        const updatedWishlist = currentWishlist.filter(id => id !== productIdString)

        console.log('✅ Updated wishlist:', updatedWishlist)

        await prisma.customerProfile.update({
            where: { id: customerId },
            data: { wishlist: updatedWishlist }
        })

        return NextResponse.json({
            success: true,
            message: 'Product removed from wishlist',
            data: { 
                wishlistCount: updatedWishlist.length,
                productId: productIdString
            }
        })

    } catch (error) {
        console.error('❌ Remove from Wishlist Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to remove from wishlist',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    }
}