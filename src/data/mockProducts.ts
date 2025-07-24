export interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  reviews: number
}

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max - Natural Titanium",
    price: 1299,
    originalPrice: 1499,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop",
    category: "Electronics",
    rating: 5,
    reviews: 1284
  },
  {
    id: 2,
    name: "Nike Air Max 270 React Sneakers",
    price: 159,
    originalPrice: 199,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
    category: "Fashion",
    rating: 4,
    reviews: 892
  },
  {
    id: 3,
    name: "Apple Watch Series 9 GPS",
    price: 399,
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=300&fit=crop",
    category: "Electronics",
    rating: 5,
    reviews: 2567
  },
  {
    id: 4,
    name: "Premium Cotton Casual Shirt",
    price: 49,
    originalPrice: 79,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
    category: "Fashion",
    rating: 4,
    reviews: 456
  },
  {
    id: 5,
    name: "Luxury Leather Handbag",
    price: 299,
    originalPrice: 399,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
    category: "Fashion",
    rating: 5,
    reviews: 1678
  },
  {
    id: 6,
    name: "Sony WH-1000XM5 Wireless Headphones",
    price: 349,
    originalPrice: 399,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    category: "Electronics",
    rating: 5,
    reviews: 2034
  },
  {
    id: 7,
    name: "Elegant Evening Dress",
    price: 129,
    originalPrice: 189,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop",
    category: "Fashion",
    rating: 4,
    reviews: 763
  },
  {
    id: 8,
    name: "MacBook Pro M3 14-inch",
    price: 1999,
    originalPrice: 2199,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    category: "Electronics",
    rating: 5,
    reviews: 1456
  },
  {
    id: 9,
    name: "Vintage Leather Jacket",
    price: 249,
    originalPrice: 329,
    image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400&h=300&fit=crop",
    category: "Fashion",
    rating: 5,
    reviews: 891
  },
  {
    id: 10,
    name: "Wireless Gaming Mouse",
    price: 89,
    originalPrice: 119,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
    category: "Electronics",
    rating: 4,
    reviews: 634
  }
]

export const categories = [
  { id: 1, name: "Electronics", icon: "📱", count: 12540, color: "from-blue-400 to-blue-600" },
  { id: 2, name: "Fashion", icon: "👗", count: 8934, color: "from-pink-400 to-pink-600" },
  { id: 3, name: "Home & Garden", icon: "🏠", count: 6547, color: "from-green-400 to-green-600" },
  { id: 4, name: "Sports", icon: "⚽", count: 4321, color: "from-orange-400 to-orange-600" },
  { id: 5, name: "Beauty", icon: "💄", count: 2345, color: "from-purple-400 to-purple-600" },
  { id: 6, name: "Books", icon: "📚", count: 5678, color: "from-indigo-400 to-indigo-600" },
  { id: 7, name: "Toys & Games", icon: "🎮", count: 3456, color: "from-yellow-400 to-yellow-600" },
  { id: 8, name: "Automotive", icon: "🚗", count: 2876, color: "from-red-400 to-red-600" }
]