'use client'

import { useParams } from 'next/navigation'
import { useProduct, useRelatedProducts } from '@/hooks/useProducts'
import ProductGallery from '@/components/ProductGallery'
import ProductInfo from '@/components/ProductInfo'
import RelatedProducts from '@/components/RelatedProducts'
import Header from '@/components/Header'

export default function ProductDetailsPage() {
  const params = useParams()
  const productId = params.id as string

  // Fetch product data from API
  const { product, loading, error } = useProduct(productId)
  
  // Fetch related products from API
  const { relatedProducts, loading: relatedLoading } = useRelatedProducts(
    productId,
    product?.category.name || '',
    8
  )

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            {/* Breadcrumb skeleton */}
            <div className="h-6 bg-gray-200 rounded w-64 mb-8"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Image skeleton */}
              <div className="aspect-square bg-gray-200 rounded-3xl"></div>
              
              {/* Info skeleton */}
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="text-6xl mb-6">😕</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Product Not Found
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {error || 'The product you are looking for does not exist or has been removed.'}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.history.back()}
                className="bg-gray-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                Go Back
              </button>
              <a
                href="/products"
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all inline-block"
              >
                Browse Products
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <a href="/" className="hover:text-pink-600 transition-colors">Home</a>
          <span>›</span>
          <a href="/products" className="hover:text-pink-600 transition-colors">Products</a>
          <span>›</span>
          <a 
            href={`/products?category=${product.category.name}`} 
            className="hover:text-pink-600 transition-colors"
          >
            {product.category.name}
          </a>
          <span>›</span>
          <span className="text-gray-800 font-semibold">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8">
            
            {/* Product Gallery */}
            <div>
              <ProductGallery 
                images={product.images.map(img => img.url)} 
                productName={product.name}
              />
            </div>

            {/* Product Info */}
            <div>
              <ProductInfo product={product} />
            </div>
          </div>

          {/* Product Description Tabs */}
          <div className="border-t border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Product Details</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {product.description}
                </p>
                
                {/* Additional product details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Category:</strong> {product.category.name}</li>
                      <li><strong>Stock:</strong> {product.stock} available</li>
                      <li><strong>Rating:</strong> {product.rating}/5 ({product.reviews} reviews)</li>
                      <li><strong>Product ID:</strong> {product.id}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Seller Information</h3>
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                          {product.seller.businessName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{product.seller.businessName}</h4>
                          <p className="text-gray-600">by {product.seller.name}</p>
                        </div>
                      </div>
                      {product.seller.isVerified && (
                        <div className="flex items-center text-green-600 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified Seller
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {product.detailedReviews && product.detailedReviews.length > 0 && (
            <div className="border-t border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{product.rating}/5</div>
                  <div className="text-gray-600">{product.reviews} reviews</div>
                </div>
              </div>

              {/* Review Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center mb-2">
                      <span className="w-3">{rating}</span>
                      <div className="flex items-center mx-3">
                        {[...Array(rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-sm">⭐</span>
                        ))}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ 
                            width: `${product.reviewStats ? (product.reviewStats[rating as keyof typeof product.reviewStats] / product.reviews) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {product.reviewStats ? product.reviewStats[rating as keyof typeof product.reviewStats] : 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {product.detailedReviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="flex mr-3">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="font-semibold text-gray-900">{review.customer.name}</span>
                          {review.isVerified && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        {review.title && (
                          <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                    )}
                    
                    {(review.pros.length > 0 || review.cons.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {review.pros.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-green-700 mb-2">👍 Pros:</h5>
                            <ul className="text-gray-600 space-y-1">
                              {review.pros.map((pro, i) => (
                                <li key={i}>• {pro}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {review.cons.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-red-700 mb-2">👎 Cons:</h5>
                            <ul className="text-gray-600 space-y-1">
                              {review.cons.map((con, i) => (
                                <li key={i}>• {con}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center mt-3 text-sm text-gray-500">
                      <button className="hover:text-pink-600 transition-colors">
                        👍 Helpful ({review.helpfulCount})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}