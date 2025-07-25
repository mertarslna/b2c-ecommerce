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
      // Build query string from the filters passed to hook
      const queryParams = new URLSearchParams()
      
      console.log('🔍 useProducts - Building query with filters:', filters)
      
      if (filters.page) queryParams.append('page', filters.page.toString())
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      if (filters.category && filters.category !== 'all' && filters.category !== '') {
        queryParams.append('category', filters.category)
      }
      if (filters.minPrice && filters.minPrice > 0) {
        queryParams.append('minPrice', filters.minPrice.toString())
      }
      if (filters.maxPrice && filters.maxPrice < 10000) {
        queryParams.append('maxPrice', filters.maxPrice.toString())
      }
      if (filters.rating && filters.rating > 0) {
        queryParams.append('rating', filters.rating.toString())
      }
      // تم إصلاح معالجة البحث
      if (filters.search && filters.search.trim()) {
        queryParams.append('search', filters.search.trim())
        console.log('🔍 Search parameter added:', filters.search.trim())
      }
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy)
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder)

      const queryString = queryParams.toString()
      const apiUrl = `/api/products?${queryString}`
      
      console.log('📡 useProducts - Calling API:', apiUrl)

      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<ProductsResponse> = await response.json()

      console.log('📊 useProducts - API Response:', result)

      if (result.success && result.data) {
        setProducts(result.data.products)
        setPagination(result.data.pagination)
        console.log('✅ useProducts - Products set:', result.data.products.length, 'products')
        
        // إضافة تحقق إضافي للبحث
        if (filters.search && result.data.products.length === 0) {
          console.log('⚠️ No products found for search term:', filters.search)
        }
      } else {
        setError(result.error || 'Failed to fetch products')
        setProducts([])
        setPagination(null)
        console.error('❌ useProducts - API Error:', result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorMessage)
      setProducts([])
      setPagination(null)
      console.error('❌ useProducts - Network Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ الأهم: useEffect يجب أن يعتمد على filters object كاملاً
  useEffect(() => {
    console.log('🔄 useProducts - useEffect triggered with filters:', filters)
    fetchProducts()
  }, [
    filters.page,
    filters.limit,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.rating,
    filters.search, // تأكد من إدراج البحث
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<DetailedProduct> = await response.json()

      if (result.success && result.data) {
        setProduct(result.data)
      } else {
        setError(result.error || 'Failed to fetch product')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorMessage)
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<Category[]> = await response.json()

      if (result.success && result.data) {
        setCategories(result.data)
      } else {
        setError(result.error || 'Failed to fetch categories')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorMessage)
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
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorMessage)
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

// Hook for product search - تم إصلاح التنفيذ
export const useProductSearch = () => {
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProducts = async (query: string, filters: Partial<ProductFilters> = {}) => {
    if (!query.trim()) {
      setSearchResults([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      queryParams.append('search', query.trim())
      queryParams.append('page', '1')
      queryParams.append('limit', '20')
      
      // إضافة الفلاتر الإضافية
      if (filters.category) queryParams.append('category', filters.category)
      if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString())
      if (filters.rating !== undefined) queryParams.append('rating', filters.rating.toString())
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy)
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/products?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<ProductsResponse> = await response.json()

      if (result.success && result.data) {
        setSearchResults(result.data.products)
        console.log('🔍 Search results:', result.data.products.length, 'products found')
      } else {
        setError(result.error || 'Search failed')
        setSearchResults([])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search error occurred'
      setError(errorMessage)
      setSearchResults([])
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchResults([])
    setError(null)
    setLoading(false)
  }

  return {
    searchResults,
    loading,
    error,
    searchProducts,
    clearSearch
  }
}