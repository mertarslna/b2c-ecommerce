
// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Fetch product with all related data
    const product = await prisma.product.findUnique({
      where: {
        id: id,
        is_approved: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        images: {
          orderBy: {
            is_main: 'desc' // Main image first
          },
          select: {
            id: true,
            path: true,
            is_main: true
          }
        },
        reviews: {
          include: {
            customer: {
              include: {
                user: {
                  select: {
                    first_name: true,
                    last_name: true
                  }
                }
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        },
        seller: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate review statistics
    const reviewCount = product.reviews.length
    const avgRating = reviewCount > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : parseFloat(product.rating?.toString() || '0')

    // Group reviews by rating
    const reviewStats = {
      5: product.reviews.filter(r => r.rating === 5).length,
      4: product.reviews.filter(r => r.rating === 4).length,
      3: product.reviews.filter(r => r.rating === 3).length,
      2: product.reviews.filter(r => r.rating === 2).length,
      1: product.reviews.filter(r => r.rating === 1).length,
    }

    // Transform product data
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price.toString()),
      originalPrice: null, // Add this field to schema if needed
      stock: product.stock,
      category: {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description
      },
      rating: Math.round(avgRating * 10) / 10,
      reviews: reviewCount,
      images: product.images.map(img => ({
        id: img.id,
        url: img.path,
        isMain: img.is_main
      })),
      seller: {
        id: product.seller.id,
        name: `${product.seller.user.first_name} ${product.seller.user.last_name}`,
        businessName: product.seller.business_name,
        email: product.seller.user.email,
        isVerified: product.seller.is_verified
      },
      reviewStats,
      detailedReviews: product.reviews.slice(0, 10).map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        pros: review.pros,
        cons: review.cons,
        isVerified: review.is_verified,
        helpfulCount: review.helpful_count,
        date: review.review_date,
        customer: {
          name: `${review.customer.user.first_name} ${review.customer.user.last_name}`
        }
      })),
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }

    return NextResponse.json({
      success: true,
      data: transformedProduct
    })

  } catch (error) {
    console.error('Single Product API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch product',
        message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// PUT - Update product (for sellers and admins)
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = params
    const body = await request.json()
    
    const { 
      name, 
      description, 
      price, 
      stock, 
      category_id,
      is_approved // Only admins can approve
    } = body

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(category_id && { category_id }),
        ...(is_approved !== undefined && { is_approved }),
        updated_at: new Date()
      },
      include: {
        category: true,
        seller: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    })

  } catch (error) {
    console.error('Update Product Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update product',
        message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete product (for sellers and admins)
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = params

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete product (this will cascade delete related images, reviews, etc.)
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Delete Product Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete product',
        message: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    )
  }
}