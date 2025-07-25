'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useUser } from '@/contexts/UserContext'
import { useCategories } from '@/hooks/useProducts'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const { getCartCount } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { user, isAuthenticated, logout } = useUser()
  const { categories } = useCategories(false, true) // Get parent categories only
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  // Get current search from URL if we're on products/search page
  const currentSearch = searchParams.get('q') || searchParams.get('search') || ''
  const [searchQuery, setSearchQuery] = useState(currentSearch)
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const cartCount = getCartCount()
  const wishlistCount = wishlistItems.length

  // Update search query when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get('q') || searchParams.get('search') || ''
    setSearchQuery(urlSearch)
  }, [searchParams])

  // Handle search form submission - نفس المنطق من الكود الأصلي
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // إذا كنا في صفحة المنتجات، ابقى فيها مع البحث
      if (pathname === '/products') {
        const params = new URLSearchParams(searchParams.toString())
        params.set('search', searchQuery.trim())
        params.delete('q') // استخدم search بدلاً من q
        params.set('page', '1') // اعادة تعيين الصفحة
        router.push(`/products?${params.toString()}`)
      } else {
        // اذهب إلى صفحة المنتجات مع البحث
        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      }
      setShowSearchSuggestions(false)
      searchInputRef.current?.blur()
    }
  }

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSearchSuggestions(value.length > 0)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSearchSuggestions(false)
    // نفس منطق البحث
    if (pathname === '/products') {
      const params = new URLSearchParams(searchParams.toString())
      params.set('search', suggestion)
      params.delete('q')
      params.set('page', '1')
      router.push(`/products?${params.toString()}`)
    } else {
      router.push(`/products?search=${encodeURIComponent(suggestion)}`)
    }
  }

  // Handle direct search from suggestions
  const handleDirectSearch = () => {
    if (searchQuery.trim()) {
      setShowSearchSuggestions(false)
      if (pathname === '/products') {
        const params = new URLSearchParams(searchParams.toString())
        params.set('search', searchQuery.trim())
        params.delete('q')
        params.set('page', '1')
        router.push(`/products?${params.toString()}`)
      } else {
        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      }
    }
  }

  // Quick search suggestions
  const searchSuggestions = [
    'iPhone 15 Pro',
    'MacBook Pro',
    'Samsung Galaxy',
    'Wireless Headphones',
    'Gaming Mouse',
    'Smartwatch',
    'Bluetooth Speaker'
  ].filter(suggestion => 
    suggestion.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
            {!isAuthenticated && (
              <Link href="/auth/login" className="hover:text-pink-200 transition-colors">
                Sign In
              </Link>
            )}
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

          {/* Search Bar - نفس منطق البحث من الكود الأصلي */}
          <div className="flex-1 mx-12 max-w-3xl">
            <form onSubmit={handleSearch} className="relative group">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for products, brands and more..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSearchSuggestions(searchQuery.length > 0)}
                  className="w-full px-6 py-4 text-lg border-2 border-pink-200 rounded-full focus:outline-none focus:border-pink-400 focus:shadow-lg transition-all duration-300 bg-pink-50/30 hover:bg-white pr-16"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-pink-500 to-red-400 text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              {/* Search Suggestions Dropdown */}
              {showSearchSuggestions && (searchSuggestions.length > 0 || searchQuery.length > 0) && (
                <div className="absolute top-full left-0 right-0 bg-white border border-pink-200 rounded-2xl shadow-xl z-50 mt-2 max-h-80 overflow-y-auto">
                  {searchSuggestions.length > 0 ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                        Popular Searches
                      </div>
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-pink-50 transition-colors flex items-center group"
                        >
                          <svg className="w-4 h-4 text-gray-400 mr-3 group-hover:text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="group-hover:text-pink-600">{suggestion}</span>
                        </button>
                      ))}
                    </>
                  ) : searchQuery.length > 0 && (
                    <button
                      onClick={handleDirectSearch}
                      className="w-full px-4 py-3 text-left hover:bg-pink-50 transition-colors flex items-center group"
                    >
                      <svg className="w-4 h-4 text-gray-400 mr-3 group-hover:text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="group-hover:text-pink-600">Search for "{searchQuery}"</span>
                    </button>
                  )}
                  
                  {/* Quick access to categories */}
                  {searchQuery.length > 1 && categories.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-100 bg-gray-50">
                        Browse Categories
                      </div>
                      {categories.slice(0, 3).map((category) => (
                        <Link
                          key={category.id}
                          href={`/products?category=${encodeURIComponent(category.name)}`}
                          onClick={() => setShowSearchSuggestions(false)}
                          className="block px-4 py-2 text-left hover:bg-pink-50 transition-colors"
                        >
                          <span className="text-gray-600 hover:text-pink-600">
                            📂 {category.name}
                            {category.productCount && (
                              <span className="text-xs text-gray-400 ml-2">({category.productCount} products)</span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </form>
            
            {/* Search hint text */}
            <div className="text-center mt-2">
              <p className="text-xs text-gray-500">
                💡 Try searching for "iPhone", "laptop", "headphones" or browse categories below
              </p>
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
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
                  {wishlistCount}
                </span>
              )}
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

      {/* Categories Navigation - Dynamic from Database */}
      <div className="bg-gradient-to-r from-pink-100 to-red-50 border-t border-pink-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Shop by Category</h3>
            <div className="flex space-x-8 overflow-x-auto">
              <Link href="/products" className="whitespace-nowrap px-4 py-2 text-gray-600 hover:text-pink-500 hover:bg-white rounded-full transition-all">
                🏠 All Products
              </Link>
              {categories.map(category => (
                <Link 
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.name)}`} 
                  className="whitespace-nowrap px-4 py-2 text-gray-600 hover:text-pink-500 hover:bg-white rounded-full transition-all"
                >
                  {category.name === 'Electronics' && '📱 '}
                  {category.name === 'Clothing' && '👗 '}
                  {category.name === 'Smartphones' && '📱 '}
                  {category.name === 'Laptops' && '💻 '}
                  {category.name}
                  {category.productCount !== undefined && (
                    <span className="ml-1 text-xs text-gray-400">({category.productCount})</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}