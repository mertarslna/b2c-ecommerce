// hooks/useReviews.ts - UPDATED VERSION
import { useState, useEffect } from 'react'

interface ReviewCustomer {
  name: string
  avatar: string
}

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  pros: string[]
  cons: string[]
  isVerified: boolean
  helpfulCount: number
  reviewDate: string
  customer: ReviewCustomer
  isVerifiedPurchase: boolean
}

interface RatingDistribution {
  rating: number
  count: number
  percentage: number
}

interface ReviewStatistics {
  averageRating: number
  totalReviews: number
  ratingDistribution: RatingDistribution[]
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ReviewsResponse {
  reviews: Review[]
  pagination: Pagination
  statistics: ReviewStatistics
}

interface UseReviewsOptions {
  productId: string
  rating?: number
  sortBy?: string
  page?: number
  limit?: number
}

export function useReviews({ 
  productId, 
  rating = 0, 
  sortBy = 'newest', 
  page = 1, 
  limit = 5 
}: UseReviewsOptions) {
  const [data, setData] = useState<ReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = async () => {
    if (!productId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('Fetching reviews for product:', productId) // Debug log

      const params = new URLSearchParams({
        productId,
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      })

      if (rating > 0) {
        params.append('rating', rating.toString())
      }

      const url = `/api/reviews?${params}`
      console.log('Fetching from URL:', url) // Debug log

      const response = await fetch(url)
      const result = await response.json()

      console.log('API Response:', result) // Debug log

      if (response.ok && result.success) {
        setData(result.data)
      } else {
        const errorMessage = result.error || `HTTP ${response.status}: ${response.statusText}`
        setError(errorMessage)
        console.error('API Error:', errorMessage)
      }
    } catch (err) {
      const errorMessage = 'Network error. Please check your connection and try again.'
      setError(errorMessage)
      console.error('Fetch reviews error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId, rating, sortBy, page, limit])

  const refresh = () => {
    fetchReviews()
  }

  return {
    reviews: data?.reviews || [],
    pagination: data?.pagination || null,
    statistics: data?.statistics || {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: []
    },
    loading,
    error,
    refresh
  }
}

// Hook for submitting reviews
export interface SubmitReviewData {
  productId: string
  customerId: string
  orderId?: string
  rating: number
  title?: string
  comment: string
  pros?: string[]
  cons?: string[]
}

export function useSubmitReview() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitReview = async (reviewData: SubmitReviewData): Promise<boolean> => {
    setSubmitting(true)
    setError(null)

    try {
      console.log('Submitting review:', reviewData) // Debug log

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      })

      const result = await response.json()
      console.log('Submit review response:', result) // Debug log

      if (response.ok && result.success) {
        return true
      } else {
        const errorMessage = result.error || `HTTP ${response.status}: Failed to submit review`
        setError(errorMessage)
        console.error('Submit review error:', errorMessage)
        return false
      }
    } catch (err) {
      const errorMessage = 'Network error. Please check your connection and try again.'
      setError(errorMessage)
      console.error('Submit review network error:', err)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return {
    submitReview,
    submitting,
    error
  }
}

// Hook for helpful votes
export function useHelpfulVote() {
  const [voting, setVoting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const voteHelpful = async (reviewId: string, customerId: string): Promise<number | null> => {
    if (!reviewId || !customerId) {
      console.error('Missing reviewId or customerId')
      return null
    }

    setVoting(reviewId)
    setError(null)

    try {
      console.log('Voting helpful for review:', reviewId, 'by customer:', customerId) // Debug log

      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId })
      })

      const result = await response.json()
      console.log('Vote helpful response:', result) // Debug log

      if (response.ok && result.success) {
        return result.data.newHelpfulCount
      } else {
        const errorMessage = result.error || `HTTP ${response.status}: Failed to vote`
        setError(errorMessage)
        console.error('Vote helpful error:', errorMessage)
        return null
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.'
      setError(errorMessage)
      console.error('Vote helpful network error:', err)
      return null
    } finally {
      setVoting(null)
    }
  }

  return {
    voteHelpful,
    voting,
    error
  }
}

// Hook for managing customer authentication (simplified)
export function useCustomer() {
  // In a real app, this would get customer data from authentication context
  // For now, we'll use a test customer
  const [customer] = useState({
    id: 'customer-1',
    name: 'Test User',
    email: 'test@example.com'
  })

  return { customer }
}