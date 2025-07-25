// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get user's wishlist
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

        // Get customer profile with wishlist
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

        // Parse wishlist (stored as JSON array of product IDs)
        const wishlistProductIds = Array.isArray(customer.wishlist)
            ? customer.wishlist.filter((id): id is string => typeof id === 'string')
            : []

        if (wishlistProductIds.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    items: [],
                    count: 0
                }
            })
        }

        // Get products in wishlist
        const products = await prisma.product.findMany({
            where: {
                id: { in: wishlistProductIds }
            },
            include: {
                category: {
                    select: { name: true }
                },
                images: {
                    where: { is_main: true },
                    select: { path: true }
                },
                seller: {
                    include: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true
                            }
                        }
                    }
                }
            }
        })

        // ✅ Transform to wishlist items - Keep ID as string (UUID)
        const wishlistItems = products.map((product: any) => ({
            id: product.id, // ✅ Keep as UUID string, don't convert to number
            name: product.name,
            price: parseFloat(product.price.toString()),
            image: product.images[0]?.path || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
            category: product.category.name,
            rating: parseFloat(product.rating?.toString() || '0'),
            reviews: Math.floor(Math.random() * 100) + 10, // Mock review count
            addedAt: new Date().toISOString() // Mock added date
        }))

        return NextResponse.json({
            success: true,
            data: {
                items: wishlistItems,
                count: wishlistItems.length
            }
        })

    } catch (error) {
        console.error('Get Wishlist Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch wishlist',
                message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
            },
            { status: 500 }
        )
    }
}

// POST - Add item to wishlist
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { customerId, productId } = body

        if (!customerId || !productId) {
            return NextResponse.json(
                { success: false, error: 'Customer ID and Product ID are required' },
                { status: 400 }
            )
        }

        // ✅ Ensure productId is string
        const productIdString = productId.toString()

        // Verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productIdString }
        })

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            )
        }

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

        // Check if product already in wishlist
        if (currentWishlist.includes(productIdString)) {
            return NextResponse.json(
                { success: false, error: 'Product already in wishlist' },
                { status: 400 }
            )
        }

        // Add product to wishlist
        const updatedWishlist = [...currentWishlist, productIdString]

        await prisma.customerProfile.update({
            where: { id: customerId },
            data: { wishlist: updatedWishlist }
        })

        return NextResponse.json({
            success: true,
            message: 'Product added to wishlist',
            data: { 
                wishlistCount: updatedWishlist.length,
                productId: productIdString // ✅ Return the actual ID used
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Add to Wishlist Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to add to wishlist',
                message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
            },
            { status: 500 }
        )
    }
}

// DELETE - Clear entire wishlist
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

        // Clear wishlist
        await prisma.customerProfile.update({
            where: { id: customerId },
            data: { wishlist: [] }
        })

        return NextResponse.json({
            success: true,
            message: 'Wishlist cleared successfully'
        })

    } catch (error) {
        console.error('Clear Wishlist Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to clear wishlist',
                message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
            },
            { status: 500 }
        )
    }
}