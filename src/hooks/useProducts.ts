// hooks/useProducts.ts
import { useState, useEffect } from 'react'
import { Product, DetailedProduct, Category, ApiResponse, ProductsResponse, ProductFilters } from '@/types/product'

// Hook for fetching products with filters
export const useProducts = (filters: ProductFilters = {}) => {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Build query string
      const queryParams = new URLSearchParams()
      
      if (filters.page) queryParams.append('page', filters.page.toString())
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category)
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString())
      if (filters.rating) queryParams.append('rating', filters.rating.toString())
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy)
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/products?${queryParams.toString()}`)
      const result: ApiResponse<ProductsResponse> = await response.json()

      if (result.success && result.data) {
        setProducts(result.data.products)
        setPagination(result.data.pagination)
      } else {
        setError(result.error || 'Failed to fetch products')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Fetch products error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [
    filters.page,
    filters.limit,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.rating,
    filters.search,
    filters.sortBy,
    filters.sortOrder
  ])

  return {
    products,
    pagination,
    loading,
    error,
    refetch: fetchProducts
  }
}

// Hook for fetching a single product
export const useProduct = (productId: string | null) => {
  const [product, setProduct] = useState<DetailedProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = async () => {
    if (!productId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${productId}`)
      const result: ApiResponse<DetailedProduct> = await response.json()

      if (result.success && result.data) {
        setProduct(result.data)
      } else {
        setError(result.error || 'Failed to fetch product')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Fetch product error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [productId])

  return {
    product,
    loading,
    error,
    refetch: fetchProduct
  }
}

// Hook for fetching categories
export const useCategories = (includeCount = false, parentOnly = false) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (includeCount) queryParams.append('includeCount', 'true')
      if (parentOnly) queryParams.append('parentOnly', 'true')

      const response = await fetch(`/api/categories?${queryParams.toString()}`)
      const result: ApiResponse<Category[]> = await response.json()

      if (result.success && result.data) {
        setCategories(result.data)
      } else {
        setError(result.error || 'Failed to fetch categories')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Fetch categories error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [includeCount, parentOnly])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  }
}

// Hook for related products
export const useRelatedProducts = (currentProductId: string, category: string, limit = 8) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRelatedProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        category: category,
        limit: limit.toString(),
        page: '1'
      })

      const response = await fetch(`/api/products?${queryParams.toString()}`)
      const result: ApiResponse<ProductsResponse> = await response.json()

      if (result.success && result.data) {
        // Filter out the current product and limit results
        const filtered = result.data.products
          .filter(product => product.id !== currentProductId)
          .slice(0, limit)
        
        setRelatedProducts(filtered)
      } else {
        setError(result.error || 'Failed to fetch related products')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Fetch related products error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentProductId && category) {
      fetchRelatedProducts()
    }
  }, [currentProductId, category, limit])

  return {
    relatedProducts,
    loading,
    error,
    refetch: fetchRelatedProducts
  }
}

// Hook for product search
export const useProductSearch = () => {
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProducts = async (query: string, filters: Partial<ProductFilters> = {}) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    setError(null)
  }

  const clearSearch = () => {
    setSearchResults([])
    setError(null)
  }

  return {
    searchResults,
    loading,
    error,
    searchProducts,
    clearSearch
  }
}