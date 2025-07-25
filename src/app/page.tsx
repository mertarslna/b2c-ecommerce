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

  // Random gradient color list
  const randomGradientColors = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-red-400 to-red-600',
    'from-yellow-400 to-yellow-600',
    'from-indigo-400 to-indigo-600',
    'from-pink-400 to-pink-600',
    'from-teal-400 to-teal-600',
    'from-orange-400 to-orange-600',
    'from-cyan-400 to-cyan-600',
  ];
  
  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * randomGradientColors.length);
    return randomGradientColors[randomIndex];
  };

  // Create static category icons mapping
  const categoryIcons: { [key: string]: { icon: string; color: string } } = {
    'Electronics': { icon: '💻', color: 'from-blue-500 to-blue-700' },
    'Smartphones': { icon: '📱', color: 'from-green-500 to-green-700' },
    'Laptops': { icon: '💻', color: 'from-purple-500 to-purple-700' },
    'Tablets': { icon: '📱', color: 'from-red-500 to-red-700' },
    'Televisions & Audio': { icon: '📺', color: 'from-yellow-500 to-yellow-700' },
    'Home & Living': { icon: '🏠', color: 'from-indigo-500 to-indigo-700' },
    'Furniture': { icon: '🛋️', color: 'from-pink-500 to-pink-700' },
    'Kitchenware': { icon: '🍳', color: 'from-teal-500 to-teal-700' },
    'Apparel & Fashion': { icon: '👕', color: 'from-orange-500 to-orange-700' },
    'Women\'s Apparel': { icon: '👗', color: 'from-cyan-500 to-cyan-700' }, // Escape karakteri kullanıldı
    'Men\'s Apparel': { icon: '👔', color: 'from-lime-500 to-lime-700' },     // Escape karakteri kullanıldı
    'Kids\' & Baby Apparel': { icon: '👶', color: 'from-rose-500 to-rose-700' }, // Escape karakteri kullanıldı
    'Health & Beauty': { icon: '💖', color: 'from-fuchsia-500 to-fuchsia-700' },
    'Skincare': { icon: '🧴', color: 'from-emerald-500 to-emerald-700' },
    'Makeup': { icon: '💄', color: 'from-violet-500 to-violet-700' },
    'Sports & Outdoors': { icon: '🏅', color: 'from-amber-500 to-amber-700' },
    'Fitness Equipment': { icon: '🏋️', color: 'from-lightBlue-500 to-lightBlue-700' },
    'Outdoor Gear': { icon: '🏕️', color: 'from-warmGray-500 to-warmGray-700' },
    // Other categories can be added here
  }
  

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

      {/* Categories Section - Real Data */}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                const categoryInfo = categoryIcons[category.name] || {
                  icon: '📦',
                  color: getRandomColor()
                }

                return (
                  <Link
                    key={category.id}
                    href={{
                      pathname: '/products',
                      query: {
                        category: category.name,
                        categoryId: category.id,
                        filter: 'true' // Add this flag to indicate filtering is needed
                      }
                    }}
                    className="group cursor-pointer"
                  >
                    <div className={`relative bg-gradient-to-br ${categoryInfo.color} p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105`}>
                      {/* Icon */}
                      <div className="text-center mb-3">
                        <span className="text-3xl mb-2 block transform group-hover:scale-110 transition-transform duration-300">
                          {categoryInfo.icon}
                        </span>
                      </div>

                      {/* Category Info */}
                      <div className="text-center">
                        <h3 className="font-bold text-white text-sm mb-1 group-hover:text-yellow-100 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-white/80 text-xs font-medium">
                          {category.displayCount} items
                        </p>
                      </div>

                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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