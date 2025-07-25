// utils/queryParams.ts

/**
 * Safely builds URLSearchParams from an object
 * Filters out undefined, null, empty strings, and converts all values to strings
 */
export function buildQueryParams(params: Record<string, any>): URLSearchParams {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    // Only add valid values
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      // Convert numbers and booleans to strings
      const stringValue = String(value).trim()
      if (stringValue) {
        queryParams.append(key, stringValue)
      }
    }
  })
  
  return queryParams
}

/**
 * Builds query string for product filters
 */
export function buildProductQueryString(filters: Record<string, any>): string {
  const queryParams = buildQueryParams(filters)
  return queryParams.toString()
}

/**
 * Parse query string back to object with proper types
 */
export function parseProductQuery(searchParams: URLSearchParams): Record<string, any> {
  const params: Record<string, any> = {}
  
  searchParams.forEach((value, key) => {
    // Convert numeric strings back to numbers
    if (['page', 'limit', 'minPrice', 'maxPrice', 'rating'].includes(key)) {
      const numValue = Number(value)
      if (!isNaN(numValue)) {
        params[key] = numValue
      }
    } else {
      params[key] = value
    }
  })
  
  return params
}

/**
 * Helper to safely get URL search params for Next.js
 */
export function safeGetSearchParam(searchParams: URLSearchParams, key: string, defaultValue?: string): string | undefined {
  try {
    return searchParams.get(key) || defaultValue
  } catch (error) {
    console.warn(`Error getting search param "${key}":`, error)
    return defaultValue
  }
}