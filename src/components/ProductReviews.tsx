'use client'

import { useState } from 'react'

interface Review {
  id: number
  userName: string
  rating: number
  date: string
  title: string
  comment: string
  verified: boolean
  helpful: number
}

interface ProductReviewsProps {
  productRating: number
  totalReviews: number
}

export default function ProductReviews({ productRating, totalReviews }: ProductReviewsProps) {
  const [selectedRating, setSelectedRating] = useState(0)
  const [showWriteReview, setShowWriteReview] = useState(false)

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: 1,
      userName: "Sarah Johnson",
      rating: 5,
      date: "2024-01-15",
      title: "Amazing quality!",
      comment: "This product exceeded my expectations. The quality is outstanding and it arrived quickly. Highly recommend!",
      verified: true,
      helpful: 24
    },
    {
      id: 2,
      userName: "Mike Chen",
      rating: 4,
      date: "2024-01-10",
      title: "Good value for money",
      comment: "Great product overall. The only minor issue is the packaging could be better, but the product itself is excellent.",
      verified: true,
      helpful: 18
    },
    {
      id: 3,
      userName: "Emma Davis",
      rating: 5,
      date: "2024-01-05",
      title: "Perfect!",
      comment: "Exactly what I was looking for. Fast shipping and great customer service. Will definitely buy again!",
      verified: false,
      helpful: 12
    }
  ]

  // Rating distribution (mock data)
  const ratingDistribution = [
    { rating: 5, count: 150, percentage: 65 },
    { rating: 4, count: 45, percentage: 20 },
    { rating: 3, count: 20, percentage: 8 },
    { rating: 2, count: 10, percentage: 4 },
    { rating: 1, count: 5, percentage: 3 }
  ]

  const renderStars = (rating: number, size: string = 'text-base') => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`${size} ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ⭐
      </span>
    ))
  }

  const filteredReviews = selectedRating === 0 
    ? reviews 
    : reviews.filter(review => review.rating === selectedRating)

  return (
    <section className="py-16 border-t border-gray-200">
      <div className="mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-8">
          Customer Reviews
        </h2>

        {/* Rating Summary */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                <div className="text-6xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {productRating}
                </div>
                <div>
                  <div className="flex">{renderStars(productRating, 'text-2xl')}</div>
                  <div className="text-gray-600 mt-1">
                    Based on {totalReviews.toLocaleString()} reviews
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowWriteReview(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Write a Review
              </button>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedRating(selectedRating === item.rating ? 0 : item.rating)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                      selectedRating === item.rating
                        ? 'bg-pink-200 text-pink-700'
                        : 'hover:bg-pink-100 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{item.rating}</span>
                    <span className="text-yellow-400">⭐</span>
                  </button>
                  
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

        {/* Filter Info */}
        {selectedRating > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-600">
              Showing {filteredReviews.length} reviews with {selectedRating} stars
            </span>
            <button
              onClick={() => setSelectedRating(0)}
              className="text-pink-600 hover:text-pink-700 font-medium transition-colors"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {review.userName.charAt(0)}
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-900">{review.userName}</h4>
                        {review.verified && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-gray-500 text-sm">
                          {new Date(review.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Review Title */}
                  <h5 className="text-xl font-semibold text-gray-900">
                    {review.title}
                  </h5>

                  {/* Review Comment */}
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Review Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span>Helpful ({review.helpful})</span>
                    </button>
                    
                    <button className="text-gray-500 hover:text-pink-600 transition-colors">
                      Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-500">
                {selectedRating > 0 
                  ? `No reviews with ${selectedRating} stars yet.`
                  : 'Be the first to write a review!'
                }
              </p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {filteredReviews.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:from-pink-100 hover:to-purple-100 hover:text-pink-600 transition-all duration-300 border border-gray-200 hover:border-pink-300">
              Load More Reviews
            </button>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {showWriteReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Write a Review</h3>
              <button
                onClick={() => setShowWriteReview(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-3xl text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
                  placeholder="Summarize your review"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none resize-none"
                  placeholder="Tell us about your experience with this product"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}