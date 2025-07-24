'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'  // 🔥 هذا المهم!

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  reviews: number
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  // 🔥 استخدام Cart Context (بس للإضافة فقط)
  const { addToCart } = useCart()
  // 💖 استخدام Wishlist Context
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  // Calculate discount percentage
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-sm ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ⭐
        </span>
      )
    }
    return stars
  }

  // 🔥 دالة إضافة للسلة الحقيقية
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)  // إضافة للسلة
    console.log('Added to cart:', product.name)
  }

  // 💖 دالة إدارة المفضلات
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  // 💖 فحص إذا المنتج في المفضلات
  const inWishlist = isInWishlist(product.id)

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-pink-100 hover:border-pink-300 transform hover:-translate-y-2 relative">
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-4 right-4 p-3 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all duration-300 z-20 group/wishlist ${
          inWishlist 
            ? 'bg-red-100 hover:bg-red-200' 
            : 'bg-white/80 hover:bg-white'
        }`}
      >
        <svg 
          className={`w-5 h-5 transition-colors ${
            inWishlist 
              ? 'text-red-500 fill-current' 
              : 'text-gray-600 group-hover/wishlist:text-red-500'
          }`} 
          fill={inWishlist ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Product Image - Clickable */}
      <Link href={`/product-details/${product.id}`} className="block">
        <div className="relative h-64 overflow-hidden rounded-t-2xl bg-gradient-to-br from-pink-50 to-purple-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
              -{discountPercentage}%
            </div>
          )}

          {/* Quick View on Hover */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-lg">
              Click to view details
            </div>
          </div>
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

        {/* Rating and Reviews */}
        <div className="flex items-center mb-4">
          <div className="flex items-center mr-3">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button - واقعي! */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-pink-500 to-red-400 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:to-red-500 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
        >
          Add to Cart
        </button>
      </div>

      {/* Floating Animation Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
    </div>
  )
}