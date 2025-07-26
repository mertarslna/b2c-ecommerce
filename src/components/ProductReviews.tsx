// components/ProductReviews.tsx - FIXED STAR DISPLAY IN RATING DISTRIBUTION
'use client'

import { useState, useEffect } from 'react'
import InteractiveStarRating from './InteractiveStarRating'

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
  isOwnReview: boolean
  hasVotedHelpful: boolean
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

interface ProductReviewsProps {
  productId: string
  currentCustomerId?: string
  initialStats?: {
    averageRating: number
    totalReviews: number
  }
}

export default function ProductReviews({ 
  productId, 
  currentCustomerId = 'customer-1',
  initialStats 
}: ProductReviewsProps) {
  // State management
  const [reviews, setReviews] = useState<Review[]>([])
  const [statistics, setStatistics] = useState<ReviewStatistics>({
    averageRating: initialStats?.averageRating || 0,
    totalReviews: initialStats?.totalReviews || 0,
    ratingDistribution: []
  })
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [votingReview, setVotingReview] = useState<string | null>(null)
  
  // Form state
  const [selectedRating, setSelectedRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewPros, setReviewPros] = useState('')
  const [reviewCons, setReviewCons] = useState('')

  // Filters
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(0)
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch reviews from API
  const fetchReviews = async () => {
    if (!productId) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        productId,
        page: currentPage.toString(),
        limit: '5',
        sortBy
      })

      if (selectedRatingFilter > 0) {
        params.append('rating', selectedRatingFilter.toString())
      }

      if (currentCustomerId) {
        params.append('currentCustomerId', currentCustomerId)
      }

      console.log('🔍 Fetching reviews from:', `/api/reviews?${params}`)

      const response = await fetch(`/api/reviews?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('📊 API Response:', result)

      if (result.success) {
        setReviews(result.data.reviews)
        setStatistics(result.data.statistics)
        setPagination(result.data.pagination)
        console.log('✅ Reviews loaded successfully:', result.data.reviews.length)
      } else {
        setError(result.error || 'Failed to load reviews')
        console.error('❌ API Error:', result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(`Failed to load reviews: ${errorMessage}`)
      console.error('❌ Network Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load reviews on component mount and when filters change
  useEffect(() => {
    fetchReviews()
  }, [productId, selectedRatingFilter, sortBy, currentPage])

  // Handle helpful vote
  const handleHelpfulVote = async (reviewId: string) => {
    if (votingReview === reviewId) return

    const review = reviews.find(r => r.id === reviewId)
    if (!review) return

    if (review.isOwnReview) {
      showNotification('You cannot vote helpful on your own review', 'error')
      return
    }

    if (review.hasVotedHelpful) {
      showNotification('You have already voted helpful on this review', 'info')
      return
    }

    setVotingReview(reviewId)

    try {
      console.log('👍 Voting helpful for review:', reviewId)

      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: currentCustomerId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('📊 Vote result:', result)

      if (result.success) {
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review.id === reviewId
              ? { 
                  ...review, 
                  helpfulCount: result.data.newHelpfulCount,
                  hasVotedHelpful: true
                }
              : review
          )
        )
        showNotification('Thank you for your feedback! 👍')
      } else {
        if (result.error.includes('already voted')) {
          showNotification('You have already voted helpful on this review', 'info')
          setReviews(prevReviews =>
            prevReviews.map(review =>
              review.id === reviewId
                ? { ...review, hasVotedHelpful: true }
                : review
            )
          )
        } else {
          showNotification(result.error || 'Failed to record your feedback', 'error')
        }
      }
    } catch (error) {
      console.error('❌ Vote error:', error)
      showNotification('Failed to record your feedback', 'error')
    } finally {
      setVotingReview(null)
    }
  }

  // Handle review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedRating === 0) {
      showNotification('Please select a rating', 'error')
      return
    }

    if (!reviewComment.trim()) {
      showNotification('Please write a review comment', 'error')
      return
    }

    setSubmittingReview(true)

    try {
      console.log('➕ Submitting new review')

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          customerId: currentCustomerId,
          rating: selectedRating,
          title: reviewTitle.trim() || null,
          comment: reviewComment.trim(),
          pros: reviewPros.trim() ? reviewPros.split(',').map(p => p.trim()) : [],
          cons: reviewCons.trim() ? reviewCons.split(',').map(c => c.trim()) : []
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('📊 Submit result:', result)

      if (result.success) {
        showNotification('Review submitted successfully! 🎉')
        setShowWriteReview(false)
        // Reset form
        setSelectedRating(0)
        setReviewTitle('')
        setReviewComment('')
        setReviewPros('')
        setReviewCons('')
        // Refresh reviews
        setCurrentPage(1)
        fetchReviews()
      } else {
        if (result.error.includes('already reviewed')) {
          showNotification('You have already reviewed this product', 'info')
        } else {
          showNotification(result.error || 'Failed to submit review', 'error')
        }
      }
    } catch (error) {
      console.error('❌ Submit error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showNotification(`Failed to submit review: ${errorMessage}`, 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // Show notification helper
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    }

    const notification = document.createElement('div')
    notification.textContent = message
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300`
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 100)
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  // Loading state
  if (loading && reviews.length === 0) {
    return (
      <div id="reviews" className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="bg-gray-100 rounded-2xl p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error && reviews.length === 0) {
    return (
      <div id="reviews" className="p-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-8">
          Customer Reviews ⭐
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchReviews}
            className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div id="reviews" className="p-8">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-8">
        Customer Reviews ⭐
      </h2>

      {/* Rating Summary */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Overall Rating */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
              <div className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {statistics.averageRating.toFixed(1)}
              </div>
              <div>
                <InteractiveStarRating 
                  rating={statistics.averageRating} 
                  size="lg" 
                  readonly 
                />
                <div className="text-gray-600 mt-1">
                  Based on {statistics.totalReviews} reviews
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowWriteReview(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Write a Review ✍️
            </button>
          </div>

          {/* Rating Distribution - FIXED NESTED BUTTON ISSUE */}
          <div className="space-y-3">
            {statistics.ratingDistribution.map((item) => (
              <div key={item.rating} className="flex items-center gap-4">
                <div
                  onClick={() => setSelectedRatingFilter(selectedRatingFilter === item.rating ? 0 : item.rating)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedRatingFilter === item.rating
                      ? 'bg-pink-100 text-pink-700 border border-pink-300'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{item.rating}</span>
                  {/* FIXED: Show correct number of stars for each rating */}
                  <InteractiveStarRating 
                    rating={item.rating} 
                    size="sm" 
                    readonly 
                  />
                </div>
                
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600 min-w-[50px]">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating_high">Highest Rating</option>
          <option value="rating_low">Lowest Rating</option>
        </select>

        {selectedRatingFilter > 0 && (
          <div className="flex items-center gap-2 bg-pink-100 text-pink-700 px-3 py-2 rounded-xl">
            <span>Showing {selectedRatingFilter} star reviews</span>
            <button
              onClick={() => setSelectedRatingFilter(0)}
              className="hover:bg-pink-200 rounded-full p-1"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600 mb-6">Be the first to review this product!</p>
          <button
            onClick={() => setShowWriteReview(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            Write the First Review
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100 p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {review.customer.avatar}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 space-y-4">
                    
                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-900">{review.customer.name}</h4>
                        {review.isVerifiedPurchase && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            ✓ Verified Purchase
                          </span>
                        )}
                        {review.isOwnReview && (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                            Your Review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <InteractiveStarRating 
                          rating={review.rating} 
                          size="md" 
                          readonly 
                        />
                        <span className="text-gray-500 text-sm">
                          {new Date(review.reviewDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Review Title */}
                    {review.title && (
                      <h5 className="text-xl font-semibold text-gray-900">
                        {review.title}
                      </h5>
                    )}

                    {/* Review Comment */}
                    {review.comment && (
                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    )}

                    {/* Pros and Cons */}
                    {(review.pros.length > 0 || review.cons.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pros */}
                        {review.pros.length > 0 && (
                          <div className="bg-green-50 rounded-xl p-4">
                            <h6 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                              <span className="text-green-600">👍</span> Pros
                            </h6>
                            <ul className="text-green-700 text-sm space-y-1">
                              {review.pros.map((pro, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-500 mt-1">•</span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Cons */}
                        {review.cons.length > 0 && (
                          <div className="bg-red-50 rounded-xl p-4">
                            <h6 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                              <span className="text-red-600">👎</span> Cons
                            </h6>
                            <ul className="text-red-700 text-sm space-y-1">
                              {review.cons.map((con, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-red-500 mt-1">•</span>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Review Actions */}
                    <div className="flex items-center gap-6 pt-4 border-t border-pink-200">
                      <button 
                        onClick={() => handleHelpfulVote(review.id)}
                        disabled={votingReview === review.id || review.isOwnReview || review.hasVotedHelpful}
                        className={`flex items-center gap-2 transition-colors ${
                          review.isOwnReview 
                            ? 'text-gray-400 cursor-not-allowed'
                            : review.hasVotedHelpful
                              ? 'text-green-600 cursor-not-allowed'
                              : 'text-gray-500 hover:text-pink-600 cursor-pointer'
                        } disabled:opacity-50`}
                        title={
                          review.isOwnReview 
                            ? "You can't vote on your own review"
                            : review.hasVotedHelpful
                              ? "You already voted helpful"
                              : "Mark as helpful"
                        }
                      >
                        {votingReview === review.id ? (
                          <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                        )}
                        <span>
                          Helpful ({review.helpfulCount})
                          {review.hasVotedHelpful && ' ✓'}
                        </span>
                      </button>
                      
                      <button className="text-gray-500 hover:text-pink-600 transition-colors">
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + i
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-pink-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Write Review Modal */}
      {showWriteReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Write a Review ✍️
              </h3>
              <button
                onClick={() => setShowWriteReview(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Review Form */}
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Rating *
                </label>
                <div className="flex flex-col gap-3">
                  <InteractiveStarRating
                    rating={selectedRating}
                    onRatingChange={setSelectedRating}
                    size="xl"
                    showText={true}
                    className="justify-center"
                  />
                  {selectedRating > 0 && (
                    <p className="text-sm text-gray-600 text-center">
                      You selected {selectedRating} star{selectedRating > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
                  placeholder="Summarize your review in a few words"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none resize-none"
                  placeholder="Tell us about your experience with this product"
                  required
                />
              </div>

              {/* Pros */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pros (separate with commas)
                </label>
                <input
                  type="text"
                  value={reviewPros}
                  onChange={(e) => setReviewPros(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
                  placeholder="What did you like? e.g., Great quality, Fast shipping, Easy to use"
                />
              </div>

              {/* Cons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cons (separate with commas)
                </label>
                <input
                  type="text"
                  value={reviewCons}
                  onChange={(e) => setReviewCons(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
                  placeholder="What could be improved? e.g., Expensive, Packaging, Size"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingReview || selectedRating === 0 || !reviewComment.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {submittingReview && (
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <span className={submittingReview ? 'opacity-0' : 'opacity-100'}>
                  Submit Review 🚀
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}