// src/app/product-details/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import Link from 'next/link'

// Mock product data - في التطبيق الحقيقي راح تجي من API
const mockProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    originalPrice: 399.99,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"
    ],
    category: "Electronics",
    rating: 4.8,
    reviews: 1284,
    description: "Experience premium sound quality with these wireless headphones featuring advanced noise cancellation, 30-hour battery life, and premium comfort padding.",
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Premium comfort padding",
      "Wireless connectivity",
      "High-quality audio drivers",
      "Built-in microphone"
    ],
    specifications: {
      "Battery Life": "30 hours",
      "Connectivity": "Bluetooth 5.0",
      "Weight": "250g",
      "Drivers": "40mm dynamic drivers",
      "Frequency Response": "20Hz - 20kHz",
      "Impedance": "32 ohms"
    },
    colors: ["Black", "White", "Silver", "Rose Gold"],
    sizes: [],
    inStock: true,
    stockCount: 15,
    brand: "AudioTech",
    warranty: "2 years"
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    price: 199.99,
    originalPrice: 249.99,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop"
    ],
    category: "Wearables",
    rating: 4.6,
    reviews: 892,
    description: "Advanced fitness tracking with heart rate monitoring, GPS, and smart notifications. Perfect for your active lifestyle.",
    features: [
      "Heart Rate Monitoring",
      "Built-in GPS",
      "Water Resistant",
      "Smart Notifications",
      "Sleep Tracking",
      "Multiple Sports Modes"
    ],
    specifications: {
      "Display": "1.4-inch AMOLED",
      "Battery": "7 days",
      "Water Rating": "5ATM",
      "Sensors": "Heart Rate, GPS, Accelerometer",
      "Compatibility": "iOS & Android",
      "Storage": "4GB"
    },
    colors: ["Black", "White", "Blue", "Pink"],
    sizes: ["38mm", "42mm"],
    inStock: true,
    stockCount: 28,
    brand: "FitTech",
    warranty: "1 year"
  },
  {
    id: 3,
    name: "Wireless Gaming Mouse",
    price: 89.99,
    originalPrice: 129.99,
    images: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1563297007-0686b7003af7?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=600&fit=crop"
    ],
    category: "Gaming",
    rating: 4.7,
    reviews: 654,
    description: "High-precision wireless gaming mouse with RGB lighting and customizable buttons for competitive gaming.",
    features: [
      "25,000 DPI Sensor",
      "Wireless Connectivity",
      "RGB Lighting",
      "Programmable Buttons",
      "60-hour Battery",
      "Ergonomic Design"
    ],
    specifications: {
      "DPI": "25,000",
      "Connectivity": "2.4GHz Wireless",
      "Battery": "60 hours",
      "Buttons": "8 programmable",
      "Weight": "85g",
      "Compatibility": "Windows, Mac"
    },
    colors: ["Black", "White", "RGB"],
    sizes: [],
    inStock: true,
    stockCount: 42,
    brand: "GameTech",
    warranty: "2 years"
  },
  {
    id: 4,
    name: "Bluetooth Speaker Pro",
    price: 149.99,
    originalPrice: 199.99,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=600&h=600&fit=crop"
    ],
    category: "Audio",
    rating: 4.5,
    reviews: 423,
    description: "Portable Bluetooth speaker with powerful bass, waterproof design, and 24-hour battery life.",
    features: [
      "360° Surround Sound",
      "Waterproof IPX7",
      "24-hour Battery",
      "Voice Assistant",
      "Party Connect",
      "Premium Audio Drivers"
    ],
    specifications: {
      "Output": "40W",
      "Battery": "24 hours",
      "Water Rating": "IPX7",
      "Connectivity": "Bluetooth 5.0",
      "Range": "30 meters",
      "Weight": "680g"
    },
    colors: ["Black", "Blue", "Red", "White"],
    sizes: [],
    inStock: true,
    stockCount: 18,
    brand: "SoundWave",
    warranty: "1 year"
  },
  {
    id: 5,
    name: "USB-C Fast Charger",
    price: 39.99,
    originalPrice: 59.99,
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1609592806671-298971816799?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&h=600&fit=crop"
    ],
    category: "Accessories",
    rating: 4.3,
    reviews: 789,
    description: "Ultra-fast USB-C charger with multiple ports and intelligent charging technology.",
    features: [
      "65W Fast Charging",
      "Multiple Ports",
      "Smart Charging",
      "Compact Design",
      "Universal Compatibility",
      "Safety Protection"
    ],
    specifications: {
      "Output": "65W",
      "Ports": "2x USB-C, 1x USB-A",
      "Input": "100-240V",
      "Size": "6.5 x 3.2 x 1.2 cm",
      "Weight": "120g",
      "Compatibility": "All USB-C devices"
    },
    colors: ["White", "Black"],
    sizes: [],
    inStock: true,
    stockCount: 67,
    brand: "ChargeFast",
    warranty: "2 years"
  },
  {
    id: 6,
    name: "4K Webcam Pro",
    price: 179.99,
    originalPrice: 229.99,
    images: [
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581092795442-7cbb9a6a3386?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"
    ],
    category: "Electronics",
    rating: 4.8,
    reviews: 1156,
    description: "Professional 4K webcam with auto-focus, noise reduction, and wide-angle lens for streaming and video calls.",
    features: [
      "4K Ultra HD",
      "Auto Focus",
      "Noise Reduction",
      "Wide Angle Lens",
      "Privacy Shutter",
      "Plug & Play"
    ],
    specifications: {
      "Resolution": "4K @ 30fps",
      "Field of View": "90°",
      "Focus": "Auto Focus",
      "Microphone": "Dual Stereo",
      "Connectivity": "USB 3.0",
      "Compatibility": "Windows, Mac, Linux"
    },
    colors: ["Black"],
    sizes: [],
    inStock: true,
    stockCount: 23,
    brand: "StreamTech",
    warranty: "3 years"
  }
]

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  
  const [product, setProduct] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [isLoading, setIsLoading] = useState(true)
  const [isAutoPlay, setIsAutoPlay] = useState(false)

  // Load product data
  useEffect(() => {
    const productId = parseInt(params.id as string)
    const foundProduct = mockProducts.find(p => p.id === productId)
    
    if (foundProduct) {
      setProduct(foundProduct)
      setSelectedColor(foundProduct.colors[0])
      setSelectedSize(foundProduct.sizes[0] || '')
    }
    
    setIsLoading(false)
  }, [params.id])

  // Auto-play images
  useEffect(() => {
    if (!isAutoPlay || !product) return

    const interval = setInterval(() => {
      setSelectedImage(prev => (prev + 1) % product.images.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPlay, product])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!product) return
      
      if (e.key === 'ArrowLeft') {
        setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1)
      } else if (e.key === 'ArrowRight') {
        setSelectedImage(prev => (prev + 1) % product.images.length)
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsAutoPlay(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [product])

  const handleAddToCart = () => {
    if (!product) return
    
    addToCart({
      ...product,
      selectedColor,
      selectedSize
    }, quantity)
  }

  const handleWishlistToggle = () => {
    if (!product) return
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleImageSelect = (index: number) => {
    setSelectedImage(index)
    setIsAutoPlay(false) // Stop auto-play when user manually selects
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-pink-600">Loading Product...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="bg-white rounded-3xl shadow-xl p-16 max-w-lg mx-auto">
            <div className="text-6xl mb-6">😞</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h2>
            <p className="text-xl text-gray-600 mb-8">Sorry, we couldn't find the product you're looking for.</p>
            <Link 
              href="/"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const inWishlist = isInWishlist(product.id)

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
            <li>
              <Link href="/" className="text-gray-500 hover:text-pink-600 transition-colors">Products</Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-pink-600 font-semibold">{product.name}</li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-6 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            
            {/* Product Images */}
            <div className="space-y-6">
              {/* Main Image with Navigation */}
              <div className="relative">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 lg:h-[500px] object-cover rounded-2xl transition-all duration-500"
                />
                
                {/* Image Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage === 0 ? product.images.length - 1 : selectedImage - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                    >
                      <svg className="w-6 h-6 text-gray-700 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => setSelectedImage(selectedImage === product.images.length - 1 ? 0 : selectedImage + 1)}
                      className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                    >
                      <svg className="w-6 h-6 text-gray-700 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  {selectedImage + 1} / {product.images.length}
                </div>
                
                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg animate-pulse">
                    -{discountPercentage}% OFF
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className={`absolute top-4 right-4 p-3 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all duration-300 ${
                    inWishlist 
                      ? 'bg-red-100 hover:bg-red-200' 
                      : 'bg-white/80 hover:bg-white'
                  }`}
                >
                  <svg 
                    className={`w-6 h-6 transition-colors ${
                      inWishlist 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-600 hover:text-red-500'
                    }`} 
                    fill={inWishlist ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                {/* Auto-play Toggle */}
                <button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`absolute bottom-4 right-4 p-2 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 ${
                    isAutoPlay 
                      ? 'bg-pink-100 hover:bg-pink-200 text-pink-600' 
                      : 'bg-white/80 hover:bg-white text-gray-600'
                  }`}
                  title={isAutoPlay ? 'Stop auto-play' : 'Start auto-play'}
                >
                  {isAutoPlay ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 16h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Thumbnail Images with Auto-scroll */}
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(index)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                        selectedImage === index 
                          ? 'border-pink-500 shadow-lg scale-105 ring-2 ring-pink-200' 
                          : 'border-gray-200 hover:border-pink-300 hover:scale-102'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-20 h-20 object-cover transition-transform duration-300"
                      />
                      {selectedImage === index && (
                        <div className="absolute inset-0 bg-pink-500/20 backdrop-blur-[1px]"></div>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Thumbnail Indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {product.images.map((_, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        selectedImage === index 
                          ? 'bg-pink-500 w-6' 
                          : 'bg-gray-300 hover:bg-pink-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category and Brand */}
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600">
                  {product.category}
                </span>
                <span className="text-gray-500">by {product.brand}</span>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${star <= product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-700">{product.rating}</span>
                <span className="text-gray-500">({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-2xl text-gray-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-semibold ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? `In Stock (${product.stockCount} left)` : 'Out of Stock'}
                </span>
              </div>

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Color: {selectedColor}</h3>
                  <div className="flex gap-3">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-xl border-2 font-medium transition-all duration-300 ${
                          selectedColor === color
                            ? 'border-pink-500 bg-pink-50 text-pink-600'
                            : 'border-gray-200 hover:border-pink-300 text-gray-700'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Size: {selectedSize}</h3>
                  <div className="flex gap-3">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-xl border-2 font-medium transition-all duration-300 ${
                          selectedSize === size
                            ? 'border-pink-500 bg-pink-50 text-pink-600'
                            : 'border-gray-200 hover:border-pink-300 text-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Quantity</h3>
                <div className="flex items-center bg-gray-100 rounded-xl w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-pink-100 hover:text-pink-600 rounded-l-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="px-6 py-3 font-semibold text-lg min-w-[80px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-pink-100 hover:text-pink-600 rounded-r-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full bg-gradient-to-r from-pink-500 to-red-400 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.inStock ? `Add ${quantity} to Cart - ${(product.price * quantity).toFixed(2)}` : 'Out of Stock'}
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                    Buy Now
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      inWishlist
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-pink-100 hover:text-pink-600'
                    }`}
                  >
                    {inWishlist ? '💖 In Wishlist' : '🤍 Add to Wishlist'}
                  </button>
                </div>
              </div>

              {/* Warranty Info */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-semibold text-gray-800">{product.warranty} Warranty Included</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              {['description', 'features', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 font-semibold capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                      : 'text-gray-600 hover:text-pink-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'description' && (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                      <svg className="w-6 h-6 text-pink-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-800 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                      <span className="font-semibold text-gray-800">{key}</span>
                      <span className="text-gray-600">{value as string}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Reviews Coming Soon</h3>
                  <p className="text-gray-600">Customer reviews and ratings will be available soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}