// utils/queryParams.ts

/**
 * Safe function to get search parameter value
 * Works with both URLSearchParams and Next.js useSearchParams
 */
export function safeGetSearchParam(searchParams: any, key: string): string | null {
  try {
    if (!searchParams) return null
    
    // للتحقق من وجود دالة get
    if (typeof searchParams.get === 'function') {
      return searchParams.get(key)
    }
    
    // fallback للكائنات العادية
    if (typeof searchParams === 'object' && searchParams[key]) {
      return searchParams[key]
    }
    
    return null
  } catch (error) {
    console.warn(`Error getting search param "${key}":`, error)
    return null
  }
}

/**
 * Safe function to get all search parameters as object
 */
export function safeGetAllSearchParams(searchParams: any): Record<string, string> {
  try {
    const params: Record<string, string> = {}
    
    if (!searchParams) return params
    
    // إذا كان لديه دالة entries
    if (typeof searchParams.entries === 'function') {
      for (const [key, value] of searchParams.entries()) {
        params[key] = value
      }
    }
    // إذا كان كائن عادي
    else if (typeof searchParams === 'object') {
      Object.keys(searchParams).forEach(key => {
        params[key] = String(searchParams[key])
      })
    }
    
    return params
  } catch (error) {
    console.warn('Error getting all search params:', error)
    return {}
  }
}

/**
 * Build URL with search parameters
 */
export function buildUrlWithParams(
  basePath: string, 
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `${basePath}?${queryString}` : basePath
}

/**
 * Normalize search query
 */
export function normalizeSearchQuery(query: string | null | undefined): string {
  if (!query) return ''
  return query.trim().toLowerCase()
}

/**
 * Validate and parse page number
 */
export function parsePageNumber(pageParam: string | null): number {
  if (!pageParam) return 1
  const page = parseInt(pageParam, 10)
  return isNaN(page) || page < 1 ? 1 : page
}

/**
 * Validate and parse numeric filter values
 */
export function parseNumericFilter(
  value: string | null, 
  defaultValue: number,
  min?: number,
  max?: number
): number {
  if (!value) return defaultValue
  
  const parsed = parseFloat(value)
  if (isNaN(parsed)) return defaultValue
  
  if (min !== undefined && parsed < min) return min
  if (max !== undefined && parsed > max) return max
  
  return parsed
}

/**
 * Debug function to log search parameters
 */
export function debugSearchParams(searchParams: any, context: string = 'Search Params') {
  console.group(`🔍 ${context}`)
  console.log('All params:', safeGetAllSearchParams(searchParams))
  console.log('Search term:', safeGetSearchParam(searchParams, 'search') || safeGetSearchParam(searchParams, 'q'))
  console.log('Category:', safeGetSearchParam(searchParams, 'category'))
  console.log('Page:', safeGetSearchParam(searchParams, 'page'))
  console.groupEnd()
}

/**
 * Check if search parameters indicate a search action
 */
export function hasSearchParams(searchParams: any): boolean {
  const searchTerm = safeGetSearchParam(searchParams, 'search') || safeGetSearchParam(searchParams, 'q')
  const category = safeGetSearchParam(searchParams, 'category')
  
  return !!(searchTerm || category)
}

/**
 * Extract filters from search parameters
 */
export function extractFiltersFromSearchParams(searchParams: any) {
  return {
    search: safeGetSearchParam(searchParams, 'search') || safeGetSearchParam(searchParams, 'q') || '',
    category: safeGetSearchParam(searchParams, 'category') || '',
    page: parsePageNumber(safeGetSearchParam(searchParams, 'page')),
    minPrice: parseNumericFilter(safeGetSearchParam(searchParams, 'minPrice'), 0, 0),
    maxPrice: parseNumericFilter(safeGetSearchParam(searchParams, 'maxPrice'), 2000, 0),
    rating: parseNumericFilter(safeGetSearchParam(searchParams, 'rating'), 0, 0, 5),
    sortBy: safeGetSearchParam(searchParams, 'sortBy') || 'created_at',
    sortOrder: (safeGetSearchParam(searchParams, 'sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
  }
}

// نوع بديل للاستخدام مع Next.js
export type SearchParamsType = {
  get: (key: string) => string | null
  entries: () => IterableIterator<[string, string]>
} | Record<string, string> | any