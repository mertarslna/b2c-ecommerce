'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useUser } from '@/contexts/UserContext'
import { useState } from 'react'

export default function Header() {
  const { getCartCount } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { user, isAuthenticated, logout } = useUser()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const cartCount = getCartCount()
  const wishlistCount = wishlistItems.length

  return (
    <header className="bg-white shadow-lg border-b border-pink-100">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-pink-500 to-red-400 text-white py-2 px-4 text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <span>Welcome to REAL Marketplace</span>
          <div className="flex space-x-6">
            <Link href="/seller/auth" className="hover:text-pink-200 transition-colors">
              Become a Seller
            </Link>
            <Link href="/auth/login" className="hover:text-pink-200 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-red-400 bg-clip-text text-transparent hover:scale-105 transition-transform">
              REAL
            </Link>
          </div>

          {/* Search Bar - Enhanced */}
          <div className="flex-1 mx-12 max-w-2xl">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                className="w-full px-6 py-4 text-lg border-2 border-pink-200 rounded-full focus:outline-none focus:border-pink-400 focus:shadow-lg transition-all duration-300 bg-pink-50/30 hover:bg-white"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-pink-500 to-red-400 text-white p-3 rounded-full hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Cart & Wishlist & User */}
          <div className="flex items-center space-x-6">
            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-3 text-gray-600 hover:text-pink-500 hover:scale-110 transition-all group">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
             
            </Link>
            
            {/* Cart */}
            <Link href="/cart" className="relative p-3 text-gray-600 hover:text-pink-500 hover:scale-110 transition-all group">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13l1.1 5m0 0h10M6 21a1 1 0 100-2 1 1 0 000 2zm12 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {/* User Profile */}
            {!isAuthenticated ? (
              <Link href="/auth/login" className="p-3 text-gray-600 hover:text-pink-500 hover:scale-110 transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center p-2 text-gray-600 hover:text-pink-500 transition-all rounded-full hover:bg-pink-50"
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-pink-100 py-2 min-w-[200px] z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    
                    <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </span>
                    </Link>
                    
                    <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6a2 2 0 002 2h4a2 2 0 002-2v-6M8 11h8" />
                        </svg>
                        My Orders
                      </span>
                    </Link>
                    
                    <Link href="/wishlist" className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Wishlist
                      </span>
                    </Link>
                    
                    <hr className="my-2" />
                    
                    <button 
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Navigation - Sidebar Style */}
      <div className="bg-gradient-to-r from-pink-100 to-red-50 border-t border-pink-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Shop by Category</h3>
            <div className="flex space-x-8 overflow-x-auto">
              <Link href="/category/electronics" className="whitespace-nowrap px-4 py-2 text-gray-600 hover:text-pink-500 hover:bg-white rounded-full transition-all">
                📱 Electronics
              </Link>
              <Link href="/category/fashion" className="whitespace-nowrap px-4 py-2 text-gray-600 hover:text-pink-500 hover:bg-white rounded-full transition-all">
                👗 Fashion
              </Link>
              <Link href="/category/home" className="whitespace-nowrap px-4 py-2 text-gray-600 hover:text-pink-500 hover:bg-white rounded-full transition-all">
                🏠 Home & Garden
              </Link>
              <Link href="/category/sports" className="whitespace-nowrap px-4 py-2 text-gray-600 hover:text-pink-500 hover:bg-white rounded-full transition-all">
                ⚽ Sports
              </Link>
              <Link href="/category/beauty" className="whitespace-nowrap px-4 py-2 text-gray-600 hover:text-pink-500 hover:bg-white rounded-full transition-all">
                💄 Beauty
              </Link>
              <Link href="/category/books" className="whitespace-nowrap px-4 py-2 text-gray-600 hover:text-pink-500 hover:bg-white rounded-full transition-all">
                📚 Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}