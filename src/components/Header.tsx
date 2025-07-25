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
  // Ensure useCategories returns nested categories by passing true for includeChildren
  const { categories } = useCategories(false, true) // Pass true to includeChildren to get nested categories
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // States
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  // Enhanced: State to manage which parent category's dropdown is open
  const [activeParentCategoryId, setActiveParentCategoryId] = useState<string | null>(null)
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const categoriesMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const cartCount = getCartCount()
  const wishlistCount = wishlistItems.length

  // Initialize search from URL
  useEffect(() => {
    const urlSearch = searchParams.get('search') || searchParams.get('q') || ''
    setSearchQuery(urlSearch)
  }, [searchParams])

  // Search suggestions
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

  // Enhanced: Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close search suggestions
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false)
      }
      
      // Close categories dropdown
      if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(event.target as Node)) {
        setActiveParentCategoryId(null)
      }
      
      // Close user menu
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Enhanced: Functions for smooth dropdown handling
  const handleCategoryMouseEnter = (categoryId: string) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout)
      setDropdownTimeout(null)
    }
    setActiveParentCategoryId(categoryId)
  }

  const handleCategoryMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveParentCategoryId(null)
    }, 200) // Small delay to prevent flickering
    setDropdownTimeout(timeout)
  }

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout)
      setDropdownTimeout(null)
    }
  }

  const handleCategoryClick = () => {
    setActiveParentCategoryId(null)
  }

  // دالة للتنقل مع البحث
  const navigateToSearch = (query: string) => {
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      router.push(`/products?search=${encodeURIComponent(trimmedQuery)}&page=1`)
    } else {
      router.push('/products')
    }
    setShowSearchSuggestions(false)
    searchInputRef.current?.blur()
  }

  // دالة لاختيار الاقتراح
  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion)
    navigateToSearch(suggestion)
  }

  // Filter for top-level categories (those with no parent)
  const parentCategories = categories.filter(category => !category.parent)

  // Enhanced: Helper function to get emoji for categories
  const getCategoryEmoji = (categoryName: string) => {
    const emojiMap: { [key: string]: string } = {
      'Electronics': '📱',
      'Clothing': '👗',
      'Smartphones': '📱',
      'Laptops': '💻',
      'Home & Living': '🏠',
      'Apparel & Fashion': '👕',
      'Health & Beauty': '💖',
      'Sports & Outdoors': '🏅',
      'Books': '📚',
      'Toys & Games': '🎮',
      'Automotive': '🚗',
      'Food & Beverages': '🍔',
      'Jewelry': '💎',
      'Music & Movies': '🎵',
      'Garden & Outdoor': '🌱'
    }
    return emojiMap[categoryName] || '📦'
  }

  return (
    <header className="bg-white shadow-lg border-b border-pink-100 relative z-50">
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

          {/* Search Bar */}
          <div className="flex-1 mx-12 max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                navigateToSearch(searchQuery)
              }}
              className="relative group"
            >
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value
                    setSearchQuery(value)
                    setShowSearchSuggestions(value.length > 0)
                  }}
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

              {/* Search Suggestions */}
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
                          onClick={() => selectSuggestion(suggestion)}
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
                      onClick={() => navigateToSearch(searchQuery)}
                      className="w-full px-4 py-3 text-left hover:bg-pink-50 transition-colors flex items-center group"
                    >
                      <svg className="w-4 h-4 text-gray-400 mr-3 group-hover:text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="group-hover:text-pink-600">Search for "{searchQuery}"</span>
                    </button>
                  )}
                </div>
              )}
            </form>
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
              <div className="relative" ref={userMenuRef}>
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

      {/* Enhanced Categories Navigation */}
      <div className="bg-gradient-to-r from-pink-100 to-red-50 border-t border-pink-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Shop by Category</h3>
            <div className="flex items-center space-x-1 overflow-visible categories-nav-container" ref={categoriesMenuRef}>
              {/* All Products Link */}
              <Link 
                href="/products" 
                className="whitespace-nowrap px-4 py-2 text-gray-600 hover:text-pink-500 hover:bg-white rounded-full transition-all flex items-center"
              >
                🏠 All Products
              </Link>
              
              {/* Parent Categories with Enhanced Dropdowns */}
              {parentCategories.map(category => (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => handleCategoryMouseEnter(category.id)}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  <Link
                    href={`/products?category=${encodeURIComponent(category.name)}&categoryId=${category.id}`}
                    className="whitespace-nowrap px-4 py-2 text-gray-600 hover:text-pink-500 hover:bg-white rounded-full transition-all flex items-center group"
                    onClick={handleCategoryClick}
                  >
                    <span className="flex items-center">
                      {getCategoryEmoji(category.name)} 
                      <span className="ml-2">{category.name}</span>
                      {category.productCount !== undefined && (
                        <span className="ml-1 text-xs text-gray-400">({category.productCount})</span>
                      )}
                      {/* Enhanced Arrow icon for dropdown */}
                      {category.hasChildren && category.children && category.children.length > 0 && (
                        <svg 
                          className={`w-4 h-4 ml-2 transform transition-transform duration-200 ${
                            activeParentCategoryId === category.id ? 'rotate-180' : 'rotate-0'
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </span>
                  </Link>

                  {/* Enhanced Sub-categories Dropdown */}
                  {category.hasChildren && category.children && category.children.length > 0 && activeParentCategoryId === category.id && (
                    <div 
                      className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-pink-100 z-50 min-w-[280px] max-w-[400px] animate-fadeIn"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleCategoryMouseLeave}
                      style={{
                        animation: 'fadeInDown 0.2s ease-out forwards',
                        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      {/* Dropdown Header */}
                      <div className="px-5 py-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-red-50 rounded-t-xl">
                        <h4 className="font-semibold text-gray-800 text-sm flex items-center">
                          {getCategoryEmoji(category.name)} 
                          <span className="ml-2">{category.name}</span>
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {category.children.length} subcategories available
                        </p>
                      </div>
                      
                      {/* Sub-categories List */}
                      <div className="py-2">
                        {category.children.map((subCategory, index) => (
                          <Link
                            key={subCategory.id}
                            href={`/products?category=${encodeURIComponent(subCategory.name)}&categoryId=${subCategory.id}`}
                            className="flex items-center justify-between px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-red-50 hover:text-pink-600 transition-all duration-200 group border-l-4 border-transparent hover:border-pink-400"
                            onClick={handleCategoryClick}
                          >
                            <span className="flex items-center flex-1">
                              <span className="w-2 h-2 bg-pink-300 rounded-full mr-3 group-hover:bg-pink-500 transition-colors" />
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">{subCategory.name}</span>
                                {subCategory.description && (
                                  <span className="text-xs text-gray-400 group-hover:text-pink-500 mt-1">
                                    {subCategory.description}
                                  </span>
                                )}
                              </div>
                            </span>
                            {subCategory.productCount !== undefined && subCategory.productCount > 0 && (
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors font-medium">
                                {subCategory.productCount}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                      
                      {/* View All Link */}
                      <div className="border-t border-pink-100 px-5 py-3 bg-gray-50 rounded-b-xl">
                        <Link
                          href={`/products?category=${encodeURIComponent(category.name)}&categoryId=${category.id}`}
                          className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center justify-center group"
                          onClick={handleCategoryClick}
                        >
                          <span>View All in {category.name}</span>
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations and dropdown fixes */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeInDown 0.2s ease-out forwards;
        }

        /* Force dropdown to expand naturally without scroll */
        .category-dropdown {
          max-height: none !important;
          height: auto !important;
          overflow: visible !important;
        }

        /* Ensure parent container allows overflow */
        .categories-nav-container {
          overflow: visible !important;
        }

        /* Remove any scroll bars from dropdowns */
        .dropdown-content {
          overflow: visible !important;
          max-height: none !important;
          height: auto !important;
        }
      `}</style>
    </header>
  )
}