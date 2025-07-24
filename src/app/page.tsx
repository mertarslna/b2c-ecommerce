'use client'

import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import { mockProducts, categories } from '@/data/mockProducts'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-r from-pink-500 via-red-400 to-purple-500 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20"></div>
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)'}}></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Discover Amazing Products
            <span className="block text-4xl font-light mt-2 text-pink-200">at Incredible Prices</span>
          </h1>
          <p className="text-2xl mb-10 text-pink-100 max-w-3xl mx-auto leading-relaxed">
            Thousands of products from trusted sellers, all in one beautiful marketplace
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-pink-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-50 transition-all duration-300 shadow-2xl hover:shadow-pink-200/50 hover:scale-105 transform">
              Start Shopping Now
            </button>
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

      {/* Categories Section - Enhanced */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our diverse collection of products across multiple categories
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="group cursor-pointer">
              <div className={`relative bg-gradient-to-br ${category.color} p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105`}>
                {/* Icon */}
                <div className="text-center mb-4">
                  <span className="text-4xl mb-3 block transform group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </span>
                </div>
                
                {/* Category Info */}
                <div className="text-center">
                  <h3 className="font-bold text-white text-lg mb-2 group-hover:text-yellow-100 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-sm font-medium">
                    {category.count.toLocaleString()} items
                  </p>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Section - Enhanced */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600">
              Hand-picked products just for you
            </p>
          </div>
          <button className="mt-6 lg:mt-0 bg-gradient-to-r from-pink-500 to-red-400 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            View All Products →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Special Offers Banner */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-400 text-white py-20 mx-6 rounded-3xl mb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-500/20"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-bold mb-6">
            Special Weekend Sale!
          </h2>
          <p className="text-2xl mb-8 text-purple-100">
            Up to 70% off on selected items
          </p>
          <div className="flex justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold">48</div>
              <div className="text-sm text-purple-200">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">23</div>
              <div className="text-sm text-purple-200">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">59</div>
              <div className="text-sm text-purple-200">Seconds</div>
            </div>
          </div>
          <button className="bg-white text-purple-600 px-10 py-4 rounded-full font-bold text-xl hover:bg-purple-50 transition-all duration-300 shadow-2xl hover:scale-110 transform">
            Shop Sale Now
          </button>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Start Selling?
          </h2>
          <p className="text-2xl mb-10 text-pink-100 max-w-3xl mx-auto">
            Join thousands of successful sellers and start your journey today
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
    </div>
  )
}