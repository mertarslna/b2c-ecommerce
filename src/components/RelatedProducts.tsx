// components/RelatedProducts.tsx - Safe Version
import ProductCard from './ProductCard'
import { Product } from '@/data/mockProducts'

interface RelatedProductsProps {
  currentProduct?: Product
  allProducts?: Product[]
  products?: Product[]  // Alternative prop name
  loading?: boolean
  title?: string
}

export default function RelatedProducts({ 
  currentProduct, 
  allProducts, 
  products,
  loading = false,
  title = "You Might Also Like"
}: RelatedProductsProps) {
  
  // Safe defaults to prevent undefined errors
  const safeProducts = allProducts || products || []
  
  // Early return if no current product or if loading
  if (loading) {
    return (
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {title}
          </h2>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, index) => (
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
      </section>
    )
  }

  if (!currentProduct) {
    console.warn('RelatedProducts: currentProduct is undefined')
    return null
  }

  if (!Array.isArray(safeProducts) || safeProducts.length === 0) {
    console.warn('RelatedProducts: no products available')
    return null
  }

  // Get related products (same category, different product)
  let relatedProducts = []
  
  try {
    relatedProducts = safeProducts
      .filter(product => 
        product && 
        product.category === currentProduct.category && 
        product.id !== currentProduct.id
      )
      .slice(0, 8) // Show max 8 related products
  } catch (error) {
    console.error('Error filtering related products:', error)
    return null
  }

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
          {title}
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover more amazing products in the same category
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={{
            ...product,
            id: product.id.toString(), // Convert number to string
            category: typeof product.category === 'string'
              ? { id: product.category, name: product.category, description: '' }
              : product.category
          }}  />
        ))}
      </div>

      {/* View More Button */}
      <div className="text-center mt-12">
        <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
          View More {currentProduct.category} Products →
        </button>
      </div>
    </section>
  )
}