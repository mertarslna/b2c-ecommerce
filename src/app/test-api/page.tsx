
'use client'

import { useState, useEffect } from 'react'

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

export default function TestAPIPage() {
  const [productsResult, setProductsResult] = useState<ApiResponse | null>(null)
  const [categoriesResult, setCategoriesResult] = useState<ApiResponse | null>(null)
  const [singleProductResult, setSingleProductResult] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const testProductsAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/products?page=1&limit=5')
      const data = await response.json()
      setProductsResult(data)
      console.log('Products API Result:', data)
    } catch (error) {
      setProductsResult({ success: false, error: String(error) })
    }
    setLoading(false)
  }

  const testCategoriesAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/categories?includeCount=true')
      const data = await response.json()
      setCategoriesResult(data)
      console.log('Categories API Result:', data)
    } catch (error) {
      setCategoriesResult({ success: false, error: String(error) })
    }
    setLoading(false)
  }

  const testSingleProductAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/products/550e8400-e29b-41d4-a716-446655440060')
      const data = await response.json()
      setSingleProductResult(data)
      console.log('Single Product API Result:', data)
    } catch (error) {
      setSingleProductResult({ success: false, error: String(error) })
    }
    setLoading(false)
  }

  const testAllAPIs = async () => {
    await testProductsAPI()
    await testCategoriesAPI()
    await testSingleProductAPI()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 API Testing Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Test your APIs to ensure they're working correctly
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={testAllAPIs}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
          >
            {loading ? '🔄 Testing...' : '🚀 Test All APIs'}
          </button>
          
          <button
            onClick={testProductsAPI}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all disabled:opacity-50"
          >
            📦 Test Products
          </button>
          
          <button
            onClick={testCategoriesAPI}
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all disabled:opacity-50"
          >
            📂 Test Categories
          </button>
          
          <button
            onClick={testSingleProductAPI}
            disabled={loading}
            className="bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 transition-all disabled:opacity-50"
          >
            🎯 Test Single Product
          </button>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Products API Result */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              Products API
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              {productsResult ? (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(productsResult, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500 italic">No result yet</p>
              )}
            </div>
            {productsResult?.success && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                ✅ Success! Found {productsResult.data?.products?.length || 0} products
              </div>
            )}
            {productsResult?.success === false && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
                ❌ Error: {productsResult.error}
              </div>
            )}
          </div>

          {/* Categories API Result */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
              Categories API
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              {categoriesResult ? (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(categoriesResult, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500 italic">No result yet</p>
              )}
            </div>
            {categoriesResult?.success && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                ✅ Success! Found {categoriesResult.data?.length || 0} categories
              </div>
            )}
            {categoriesResult?.success === false && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
                ❌ Error: {categoriesResult.error}
              </div>
            )}
          </div>

          {/* Single Product API Result */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-3 h-3 bg-pink-500 rounded-full mr-3"></span>
              Single Product API
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
              {singleProductResult ? (
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {JSON.stringify(singleProductResult, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500 italic">No result yet</p>
              )}
            </div>
            {singleProductResult?.success && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
                ✅ Success! Product: {singleProductResult.data?.name}
              </div>
            )}
            {singleProductResult?.success === false && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
                ❌ Error: {singleProductResult.error}
              </div>
            )}
          </div>
        </div>

        {/* Database Connection Status */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🗄️ Database Connection Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Environment</h4>
              <p className="text-blue-600">{process.env.NODE_ENV || 'development'}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">Prisma Status</h4>
              <p className="text-green-600">
                {typeof window !== 'undefined' ? 'Client-side' : 'Server-side'}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800">API Routes</h4>
              <p className="text-purple-600">Ready for testing</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            📋 Testing Instructions
          </h3>
          <div className="space-y-3 text-gray-700">
            <p>• <strong>Click "Test All APIs"</strong> to test all endpoints at once</p>
            <p>• <strong>Check the Console</strong> for detailed logs</p>
            <p>• <strong>If you see errors:</strong> Make sure DATABASE_URL is set in .env</p>
            <p>• <strong>If no data appears:</strong> Make sure to run the seed script</p>
            <p>• <strong>Expected result:</strong> JSON responses with product and category data</p>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="mt-8 bg-gray-900 text-white rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">🛠️ Quick Commands</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
            <div className="bg-gray-800 p-3 rounded">
              <p className="text-green-400 mb-1"># Check database</p>
              <p>npx prisma studio</p>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <p className="text-green-400 mb-1"># Run seed data</p>
              <p>npx prisma db seed</p>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <p className="text-green-400 mb-1"># Test Products API</p>
              <p>curl http://localhost:3000/api/products</p>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <p className="text-green-400 mb-1"># Test Categories API</p>
              <p>curl http://localhost:3000/api/categories</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}