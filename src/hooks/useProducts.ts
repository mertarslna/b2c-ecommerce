// hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react'
import { Product, DetailedProduct, Category, ApiResponse, ProductsResponse, ProductFilters } from '@/types/product'

// Helper function to build query parameters safely
function buildQueryParams(filters: Record<string, any>): URLSearchParams {
  const queryParams = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    // Only add valid values
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      const stringValue = String(value).trim()
      if (stringValue) {
        queryParams.append(key, stringValue)
      }
    }
  })
  
  return queryParams
}

// Hook for fetching products with filters
export const useProducts = (initialFilters: ProductFilters = {}) => {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProductFilters>(initialFilters)

  const fetchProducts = useCallback(async (newFilters?: ProductFilters) => {
    const currentFilters = newFilters || filters
    setLoading(true)
    setError(null)
    
    try {
      // Build query string safely using helper
      const queryParams = buildQueryParams(currentFilters)
      const queryString = queryParams.toString()
      
      console.log('🔍 Fetching products with:', currentFilters)
      console.log('📡 API URL:', `/api/products?${queryString}`)
      
      const response = await fetch(`/api/products?${queryString}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<ProductsResponse> = await response.json()

      console.log('📊 API Response:', result)

      if (result.success && result.data) {
        setProducts(result.data.products)
        setPagination(result.data.pagination)
      } else {
        setError(result.error || 'Failed to fetch products')
        setProducts([])
        setPagination(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorMessage)
      setProducts([])
      setPagination(null)
      console.error('Fetch products error:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Update filters and refetch
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    fetchProducts(updatedFilters)
  }, [filters, fetchProducts])

  // Reset filters
  const resetFilters = useCallback(() => {
    const defaultFilters: ProductFilters = {
      page: 1,
      limit: 12,
      sortBy: 'created_at',
      sortOrder: 'desc'
    }
    setFilters(defaultFilters)
    fetchProducts(defaultFilters)
  }, [fetchProducts])

  useEffect(() => {
    fetchProducts()
  }, []) // Only run on mount

  return {
    products,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: () => fetchProducts(filters)
  }
}

// Hook for fetching a single product
export const useProduct = (productId: string | null) => {
  const [product, setProduct] = useState<DetailedProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${productId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<DetailedProduct> = await response.json()

      if (result.success && result.data) {
        setProduct(result.data)
      } else {
        setError(result.error || 'Failed to fetch product')
        setProduct(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorMessage)
      setProduct(null)
      console.error('Fetch product error:', err)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

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

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (includeCount) queryParams.append('includeCount', 'true')
      if (parentOnly) queryParams.append('parentOnly', 'true')

      const response = await fetch(`/api/categories?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<Category[]> = await response.json()

      if (result.success && result.data) {
        setCategories(result.data)
      } else {
        setError(result.error || 'Failed to fetch categories')
        setCategories([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorMessage)
      setCategories([])
      console.error('Fetch categories error:', err)
    } finally {
      setLoading(false)
    }
  }, [includeCount, parentOnly])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

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

  const fetchRelatedProducts = useCallback(async () => {
    if (!currentProductId || !category) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Build query parameters safely using helper
      const relatedFilters = {
        category: category,
        limit: limit + 2, // Get extra to filter out current product
        page: 1
      }
      
      const queryParams = buildQueryParams(relatedFilters)
      const queryString = queryParams.toString()
      const response = await fetch(`/api/products?${queryString}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<ProductsResponse> = await response.json()

      if (result.success && result.data) {
        // Filter out the current product and limit results
        const filtered = result.data.products
          .filter(product => product.id !== currentProductId)
          .slice(0, limit)
        
        setRelatedProducts(filtered)
      } else {
        setError(result.error || 'Failed to fetch related products')
        setRelatedProducts([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorMessage)
      setRelatedProducts([])
      console.error('Fetch related products error:', err)
    } finally {
      setLoading(false)
    }
  }, [currentProductId, category, limit])

  useEffect(() => {
    fetchRelatedProducts()
  }, [fetchRelatedProducts])

  return {
    relatedProducts,
    loading,
    error,
    refetch: fetchRelatedProducts
  }
}

// Hook for product search with suggestions
export const useProductSearch = () => {
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProducts = useCallback(async (query: string, filters: Partial<ProductFilters> = {}) => {
    if (!query.trim()) {
      setSearchResults([])
      setSuggestions([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Build query parameters safely using helper
      const searchFilters = {
        search: query.trim(),
        limit: 10,
        ...filters
      }
      
      const queryParams = buildQueryParams(searchFilters)
      const queryString = queryParams.toString()
      const response = await fetch(`/api/products?${queryString}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<ProductsResponse> = await response.json()

      if (result.success && result.data) {
        setSearchResults(result.data.products)
        // Generate suggestions from product names
        const productSuggestions = result.data.products
          .map(p => p.name)
          .slice(0, 5)
        setSuggestions(productSuggestions)
      } else {
        setError(result.error || 'Failed to search products')
        setSearchResults([])
        setSuggestions([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorMessage)
      setSearchResults([])
      setSuggestions([])
      console.error('Search products error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchResults([])
    setSuggestions([])
    setError(null)
  }, [])

  return {
    searchResults,
    suggestions,
    loading,
    error,
    searchProducts,
    clearSearch
  }
}