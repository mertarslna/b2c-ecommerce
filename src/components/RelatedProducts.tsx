import ProductCard from './ProductCard'
import { Product } from '@/data/mockProducts'

interface RelatedProductsProps {
  currentProduct: Product
  allProducts: Product[]
}

export default function RelatedProducts({ currentProduct, allProducts }: RelatedProductsProps) {
  // Get related products (same category, different product)
  const relatedProducts = allProducts
    .filter(product => 
      product.category === currentProduct.category && 
      product.id !== currentProduct.id
    )
    .slice(0, 8) // Show max 8 related products

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
          You Might Also Like
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover more amazing products in the same category
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
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