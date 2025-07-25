'use client'

import { useState } from 'react'
import ProductCard from '@/components/ProductCard'
import ProductFilter from '@/components/ProductFilter'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { ProductFilters } from '@/types/product'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { safeGetSearchParam } from '@/utils/queryParams'

export default function ProductsPage() {
  // Get search params from URL
  const searchParams = useSearchParams();
  const searchQuery = safeGetSearchParam(searchParams, 'q') || ''
  const categoryParam = safeGetSearchParam(searchParams, 'category') || ''
  
  // Filters state - initialized with URL params
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    category: categoryParam,
    minPrice: 0,
    maxPrice: 2000,
    rating: 0,
    search: searchQuery,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  // Update filters when URL params change (from Header search)
  useEffect(() => {
    const newSearch = safeGetSearchParam(searchParams, 'q') || ''
    const newCategory = safeGetSearchParam(searchParams, 'category') || ''
    
    setFilters(prev => ({
      ...prev,
      search: newSearch,
      category: newCategory,
      page: 1 // Reset page when search/category changes
    }))
  }, [searchParams])

  // Handle filter changes (from sidebar)
  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    console.log('🎯 Filter changed from sidebar:', newFilters)
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset page when filters change
    }))
  }

  // Fetch data using hooks
  const { products, pagination, loading: productsLoading, error: productsError } = useProducts(filters)
  const { categories, loading: categoriesLoading } = useCategories(true, true)

  // Debug logging
  useEffect(() => {
    console.log('🔍 Current filters:', filters)
    console.log('📊 Products count:', products.length)
    console.log('🔗 URL:', window.location.href)
    console.log('🔗 Search Params:', Object.fromEntries(searchParams.entries()))
  }, [filters, products, searchParams])

  // Loading state
  const isLoading = productsLoading || categoriesLoading

  // Handle filter changes
  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category,
      page: 1 // Reset to first page when filter changes
    }))
  }

  const handlePriceChange = (range: [number, number]) => {
    setFilters(prev => ({
      ...prev,
      minPrice: range[0],
      maxPrice: range[1],
      page: 1
    }))
  }

  const handleRatingChange = (rating: number) => {
    setFilters(prev => ({
      ...prev,
      rating,
      page: 1
    }))
  }

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as ProductFilters['sortBy'],
      sortOrder,
      page: 1
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }))
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      category: '',
      minPrice: 0,
      maxPrice: 2000,
      rating: 0,
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
  }

  // Get display title based on search and category
  const getPageTitle = () => {
    if (filters.search) {
      return `Search Results for "${filters.search}"`
    } else if (filters.category) {
      return `${filters.category} Products`
    }
    return 'Our Products'
  }

  const getPageDescription = () => {
    if (filters.search) {
      return `Found ${pagination?.totalCount || 0} products matching "${filters.search}"`
    } else if (filters.category) {
      return `Discover amazing ${filters.category.toLowerCase()} products from our database`
    }
    return 'Discover amazing products from our database with real-time filtering and search'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="pt-16"> {/* Add padding-top to account for fixed header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {getPageTitle()}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {getPageDescription()}
            </p>
            
            {/* Active filters display */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {filters.search && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700">
                  🔍 Search: "{filters.search}"
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '', page: 1 }))}
                    className="ml-2 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </span>
              )}
              
              {filters.category && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600">
                  📂 Category: {filters.category}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, category: '', page: 1 }))}
                    className="ml-2 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </span>
              )}
              
              {((filters.minPrice ?? 0) > 0 || (filters.maxPrice ?? 2000) < 2000) && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-700">
                  💰 Price: ${(filters.minPrice ?? 0)} - ${(filters.maxPrice ?? 2000)}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, minPrice: 0, maxPrice: 2000, page: 1 }))}
                    className="ml-2 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </span>
              )}
              
              {(filters.rating ?? 0) > 0 && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700">
                  ⭐ Rating: {filters.rating}+ stars
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, rating: 0, page: 1 }))}
                    className="ml-2 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap justify-between items-center mb-8 bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <span className="font-semibold text-gray-700">Sort by:</span>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-')
                  handleSortChange(sortBy, sortOrder as 'asc' | 'desc')
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="rating-asc">Lowest Rated</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {pagination ? `${pagination.totalCount} products found` : 'Loading...'}
              </span>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar - Filters */}
            <div className="lg:w-1/4">
              {categoriesLoading ? (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <ProductFilter
                  categories={categories.map(cat => cat.name)}
                  selectedCategory={filters.category || ''}
                  onCategoryChange={handleCategoryChange}
                  priceRange={[filters.minPrice || 0, filters.maxPrice || 2000]}
                  onPriceChange={handlePriceChange}
                  selectedRating={filters.rating || 0}
                  onRatingChange={handleRatingChange}
                />
              )}
            </div>

            {/* Main Content - Products */}
            <div className="lg:w-3/4">

              {/* Error State */}
              {productsError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center mb-8">
                  <div className="text-red-600 text-xl font-semibold mb-2">
                    ❌ Error Loading Products
                  </div>
                  <p className="text-red-500 mb-4">{productsError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                      <div className="h-64 bg-gray-200"></div>
                      <div className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Products Grid */}
              {!isLoading && !productsError && (
                <>
                  {products && products.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>

                      {/* Pagination */}
                      {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 bg-white rounded-2xl p-6 shadow-lg">
                          <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                          >
                            Previous
                          </button>

                          <div className="flex items-center gap-2">
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                              const pageNum = pagination.currentPage - 2 + i
                              if (pageNum < 1 || pageNum > pagination.totalPages) return null

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-4 py-2 rounded-xl transition-colors ${pageNum === pagination.currentPage
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              )
                            })}
                          </div>

                          <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* No Products Found */
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        No Products Found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {filters.search 
                          ? `No products match your search for "${filters.search}"`
                          : "Try adjusting your filters or search terms"
                        }
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}