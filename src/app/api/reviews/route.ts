// app/api/reviews/route.ts - WITH VOTE STATUS
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch reviews with vote status for current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const rating = searchParams.get('rating')
    const sortBy = searchParams.get('sortBy') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '5')
    const currentCustomerId = searchParams.get('currentCustomerId') // Optional: to check vote status

    console.log('🔍 Fetching reviews for product:', productId)

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 })
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where condition
    const whereCondition: any = {
      product_id: productId,
      is_approved: true
    }

    if (rating && parseInt(rating) > 0) {
      whereCondition.rating = parseInt(rating)
    }

    // Build order by
    let orderBy: any = {}
    switch (sortBy) {
      case 'oldest':
        orderBy = { review_date: 'asc' }
        break
      case 'helpful':
        orderBy = { helpful_count: 'desc' }
        break
      case 'rating_high':
        orderBy = { rating: 'desc' }
        break
      case 'rating_low':
        orderBy = { rating: 'asc' }
        break
      default: // newest
        orderBy = { review_date: 'desc' }
    }

    // Fetch reviews with customer information and vote status
    const reviews = await prisma.review.findMany({
      where: whereCondition,
      orderBy,
      skip,
      take: limit,
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
        },
        helpful_votes: currentCustomerId ? {
          where: {
            customer_id: currentCustomerId
          },
          select: {
            id: true,
            customer_id: true
          }
        } : false
      }
    })

    // Count total reviews
    const totalReviews = await prisma.review.count({
      where: whereCondition
    })

    // Calculate rating statistics
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        product_id: productId,
        is_approved: true
      },
      _count: {
        rating: true
      }
    })

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: {
        product_id: productId,
        is_approved: true
      },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    })

    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      pros: review.pros,
      cons: review.cons,
      isVerified: review.is_verified,
      helpfulCount: review.helpful_count,
      reviewDate: review.review_date.toISOString(),
      customer: {
        name: `${review.customer.user.first_name} ${review.customer.user.last_name}`,
        avatar: review.customer.user.first_name.charAt(0).toUpperCase()
      },
      isVerifiedPurchase: review.is_verified,
      isOwnReview: currentCustomerId === review.customer_id,
      hasVotedHelpful: currentCustomerId ? (review.helpful_votes && review.helpful_votes.length > 0) : false
    }))

    // Build rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
      const found = ratingStats.find(stat => stat.rating === rating)
      const count = found ? found._count.rating : 0
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
      
      return {
        rating,
        count,
        percentage: Math.round(percentage * 10) / 10
      }
    })

    // Build statistics
    const statistics = {
      averageRating: avgRating._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : 0,
      totalReviews: avgRating._count.id,
      ratingDistribution
    }

    // Build pagination info
    const totalPages = Math.ceil(totalReviews / limit)
    const pagination = {
      currentPage: page,
      totalPages,
      totalCount: totalReviews,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }

    console.log('✅ Successfully fetched reviews:', formattedReviews.length)

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        statistics,
        pagination
      }
    })

  } catch (error) {
    console.error('❌ Error fetching reviews:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch reviews'
    }, { status: 500 })
  }
}

// POST - Add new review (same as before)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, customerId, rating, title, comment, pros, cons } = body

    console.log('➕ Adding new review for product:', productId)

    // Validate required data
    if (!productId || !customerId || !rating || !comment) {
      return NextResponse.json({
        success: false,
        error: 'Required fields: productId, customerId, rating, comment'
      }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        error: 'Rating must be between 1 and 5'
      }, { status: 400 })
    }

    // Check if customer exists
    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json({
        success: false,
        error: 'Customer not found'
      }, { status: 404 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 })
    }

    // Check if customer has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        product_id: productId,
        customer_id: customerId
      }
    })

    if (existingReview) {
      return NextResponse.json({
        success: false,
        error: 'You have already reviewed this product'
      }, { status: 409 })
    }

    // Create new review
    const newReview = await prisma.review.create({
      data: {
        product_id: productId,
        customer_id: customerId,
        rating: parseInt(rating),
        title: title?.trim() || null,
        comment: comment.trim(),
        pros: Array.isArray(pros) ? pros : [],
        cons: Array.isArray(cons) ? cons : [],
        is_verified: false,
        is_approved: true,
        helpful_count: 0,
        review_date: new Date()
      }
    })

    // Update product average rating
    const avgRating = await prisma.review.aggregate({
      where: {
        product_id: productId,
        is_approved: true
      },
      _avg: {
        rating: true
      }
    })

    if (avgRating._avg.rating) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: Math.round(avgRating._avg.rating * 100) / 100
        }
      })
    }

    console.log('✅ Review created successfully:', newReview.id)

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully!',
      data: {
        reviewId: newReview.id
      }
    })

  } catch (error) {
    console.error('❌ Error creating review:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create review'
    }, { status: 500 })
  }
}