'use client'

import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import { useState } from 'react'

interface CartSidebarProps {
  isOpen: boolean
  setCartOpen: (open: boolean) => void
}

export default function CartSidebar({ isOpen, setCartOpen }: CartSidebarProps) {
  const { 
    items, 
    loading,
    getTotalItems, 
    getCartTotal, 
    updateQuantity, 
    removeFromCart 
  } = useCart()

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  if (!isOpen) return null

  const handleQuantityUpdate = async (cartItemId: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set([...prev, cartItemId]))
    await updateQuantity(cartItemId, newQuantity)
    setUpdatingItems(prev => {
      const next = new Set(prev)
      next.delete(cartItemId)
      return next
    })
  }

  const handleRemoveItem = async (cartItemId: string) => {
    setUpdatingItems(prev => new Set([...prev, cartItemId]))
    await removeFromCart(cartItemId)
    setUpdatingItems(prev => {
      const next = new Set(prev)
      next.delete(cartItemId)
      return next
    })
  }

  const itemCount = getTotalItems()
  const total = getCartTotal()

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-800">
            Shopping Cart ({itemCount})
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        )}

        {/* Cart Items */}
        {!loading && (
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l1.1 5m0 0h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-4">Add some products to get started!</p>
                <button
                  onClick={() => setCartOpen(false)}
                  className="bg-gradient-to-r from-pink-500 to-red-400 text-white px-6 py-2 rounded-full hover:from-pink-600 hover:to-red-500 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item) => {
                  const isUpdating = updatingItems.has(item.cartItemId || '')
                  
                  return (
                    <div 
                      key={item.cartItemId || item.id} 
                      className={`flex items-center space-x-4 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors ${isUpdating ? 'opacity-50' : ''}`}
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shadow-sm">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                        
                        {/* Size and Color */}
                        {(item.selectedSize || item.selectedColor) && (
                          <div className="text-xs text-gray-500 mb-2">
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            {item.selectedSize && item.selectedColor && <span> • </span>}
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-pink-600">${item.price.toFixed(2)}</span>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityUpdate(item.cartItemId || '', item.quantity - 1)}
                              disabled={isUpdating}
                              className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-8 text-center font-semibold">
                              {isUpdating ? '...' : item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityUpdate(item.cartItemId || '', item.quantity + 1)}
                              disabled={isUpdating}
                              className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.cartItemId || '')}
                        disabled={isUpdating}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!loading && items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-white">
            {/* Total */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-pink-600">${total.toFixed(2)}</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/cart"
                onClick={() => setCartOpen(false)}
                className="block w-full bg-gradient-to-r from-pink-500 to-red-400 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:to-red-500 transition-all font-semibold text-center"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={() => setCartOpen(false)}
                className="block w-full bg-gray-800 text-white py-3 px-6 rounded-xl hover:bg-gray-900 transition-all font-semibold text-center"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}