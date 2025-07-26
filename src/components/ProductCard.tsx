// components/ProductCard.tsx - FIXED WITH REAL STAR DATA
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { Product } from '@/types/product'
import InteractiveStarRating from './InteractiveStarRating' // 👈 Import the real star component

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  // Calculate discount percentage
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  // Success Toast Component
  const SuccessToast = () => (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      showSuccessToast 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className="bg-white border border-pink-200 rounded-xl shadow-xl p-4 flex items-center space-x-3 min-w-[300px]">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Added to Cart!</p>
          <p className="text-xs text-gray-500">{product.name}</p>
        </div>
        <button
          onClick={() => setShowSuccessToast(false)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )

  // Handle add to cart with success notification
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault() 
    e.stopPropagation()
    
    setIsAddingToCart(true)
    try {
      await addToCart(product, 1)
      
      setShowSuccessToast(true)
      setTimeout(() => {
        setShowSuccessToast(false)
      }, 3000)
      
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Updated wishlist toggle with optimistic updates
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isToggling) return
    
    setIsToggling(true)
    try {
      await toggleWishlist(product)
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    } finally {
      setIsToggling(false)
    }
  }

  const inWishlist = isInWishlist(product.id.toString())

  return (
    <>
      <SuccessToast />
      
      <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-pink-100 hover:border-pink-300 transform hover:-translate-y-2 relative">
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={isToggling}
          className={`absolute top-4 right-4 p-3 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 z-20 ${
            isToggling ? 'scale-90' : 'hover:scale-110'
          } ${
            inWishlist 
              ? 'bg-red-50 hover:bg-red-100' 
              : 'bg-white/80 hover:bg-white'
          }`}
        >
          <svg 
            className={`w-6 h-6 transition-all duration-200 ${
              isToggling ? 'animate-pulse' : ''
            } ${
              inWishlist 
                ? 'text-red-500' 
                : 'text-gray-400 hover:text-red-400'
            }`} 
            fill={inWishlist ? '#ef4444' : 'none'} 
            stroke="currentColor" 
            strokeWidth={inWishlist ? "0" : "2"}
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        </button>

        {/* Product Image - Clickable */}
        <Link href={`/product-details/${product.id}`} className="block">
          <div className="relative h-64 overflow-hidden rounded-t-2xl bg-gradient-to-br from-pink-50 to-purple-50">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'
              }}
            />
            
            {/* Stock Badge */}
            {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                Only {product.stock} left!
              </div>
            )}

            {/* Out of Stock Badge */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                  Out of Stock
                </div>
              </div>
            )}
            
            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                -{discountPercentage}%
              </div>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-6">
          {/* Category */}
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 mb-3">
            {product.category}
          </div>

          {/* Product Name - Clickable */}
          <Link href={`/product-details/${product.id}`}>
            <h3 className="font-bold text-gray-800 mb-3 line-clamp-2 hover:text-pink-600 cursor-pointer transition-colors text-lg leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Seller Info */}
          {product.seller && (
            <div className="text-sm text-gray-500 mb-2">
              by {product.seller.businessName || product.seller.name}
            </div>
          )}

          {/* 🔧 FIXED: Real Rating with Interactive Stars */}
          <div className="flex items-center mb-4 gap-2">
            <InteractiveStarRating 
              rating={product.rating || 0}
              size="sm"
              readonly
            />
            <span className="text-sm text-gray-600 font-medium">
              {(product.rating || 0).toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">
              ({product.reviews || 0} {product.reviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Enhanced Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAddingToCart}
            className={`w-full py-3 px-6 rounded-xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 relative overflow-hidden ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isAddingToCart
                ? 'bg-pink-400 text-white cursor-wait'
                : 'bg-gradient-to-r from-pink-500 to-red-400 text-white hover:from-pink-600 hover:to-red-500'
            }`}
          >
            {isAddingToCart && (
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <span className={isAddingToCart ? 'opacity-0' : 'opacity-100'}>
              {product.stock === 0 
                ? 'Out of Stock' 
                : isAddingToCart 
                ? 'Adding...' 
                : 'Add to Cart'
              }
            </span>
          </button>
        </div>

        {/* Floating Animation Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
      </div>
    </>
  )
}