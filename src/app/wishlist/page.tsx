// src/app/wishlist/page.tsx
'use client'

import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import Header from '@/components/Header'
import Link from 'next/link'

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()

  const handleMoveToCart = (item: any) => {
    // Add to cart
    addToCart(item, 1)
    // Remove from wishlist
    removeFromWishlist(item.id)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-6 py-16">
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-16 max-w-lg mx-auto">
              <div className="text-8xl mb-6">💖</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Your Wishlist is Empty
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Save your favorite items for later by clicking the heart icon.
              </p>
              <Link 
                href="/"
                className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-10 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-6">
        <nav className="text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-500 hover:text-pink-600 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-pink-600 font-semibold">My Wishlist</li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              My Wishlist
            </h1>
            <p className="text-xl text-gray-600">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          
          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="mt-4 sm:mt-0 text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
              
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden">
                <Link href={`/product-details/${item.id}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </Link>
                
                {/* Remove from Wishlist Button */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 hover:scale-110 transition-all duration-300 group/remove"
                >
                  <svg className="w-5 h-5 text-red-500 group-hover/remove:text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>

                {/* Discount Badge */}
                {item.originalPrice && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                  </div>
                )}

                {/* Added Date */}
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                {/* Category */}
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 mb-3">
                  {item.category}
                </div>

                {/* Product Name */}
                <Link href={`/product-details/${item.id}`}>
                  <h3 className="font-bold text-gray-800 mb-3 line-clamp-2 hover:text-pink-600 cursor-pointer transition-colors text-lg leading-tight">
                    {item.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center mr-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${star <= item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">({item.reviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
                      ${item.price}
                    </span>
                    {item.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        ${item.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-400 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:to-red-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
                  >
                    Move to Cart 🛒
                  </button>
                  
                  <Link 
                    href={`/product-details/${item.id}`}
                    className="block w-full text-center bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:from-pink-100 hover:to-purple-100 hover:text-pink-600 transition-all duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              {/* Floating Animation Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Love Everything?</h3>
            <p className="text-gray-600 mb-6">Add all your wishlist items to cart and start checking out!</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  // Add all items to cart
                  items.forEach(item => {
                    addToCart(item, 1)
                    removeFromWishlist(item.id)
                  })
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Add All to Cart 🛒
              </button>
              
              <Link
                href="/"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue Shopping 🛍️
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}