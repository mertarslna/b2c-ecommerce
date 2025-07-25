// src/app/cart/page.tsx
'use client'

import { useCart } from '@/contexts/CartContext'
import Header from '@/components/Header'
import Link from 'next/link'

export default function CartPage() {
  const { items, loading, updateQuantity, removeFromCart, getCartTotal, clearCart, getTotalItems } = useCart()

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-6 py-16">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your cart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-6 py-16">
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-16 max-w-lg mx-auto">
              <div className="text-8xl mb-6">🛒</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Your Cart is Empty
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Looks like you haven't added anything to your cart yet.
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
            <li className="text-pink-600 font-semibold">Shopping Cart</li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-pink-100 overflow-hidden mb-8">
              <div className="p-8 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Shopping Cart ({items.length} products, {getTotalItems()} items)
                  </h1>
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.cartItemId || item.id} className="p-8">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0 relative group">
                        <Link href={`/product-details/${item.id}`}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-32 h-32 object-cover rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 cursor-pointer hover:scale-105 transition-transform duration-300"
                          />
                          {/* Hover Overlay */}
                          
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              <Link 
                                href={`/product-details/${item.id}`}
                                className="hover:text-pink-600 transition-colors cursor-pointer"
                              >
                                {item.name}
                              </Link>
                            </h3>
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600 mb-2">
                              {item.category}
                            </div>
                            
                            {/* Quick Action Buttons */}
                            <div className="flex gap-2 mt-2">
                              <Link 
                                href={`/product-details/${item.id}`}
                                className="text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 rounded-md transition-colors"
                              >
                                📋 Details
                              </Link>
                              <button className="text-xs bg-green-100 text-green-600 hover:bg-green-200 px-2 py-1 rounded-md transition-colors">
                                📝 Review
                              </button>
                            </div>
                            {item.selectedSize && (
                              <div className="text-sm text-gray-600 mb-1">
                                Size: <span className="font-medium">{item.selectedSize}</span>
                              </div>
                            )}
                            {item.selectedColor && (
                              <div className="text-sm text-gray-600">
                                Color: <span className="font-medium">{item.selectedColor}</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.cartItemId || '')}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <div className="flex justify-between  items-center">
                          {/* Quantity Controls */}
                          <div className="flex items-center  shadow-lg text-davys-gray rounded-xl">
                            <button
                              onClick={() => updateQuantity(item.cartItemId || '', item.quantity - 1)}
                              className="p-3 hover:bg-pink-100 hover:text-pink-600 rounded-l-xl transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-4 py-3 font-semibold min-w-[60px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cartItemId || '', item.quantity + 1)}
                              className="p-3 hover:bg-pink-100 hover:text-pink-600 rounded-r-xl transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            {item.originalPrice && (
                              <div className="text-sm text-gray-400 line-through">
                                ${(item.originalPrice * item.quantity).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white text-davys-gray rounded-3xl shadow-xl border border-pink-100 p-8 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">${(getCartTotal() * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
                      ${(getCartTotal() * 1.1).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Link 
                  href="/checkout"
                  className="block w-full bg-gradient-to-r from-pink-500 to-red-400 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-center"
                >
                  Proceed to Checkout
                </Link>
                
                <Link href="/" className="block w-full text-center bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:from-pink-100 hover:to-purple-100 hover:text-pink-600 transition-all duration-300">
                  Continue Shopping
                </Link>
              </div>

              {/* Security Features */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">Secure Payment</span>
                  </div>
                  <div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">Free Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}