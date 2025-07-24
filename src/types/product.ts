// types/product.ts
export interface Product {
  id: string // ✅ Changed from number to string (UUID)
  name: string
  price: number
  originalPrice?: number
  image: string
  category: {
    id: string
    name: string
    description: string
  }
  rating: number
  reviews: number
  description?: string
  stock?: number
  seller?: {
    name: string
    businessName: string
  }
}

export interface DetailedProduct extends Product {
  description: string
  stock: number
  category: {
    id: string
    name: string
    description: string
  }
  images: {
    id: string
    url: string
    isMain: boolean
  }[]
  seller: {
    id: string
    name: string
    businessName: string
    email: string
    isVerified: boolean
  }
  reviewStats: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  detailedReviews: {
    id: string
    rating: number
    title: string
    comment: string
    pros: string[]
    cons: string[]
    isVerified: boolean
    helpfulCount: number
    date: string
    customer: {
      name: string
    }
  }[]
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  parent?: {
    id: string
    name: string
  }
  children: {
    id: string
    name: string
    description?: string
    productCount?: number
  }[]
  productCount?: number
  hasChildren: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ProductsResponse {
  products: Product[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface ProductFilters {
  page?: number
  limit?: number
  category?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  search?: string
  sortBy?: 'created_at' | 'price' | 'rating' | 'name'
  sortOrder?: 'asc' | 'desc'
}