// app/test-api/page.tsx - للتست فقط
'use client'

import { useState } from 'react'

export default function ApiTestPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('iPhone')

  const testApi = async (endpoint: string) => {
    setLoading(true)
    setResults(null)
    
    try {
      console.log(`🧪 Testing: ${endpoint}`)
      
      const response = await fetch(endpoint)
      const data = await response.json()
      
      console.log(`📊 Response:`, {
        status: response.status,
        ok: response.ok,
        data
      })
      
      setResults({
        endpoint,
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      console.error('❌ API Error:', error)
      setResults({
        endpoint,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const tests = [
    {
      name: 'All Products',
      endpoint: '/api/products'
    },
    {
      name: 'Search Products',
      endpoint: `/api/products?search=${encodeURIComponent(searchTerm)}`
    },
    {
      name: 'Categories',
      endpoint: '/api/categories'
    },
    {
      name: 'Electronics Category',
      endpoint: '/api/products?category=Electronics'
    },
    {
      name: 'Price Range',
      endpoint: '/api/products?minPrice=100&maxPrice=500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 API Test Page</h1>
        
        {/* Search Term Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Term:
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-3 py-2 w-64"
            placeholder="Enter search term..."
          />
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {tests.map((test, index) => (
            <button
              key={index}
              onClick={() => testApi(test.endpoint)}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium"
            >
              {loading ? '⏳' : '🧪'} {test.name}
            </button>
          ))}
        </div>

        {/* Results Display */}
        {results && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📊 Test Results</h2>
            
            <div className="mb-4">
              <strong>Endpoint:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{results.endpoint}</code>
            </div>
            
            {results.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-bold">❌ Error</h3>
                <p className="text-red-600">{results.error}</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    results.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Status: {results.status} {results.ok ? '✅' : '❌'}
                  </span>
                </div>

                <div className="mb-4">
                  <strong>Success:</strong> {results.data?.success ? '✅ Yes' : '❌ No'}
                </div>

                {results.data?.data?.products && (
                  <div className="mb-4">
                    <strong>Products Found:</strong> {results.data.data.products.length}
                  </div>
                )}

                {results.data?.data?.pagination && (
                  <div className="mb-4">
                    <strong>Total Count:</strong> {results.data.data.pagination.totalCount}
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
                    📋 View Full Response
                  </summary>
                  <pre className="bg-gray-100 p-4 rounded-lg mt-2 overflow-auto text-sm">
                    {JSON.stringify(results.data, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        )}

        {/* Quick Database Check */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">🔍 Database Check</h3>
          <p className="text-yellow-700 mb-3">
            If search isn't working, check these common issues:
          </p>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• Database is running and accessible</li>
            <li>• Products table has data (run: <code>npx prisma db seed</code>)</li>
            <li>• API routes are working correctly</li>
            <li>• Search parameters are being passed correctly</li>
          </ul>
          
          <button
            onClick={() => testApi('/api/products?limit=1')}
            className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            🔍 Quick Database Test
          </button>
        </div>

        {/* Troubleshooting Guide */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-2">🛠️ Troubleshooting Steps</h3>
          <ol className="text-blue-700 space-y-2 text-sm">
            <li>1. <strong>Test "All Products"</strong> - Should return products from database</li>
            <li>2. <strong>Test "Search Products"</strong> - Should filter products by search term</li>
            <li>3. <strong>Check Console</strong> - Look for error messages in browser console</li>
            <li>4. <strong>Check Server Logs</strong> - Look for API errors in terminal</li>
            <li>5. <strong>Verify Database</strong> - Ensure products exist and are approved</li>
          </ol>
        </div>
      </div>
    </div>
  )
}