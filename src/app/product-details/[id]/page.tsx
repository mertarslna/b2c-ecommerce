// app/product-details/[id]/page.tsx - FIXED WITH INTERACTIVE STARS
'use client'

import { useParams } from 'next/navigation'
import { useProduct, useRelatedProducts } from '@/hooks/useProducts'
import ProductGallery from '@/components/ProductGallery'
import ProductInfo from '@/components/ProductInfo'
import ProductReviews from '@/components/ProductReviews'
import RelatedProducts from '@/components/RelatedProducts'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InteractiveStarRating from '@/components/InteractiveStarRating' // 👈 Import stars
import { WishlistProvider } from '@/contexts/WishlistContext'
import { CartProvider } from '@/contexts/CartContext'

function ProductDetailsPageContent() {
  const params = useParams()
  const productId = params.id as string

  // Fetch product data from API
  const { product, loading, error } = useProduct(productId)
  
  // Fetch related products from API - with safe defaults
  const { 
    relatedProducts = [], 
    loading: relatedLoading = false 
  } = useRelatedProducts(
    productId,
    product?.category?.name || '',
    8
  ) || {}

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
            
            {/* Reviews skeleton */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-16">
              <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
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
        <Footer />
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
            href={`/products?category=${product.category?.name || ''}`} 
            className="hover:text-pink-600 transition-colors"
          >
            {product.category?.name || 'Products'}
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
                images={product.images?.map(img => img.url) || [product.image] || []} 
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
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
                Product Details
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {product.description}
                </p>
                
                {/* Additional product details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6">
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex justify-between">
                          <strong>Category:</strong> 
                          <span>{product.category?.name || 'N/A'}</span>
                        </li>
                        <li className="flex justify-between">
                          <strong>Stock:</strong> 
                          <span className={(product.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}>
                            {(product.stock || 0) > 0 ? `${product.stock} available` : 'Out of stock'}
                          </span>
                        </li>
                        {/* 🔧 FIXED: Real stars instead of emoji */}
                        <li className="flex justify-between items-center">
                          <strong>Rating:</strong> 
                          <div className="flex items-center gap-2">
                            <InteractiveStarRating 
                              rating={product.rating || 0}
                              size="sm"
                              readonly
                            />
                            <span className="text-sm text-gray-600">
                              {(product.rating || 0).toFixed(1)}/5 ({product.reviews || 0} reviews)
                            </span>
                          </div>
                        </li>
                        <li className="flex justify-between">
                          <strong>Product ID:</strong> 
                          <span className="text-xs text-gray-500">{product.id}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Seller Information</h3>
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                          {(product.seller?.businessName || product.seller?.name || 'S').charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {product.seller?.businessName || product.seller?.name || 'Store Name'}
                          </h4>
                          <p className="text-gray-600">
                            by {product.seller?.name || 'Seller'}
                          </p>
                        </div>
                      </div>
                      {product.seller?.isVerified && (
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
        </div>

        {/* ✅ Reviews System - Safe Props */}
        <div className="bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden mb-16">
          <ProductReviews 
            productId={productId || ''}
            initialStats={{
              averageRating: product.rating || 0,
              totalReviews: product.reviews || 0
            }}
          />
        </div>

        {/* ✅ Related Products - Safe Props */}
        <RelatedProducts 
          currentProduct={product}
          products={relatedProducts}
          loading={relatedLoading}
          title="You might also like"
        />
      </div>
      
      <Footer />
    </div>
  )
}

// ✅ Main export with providers
export default function ProductDetailsPage() {
  return (
    <WishlistProvider>
      <CartProvider>
        <ProductDetailsPageContent />
      </CartProvider>
    </WishlistProvider>
  )
}