// src/app/search/page.tsx - Debug Version
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { ProductFilters } from '@/types/product'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  
  // Debug: Log URL params
  console.log('🔍 SearchContent - URL params:', {
    q: searchParams.get('q'),
    category: searchParams.get('category'),
    allParams: Object.fromEntries(searchParams.entries())
  })
  
  // Filter states with safe initialization
  const [filters, setFilters] = useState<ProductFilters>(() => {
    const initialFilters = {
      page: 1,
      limit: 12,
      search: query,
      sortBy: 'created_at' as const,
      sortOrder: 'desc' as const,
      category: searchParams.get('category') || 'all',
      minPrice: 0,
      maxPrice: 10000
    }
    
    console.log('🎯 Initial filters:', initialFilters)
    return initialFilters
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(false)

  // Fetch data using custom hooks
  const { products, pagination, loading, error } = useProducts(filters)
  const { categories, loading: categoriesLoading } = useCategories(true, false)

  // Debug: Log hooks data
  useEffect(() => {
    console.log('📊 Search Results:', {
      query,
      filters,
      productsCount: products.length,
      loading,
      error,
      pagination
    })
  }, [query, filters, products, loading, error, pagination])

  // Update filters when search query changes
  useEffect(() => {
    console.log('🔄 URL changed, updating filters:', { 
      newQuery: query, 
      oldSearch: filters.search 
    })
    
    if (query !== filters.search) {
      setFilters(prev => ({ 
        ...prev, 
        search: query, 
        page: 1 
      }))
    }
  }, [query])

  // Get unique brands from products
  const brands = [...new Set(products.map(p => p.seller?.businessName || p.seller?.name).filter(Boolean))]

  // Filter products by stock if needed
  const filteredProducts = inStockOnly 
    ? products.filter(product => product.stock && product.stock > 0)
    : products

  // Handle filter changes
  const updateFilter = (key: keyof ProductFilters, value: any) => {
    console.log('🔧 Updating filter:', { key, value })
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const updatePriceRange = (min: number, max: number) => {
    console.log('💰 Updating price range:', { min, max })
    setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max, page: 1 }))
  }

  const clearAllFilters = () => {
    console.log('🧹 Clearing all filters')
    setFilters({
      page: 1,
      limit: 12,
      search: query,
      sortBy: 'created_at',
      sortOrder: 'desc',
      category: 'all',
      minPrice: 0,
      maxPrice: 10000
    })
    setInStockOnly(false)
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    console.log('📄 Changing page to:', newPage)
    setFilters(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Debug component for development
  const DebugInfo = () => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm">
      <h3 className="font-bold text-yellow-800 mb-2">🐛 Debug Info:</h3>
      <div className="grid grid-cols-2 gap-4 text-yellow-700">
        <div>
          <strong>URL Query:</strong> "{query}"<br/>
          <strong>Filter Search:</strong> "{filters.search}"<br/>
          <strong>Products Found:</strong> {products.length}<br/>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Error:</strong> {error || 'None'}<br/>
          <strong>API Called:</strong> {filters.search ? 'Yes' : 'No'}<br/>
          <strong>Categories:</strong> {categories.length}<br/>
          <strong>Current Page:</strong> {filters.page}
        </div>
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left max-w-lg mx-auto">
              <pre className="text-sm text-red-700">
                Query: "{query}"{'\n'}
                Filters: {JSON.stringify(filters, null, 2)}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-pink-500 to-red-400 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-red-500 transition-all"
            >
              Try Again
            </button>
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
              <Link href="/" className="text-gray-500 hover:text-pink-600 transition-colors">Home</Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-pink-600 font-semibold">
              Search Results {query && `for "${query}"`}
            </li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-6 pb-16">
        
        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && <DebugInfo />}

        {/* Results Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {query ? `Search Results for "${query}"` : 'All Products'}
            </h1>
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${pagination?.totalCount || 0} ${(pagination?.totalCount || 0) === 1 ? 'product' : 'products'} found`}
            </p>
            {query && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-500">Search term:</span>
                <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                  "{query}"
                </span>
                <Link 
                  href="/search" 
                  className="text-pink-600 hover:text-pink-700 text-sm ml-2 underline"
                >
                  Clear search
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden bg-gradient-to-r from-pink-500 to-red-400 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters & Sort
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Quick test - Direct API call */}
          <div className="lg:col-span-4 mb-4">
            <button
              onClick={async () => {
                console.log('🧪 Testing direct API call...')
                try {
                  const response = await fetch('/api/products?search=iPhone')
                  const data = await response.json()
                  console.log('📱 Direct API response:', data)
                  alert(`API test: ${data.success ? 'SUCCESS' : 'FAILED'} - Found ${data.data?.products?.length || 0} products`)
                } catch (err) {
                  console.error('❌ API test failed:', err)
                  alert('API test failed - check console')
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
            >
              🧪 Test API (iPhone)
            </button>
          </div>

          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-pink-600 hover:text-pink-700 font-semibold"
                >
                  Clear All
                </button>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">Sort By</label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-')
                    updateFilter('sortBy', sortBy)
                    updateFilter('sortOrder', sortOrder)
                  }}
                  className="w-full p-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                </select>
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded"
                  />
                  <span className="ml-3 text-gray-700 font-semibold">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              // Loading State
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-6 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 rounded-lg bg-white border border-pink-200 text-gray-600 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const page = i + 1
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg ${
                              page === pagination.currentPage
                                ? 'bg-gradient-to-r from-pink-500 to-red-400 text-white'
                                : 'bg-white border border-pink-200 text-gray-600 hover:bg-pink-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (
                        page === pagination.currentPage - 3 ||
                        page === pagination.currentPage + 3
                      ) {
                        return <span key={page} className="px-2 text-gray-400">...</span>
                      }
                      return null
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 rounded-lg bg-white border border-pink-200 text-gray-600 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              // No Products Found
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-16 max-w-lg mx-auto">
                  <div className="text-8xl mb-6">🔍</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    No Products Found
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    {query 
                      ? `No products match your search for "${query}"`
                      : "No products match your current filters"
                    }
                  </p>
                  <div className="bg-gray-50 border rounded-lg p-4 mb-6 text-left text-sm">
                    <strong>Search Query:</strong> "{query}"<br/>
                    <strong>Applied Filters:</strong> {JSON.stringify(filters, null, 2)}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={clearAllFilters}
                      className="bg-gradient-to-r from-pink-500 to-red-400 text-white px-8 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-red-500 transition-all duration-300"
                    >
                      Clear Filters
                    </button>
                    <Link
                      href="/"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-center"
                    >
                      Browse All Products
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-pink-600">Loading Search...</h2>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}