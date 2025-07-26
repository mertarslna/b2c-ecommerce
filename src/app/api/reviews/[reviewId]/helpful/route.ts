// app/api/reviews/[reviewId]/helpful/route.ts - WITH VOTE TRACKING
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface RouteParams {
  params: {
    reviewId: string
  }
}

// POST - Vote helpful on review (only once per customer)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { reviewId } = params
    const body = await request.json()
    const { customerId } = body

    console.log('👍 Helpful vote request for review:', reviewId, 'by customer:', customerId)

    if (!customerId || !reviewId) {
      return NextResponse.json({
        success: false,
        error: 'Review ID and customer ID are required'
      }, { status: 400 })
    }

    // Check if review exists and is approved
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { 
        id: true, 
        helpful_count: true,
        is_approved: true,
        customer_id: true
      }
    })

    if (!existingReview) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 })
    }

    if (!existingReview.is_approved) {
      return NextResponse.json({
        success: false,
        error: 'Review is not approved yet'
      }, { status: 403 })
    }

    // Prevent voting on own review
    if (existingReview.customer_id === customerId) {
      return NextResponse.json({
        success: false,
        error: 'You cannot vote helpful on your own review'
      }, { status: 403 })
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

    // Check if customer has already voted on this review
    const existingVote = await prisma.helpfulVote.findUnique({
      where: {
        review_id_customer_id: {
          review_id: reviewId,
          customer_id: customerId
        }
      }
    })

    if (existingVote) {
      return NextResponse.json({
        success: false,
        error: 'You have already voted helpful on this review',
        data: {
          reviewId: reviewId,
          alreadyVoted: true,
          currentHelpfulCount: existingReview.helpful_count
        }
      }, { status: 409 }) // Conflict status
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create helpful vote record
      const helpfulVote = await tx.helpfulVote.create({
        data: {
          review_id: reviewId,
          customer_id: customerId
        }
      })

      // Update helpful count
      const updatedReview = await tx.review.update({
        where: { id: reviewId },
        data: {
          helpful_count: {
            increment: 1
          }
        },
        select: { helpful_count: true }
      })

      return {
        voteId: helpfulVote.id,
        newHelpfulCount: updatedReview.helpful_count
      }
    })

    console.log('✅ Helpful vote recorded successfully. New count:', result.newHelpfulCount)

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      data: {
        reviewId: reviewId,
        voteId: result.voteId,
        newHelpfulCount: result.newHelpfulCount,
        alreadyVoted: true // Now they have voted
      }
    })

  } catch (error) {
    console.error('❌ Error processing helpful vote:', error)
    
    // Handle unique constraint violation (race condition)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({
        success: false,
        error: 'You have already voted helpful on this review',
        data: {
          reviewId: params.reviewId,
          alreadyVoted: true
        }
      }, { status: 409 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to process helpful vote'
    }, { status: 500 })
  }
}

// GET - Check if customer has voted on this review
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { reviewId } = params
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId || !reviewId) {
      return NextResponse.json({
        success: false,
        error: 'Review ID and customer ID are required'
      }, { status: 400 })
    }

    const existingVote = await prisma.helpfulVote.findUnique({
      where: {
        review_id_customer_id: {
          review_id: reviewId,
          customer_id: customerId
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        hasVoted: !!existingVote,
        voteId: existingVote?.id || null
      }
    })

  } catch (error) {
    console.error('❌ Error checking vote status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check vote status'
    }, { status: 500 })
  }
}