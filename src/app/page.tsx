'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import { useProducts, useCategories } from '@/hooks/useProducts'
import Footer from '@/components/Footer'

export default function Home() {
  // Fetch featured products (limited to 10 for homepage)
  const { products: featuredProducts, loading: productsLoading } = useProducts({
    limit: 10,
    page: 1,
    sortBy: 'rating',
    sortOrder: 'desc'
  })

  // Fetch categories for the categories section
  const { categories, loading: categoriesLoading } = useCategories(true, true)

  // Create static category icons and background images mapping
  const categoryIcons: { [key: string]: { icon: string; bgImage: string; overlay: string } } = {
    'Electronics': { 
      icon: '💻', 
      bgImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-blue-900/80 to-blue-700/60'
    },
    'Smartphones': { 
      icon: '📱', 
      bgImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-gray-900/80 to-gray-700/60'
    },
    'Laptops': { 
      icon: '💻', 
      bgImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-slate-900/80 to-slate-700/60'
    },
    'Tablets': { 
      icon: '📱', 
      bgImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-indigo-900/80 to-indigo-700/60'
    },
    'Televisions & Audio': { 
      icon: '📺', 
      bgImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-purple-900/80 to-purple-700/60'
    },
    'Home & Living': { 
      icon: '🏠', 
      bgImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-green-900/80 to-green-700/60'
    },
    'Furniture': { 
      icon: '🛋️', 
      bgImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-amber-900/80 to-amber-700/60'
    },
    'Kitchenware': { 
      icon: '🍳', 
      bgImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-orange-900/80 to-orange-700/60'
    },
    'Apparel & Fashion': { 
      icon: '👕', 
      bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-pink-900/80 to-pink-700/60'
    },
    'Women\'s Apparel': { 
      icon: '👗', 
      bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-rose-900/80 to-rose-700/60'
    },
    'Men\'s Apparel': { 
      icon: '👔', 
      bgImage: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-blue-900/80 to-blue-700/60'
    },
    'Kids\' & Baby Apparel': { 
      icon: '👶', 
      bgImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-yellow-900/80 to-yellow-700/60'
    },
    'Health & Beauty': { 
      icon: '💖', 
      bgImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-pink-900/80 to-pink-700/60'
    },
    'Skincare': { 
      icon: '🧴', 
      bgImage: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-teal-900/80 to-teal-700/60'
    },
    'Makeup': { 
      icon: '💄', 
      bgImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-purple-900/80 to-purple-700/60'
    },
    'Sports & Outdoors': { 
      icon: '🏅', 
      bgImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-green-900/80 to-green-700/60'
    },
    'Fitness Equipment': { 
      icon: '🏋️', 
      bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-red-900/80 to-red-700/60'
    },
    'Outdoor Gear': { 
      icon: '🏕️', 
      bgImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      overlay: 'from-emerald-900/80 to-emerald-700/60'
    },
  }

  // Default fallback for unknown categories
  const getDefaultCategoryInfo = () => ({
    icon: '📦',
    bgImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    overlay: 'from-gray-900/80 to-gray-700/60'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />

      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-r from-pink-500 via-red-400 to-purple-500 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)' }}></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Discover Amazing Products
            <span className="block text-4xl font-light mt-2 text-pink-200">at Incredible Prices</span>
          </h1>
          <p className="text-2xl mb-10 text-pink-100 max-w-3xl mx-auto leading-relaxed">
            Real products from verified sellers, all in one beautiful marketplace
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/products"
              className="bg-white text-pink-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-50 transition-all duration-300 shadow-2xl hover:shadow-pink-200/50 hover:scale-105 transform inline-block"
            >
              Start Shopping Now
            </Link>
            <button className="border-2 border-white text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-pink-600 transition-all duration-300 hover:scale-105 transform">
              Become a Seller
            </button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce delay-2000"></div>
        <div className="absolute top-1/2 right-10 w-12 h-12 bg-white/10 rounded-full animate-bounce"></div>
      </section>

      {/* Categories Section - With Background Images */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our diverse collection of products across multiple categories
          </p>
        </div>

        {categoriesLoading ? (
          // Loading skeleton for categories
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 p-8 rounded-3xl h-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {(() => {
              // Get all categories with products (including subcategories)
              const displayCategories: Array<any> = []

              categories.forEach(category => {
                // Calculate total products including children
                const totalProducts = (category.productCount || 0) +
                  (category.children?.reduce((sum, child) => sum + (child.productCount || 0), 0) || 0)

                // Add parent category if it has products (direct or in children)
                if (totalProducts > 0) {
                  displayCategories.push({
                    ...category,
                    displayCount: totalProducts
                  })
                }

                // Add subcategories that have direct products
                if (category.children) {
                  category.children.forEach(child => {
                    if (child.productCount && child.productCount > 0) {
                      displayCategories.push({
                        ...child,
                        displayCount: child.productCount
                      })
                    }
                  })
                }
              })

              // Remove duplicates and take first 6
              const uniqueCategories = displayCategories
                .filter((cat, index, arr) =>
                  arr.findIndex(c => c.id === cat.id) === index
                )
                .slice(0, 6)

              return uniqueCategories.map((category) => {
                const categoryInfo = categoryIcons[category.name] || getDefaultCategoryInfo()

                return (
                  <Link
                    key={category.id}
                    href={{
                      pathname: '/products',
                      query: {
                        category: category.name,
                        categoryId: category.id,
                        filter: 'true'
                      }
                    }}
                    className="group cursor-pointer"
                  >
                    <div className="relative h-40 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 overflow-hidden">
                      {/* Background Image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${categoryInfo.bgImage})` }}
                      ></div>
                      
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.overlay} transition-opacity duration-300 group-hover:opacity-90`}></div>
                      
                      {/* Content */}
                      <div className="relative z-10 p-6 h-full flex flex-col justify-center items-center text-center">
                        {/* Icon */}
                        <span className="text-4xl mb-3 block transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                          {categoryInfo.icon}
                        </span>

                        {/* Category Info */}
                        <h3 className="font-bold text-white text-sm mb-1 group-hover:text-yellow-200 transition-colors duration-300 drop-shadow-md">
                          {category.name}
                        </h3>
                        <p className="text-white/90 text-xs font-medium drop-shadow-sm">
                          {category.displayCount} items
                        </p>
                      </div>

                      {/* Shine Effect on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                    </div>
                  </Link>
                )
              })
            })()}
          </div>
        )}
      </section>

      {/* Featured Products Section - Real Data */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600">
              Top-rated products from our database
            </p>
          </div>
          <Link
            href="/products"
            className="mt-6 lg:mt-0 bg-gradient-to-r from-pink-500 to-red-400 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
          >
            View All Products →
          </Link>
        </div>

        {productsLoading ? (
          // Loading skeleton for products
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* No products message */}
        {!productsLoading && featuredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              No Products Available Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Our sellers are working hard to add amazing products. Check back soon!
            </p>
            <Link
              href="/products"
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all inline-block"
            >
              Browse Products
            </Link>
          </div>
        )}
      </section>

      {/* Stats Section - Real Data */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-pink-600 mb-2">
                {productsLoading ? '...' : '8'}+
              </div>
              <div className="text-gray-600 font-semibold">Products Available</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {categoriesLoading ? '...' : categories.length}+
              </div>
              <div className="text-gray-600 font-semibold">Categories</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">2+</div>
              <div className="text-gray-600 font-semibold">Verified Sellers</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600 font-semibold">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Banner */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-400 text-white py-20 mx-6 rounded-3xl mb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-500/20"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-6">
            New Products Added Daily!
          </h2>
          <p className="text-2xl mb-8 text-purple-100">
            Discover fresh arrivals from our verified sellers
          </p>
          <Link
            href="/products?sortBy=created_at&sortOrder=desc"
            className="bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-xl hover:bg-purple-50 transition-all duration-300 shadow-2xl hover:scale-110 transform inline-block"
          >
            View New Arrivals
          </Link>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Start Selling?
          </h2>
          <p className="text-2xl mb-10 text-pink-100 max-w-3xl mx-auto">
            Join our verified sellers and start your journey in our growing marketplace
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-white text-pink-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-50 transition-all duration-300 shadow-2xl hover:shadow-pink-200/50 hover:scale-105 transform">
              Become a Seller
            </button>
            <button className="border-2 border-white text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-pink-600 transition-all duration-300 hover:scale-105 transform">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}