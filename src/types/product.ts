// types/product.ts
export interface Product {
  id: string // ✅ UUID from database
  name: string
  price: number
  originalPrice?: number
  image: string
  category: {
    id: string
    name: string
    description?: string
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
    path: string
    isMain: boolean
    size?: number
    format?: string
  }[]
  seller: {
    id: string
    name: string
    businessName: string
    email?: string
    isVerified: boolean
  }
  reviewStats?: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  detailedReviews?: {
    id: string
    rating: number
    title?: string
    comment?: string
    pros: string[]
    cons: string[]
    isVerified: boolean
    helpfulCount: number
    reviewDate: string
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
  brand?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  search?: string
  sortBy?: 'created_at' | 'price' | 'rating' | 'name'
  sortOrder?: 'asc' | 'desc'
}

// Additional types for Cart and Wishlist contexts
export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedSize?: string
  selectedColor?: string
  addedAt: string
}

export interface WishlistItem {
  id: string
  product: Product
  addedAt: string
}

// User types for authentication context
export interface User {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  phone?: string
  role: 'ADMIN' | 'CUSTOMER' | 'SELLER'
  avatar?: string
  isActive: boolean
  createdAt: string
}

export interface Address {
  id: string
  title: string
  firstName: string
  lastName: string
  companyName?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

// Order types
export interface Order {
  id: string
  totalAmount: number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  orderDate: string
  shippingAddress: Address
  billingAddress: Address
  items: OrderItem[]
  payments: Payment[]
}

export interface OrderItem {
  id: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
  deliveredAt?: string
}

export interface Payment {
  id: string
  amount: number
  method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'STRIPE' | 'PAYTHOR'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  transactionId?: string
  paymentDate: string
}