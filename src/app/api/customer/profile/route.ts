// app/api/customer/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get customer profile by user ID
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            )
        }

        // Verify user exists and is a CUSTOMER
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
                is_active: true,
                first_name: true,
                last_name: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        if (user.role !== 'CUSTOMER') {
            return NextResponse.json(
                { success: false, error: 'User is not a customer' },
                { status: 403 }
            )
        }

        if (!user.is_active) {
            return NextResponse.json(
                { success: false, error: 'User account is not active' },
                { status: 403 }
            )
        }

        // Find customer profile by user_id
        let customerProfile = await prisma.customerProfile.findUnique({
            where: { user_id: userId },
            select: {
                id: true,
                user_id: true,
                created_at: true
            }
        })

        // If customer profile doesn't exist, create it
        if (!customerProfile) {
            console.log('🔄 Creating missing customer profile for user:', userId, user.first_name, user.last_name)

            try {
                // Create customer profile AND cart in a transaction
                const result = await prisma.$transaction(async (tx) => {
                    const newCustomerProfile = await tx.customerProfile.create({
                        data: {
                            user_id: userId,
                            wishlist: [],
                            loyalty_points: 0
                        },
                        select: {
                            id: true,
                            user_id: true,
                            created_at: true
                        }
                    })

                    // Also create cart if it doesn't exist
                    const existingCart = await tx.cart.findUnique({
                        where: { customer_id: newCustomerProfile.id }
                    })

                    if (!existingCart) {
                        await tx.cart.create({
                            data: {
                                customer_id: newCustomerProfile.id,
                                total_amount: 0
                            }
                        })
                        console.log('✅ Cart also created for customer:', newCustomerProfile.id)
                    }

                    return newCustomerProfile
                })

                customerProfile = result
                console.log('✅ Customer profile created:', customerProfile.id)

            } catch (createError) {
                console.error('❌ Failed to create customer profile:', createError)
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Failed to create customer profile',
                        details: process.env.NODE_ENV === 'development' ? String(createError) : undefined
                    },
                    { status: 500 }
                )
            }
        }

        return NextResponse.json({
            success: true,
            customerProfile: customerProfile
        })

    } catch (error) {
        console.error('Get Customer Profile Error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch customer profile',
                message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
            },
            { status: 500 }
        )
    } finally {
        await prisma.$disconnect()
    }
}