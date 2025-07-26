// components/ProductInfo.tsx - PROFESSIONAL VERSION WITH 2 BUTTONS: BUY NOW & ADD TO CART
'use client'

import { useState } from 'react'
import { DetailedProduct } from '@/types/product'
import { useCart } from '@/contexts/CartContext'
import InteractiveStarRating from './InteractiveStarRating'

interface ProductInfoProps {
  product: DetailedProduct
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)

  const { addToCart } = useCart()

  // Mock data for variants
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Blue', value: '#3B82F6' }
  ]

  // Calculate discount
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, Math.min(10, quantity + change)))
  }

  // 🛒 Add to Cart Function
  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0]?.url || '/placeholder.jpg',
        category: product.category.name,
        rating: product.rating,
        reviews: product.reviews
      }, quantity, selectedSize, selectedColor)
      
      showNotification('Added to cart successfully! 🛒', 'success')
    } catch (error) {
      showNotification('Failed to add to cart', 'error')
    } finally {
      setIsAddingToCart(false)
    }
  }

  // 🚀 Buy Now Function - Direct to Checkout
  const handleBuyNow = async () => {
    setIsBuyingNow(true)
    try {
      // Create checkout data with product info
      const checkoutData = {
        items: [{
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images[0]?.url || '/placeholder.jpg',
          category: product.category.name,
          rating: product.rating,
          reviews: product.reviews,
          quantity: quantity,
          size: selectedSize,
          color: selectedColor
        }],
        totalAmount: product.price * quantity
      }
      
      // Store checkout data in sessionStorage for checkout page
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData))
      
      showNotification('Redirecting to checkout...', 'info')
      
      // Direct redirect to checkout without adding to cart
      setTimeout(() => {
        window.location.href = '/checkout'
      }, 800)
    } catch (error) {
      showNotification('Failed to process order', 'error')
    } finally {
      setIsBuyingNow(false)
    }
  }

  // 📋 Scroll to Reviews Function
  const handleScrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews')
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      })
    } else {
      // If reviews section doesn't exist, scroll to bottom of page
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      })
    }
    showNotification('Scrolling to reviews...', 'info')
  }

  // Notification helper
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

  const isOutOfStock = product.stock === 0

  return (
    <div className="space-y-8">
      {/* Product Title & Category */}
      <div>
        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 mb-4">
          {product.category.name}
        </div>
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
          {product.name}
        </h1>
        
        {/* Rating & Reviews - WITH SCROLL TO REVIEWS FUNCTIONALITY */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <InteractiveStarRating 
              rating={product.rating || 0}
              size="md"
              readonly
            />
            <span className="text-lg font-semibold text-gray-700">
              {(product.rating || 0).toFixed(1)}
            </span>
          </div>
          <div className="text-gray-500">
            ({(product.reviews || 0).toLocaleString()} reviews)
          </div>
          <button 
            onClick={handleScrollToReviews}
            className="text-pink-600 hover:text-pink-700 font-medium transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 rounded px-2 py-1"
          >
            See all reviews ⬇️
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
        <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
          ${product.price}
        </div>
        {product.originalPrice && (
          <>
            <div className="text-2xl text-gray-400 line-through">
              ${product.originalPrice}
            </div>
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold">
              Save {discountPercentage}%
            </div>
          </>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></div>
        <span className={`font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
          {isOutOfStock 
            ? 'Out of Stock' 
            : product.stock <= 5 
              ? `Only ${product.stock} left in stock!` 
              : 'In Stock'
          }
        </span>
      </div>

      {/* Product Description */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
        <div className="text-gray-600 leading-relaxed space-y-3">
          <p>{product.description}</p>
        </div>
      </div>

      {/* Size Selection */}
      {product.category.name.toLowerCase().includes('clothing') && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Size</h3>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedSize === size
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-pink-100 hover:text-pink-600 hover:scale-105'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <button className="text-pink-600 hover:text-pink-700 text-sm font-medium mt-2 transition-colors">
            Size Guide
          </button>
        </div>
      )}

      {/* Color Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color</h3>
        <div className="flex flex-wrap gap-4">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color.name)}
              className={`relative w-12 h-12 rounded-full border-4 transition-all duration-300 hover:scale-110 ${
                selectedColor === color.name
                  ? 'border-pink-500 scale-110'
                  : 'border-gray-300 hover:border-pink-300'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {selectedColor === color.name && (
                <div className="absolute inset-2 rounded-full bg-white/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
        {selectedColor && (
          <p className="text-sm text-gray-600 mt-2">Selected: {selectedColor}</p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-2xl">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="p-4 hover:bg-pink-100 hover:text-pink-600 rounded-l-2xl transition-colors"
              disabled={quantity <= 1}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="px-6 py-4 font-semibold text-lg min-w-[60px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-4 hover:bg-pink-100 hover:text-pink-600 rounded-2xl transition-colors"
              disabled={quantity >= 10 || quantity >= product.stock}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {product.stock > 0 ? `${product.stock} items available` : 'Out of stock'}
          </div>
        </div>
      </div>

      {/* 🎯 MAIN ACTION BUTTONS - PROFESSIONAL 2 BUTTONS LAYOUT */}
      <div className="space-y-4 pt-8">
        
        {/* Primary Action: Add to Cart */}
        <button 
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAddingToCart}
          className={`w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-95 relative overflow-hidden ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isAddingToCart
              ? 'bg-pink-400 text-white cursor-wait'
              : 'bg-gradient-to-r from-pink-500 to-red-400 text-white hover:from-pink-600 hover:to-red-500'
          }`}
        >
          {isAddingToCart && (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <span className={isAddingToCart ? 'opacity-0' : 'opacity-100'}>
            {isOutOfStock 
              ? 'Out of Stock' 
              : isAddingToCart 
              ? 'Adding to Cart...' 
              : `🛒 Add to Cart - $${(product.price * quantity).toFixed(2)}`
            }
          </span>
        </button>
        
        {/* Secondary Action: Buy Now */}
        <button 
          onClick={handleBuyNow}
          disabled={isOutOfStock || isBuyingNow}
          className={`w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 relative overflow-hidden ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isBuyingNow
              ? 'bg-purple-400 text-white cursor-wait'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
          }`}
        >
          {isBuyingNow && (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <span className={isBuyingNow ? 'opacity-0' : 'opacity-100'}>
            {isOutOfStock 
              ? 'Out of Stock' 
              : isBuyingNow 
              ? 'Processing...' 
              : `🚀 Buy Now - $${(product.price * quantity).toFixed(2)}`
            }
          </span>
        </button>
      </div>

      {/* Features */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Free Shipping</div>
              <div className="text-sm text-gray-600">On orders over $50</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900">2 Year Warranty</div>
              <div className="text-sm text-gray-600">Full protection</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900">30-Day Returns</div>
              <div className="text-sm text-gray-600">Easy returns</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900">24/7 Support</div>
              <div className="text-sm text-gray-600">Always here to help</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}