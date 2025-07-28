// src/app/orders/track/[trackingNumber]/page.tsx - COMPLETE
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'

export default function OrderTrackingPage({ params }: { params: { trackingNumber: string } }) {
  const { isAuthenticated, isLoading } = useUser()
  const router = useRouter()
  const trackingNumber = params.trackingNumber
  
  const [loading, setLoading] = useState(true)
  const [trackingData, setTrackingData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (trackingNumber) {
      fetchTrackingData()
    }
  }, [isAuthenticated, isLoading, trackingNumber, router])

  const fetchTrackingData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/shipping/track/${trackingNumber}`)
      const result = await response.json()

      if (result.success) {
        setTrackingData(result.data)
      } else {
        setError(result.error || 'Failed to load tracking information')
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error)
      setError('Failed to load tracking information')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-blue-600">Loading Tracking Information...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
        <Header />
        <div className="container mx-auto px-6 py-16">
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl p-16 max-w-lg mx-auto">
              <div className="text-8xl mb-6">📦❌</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Tracking Not Found</h2>
              <p className="text-xl text-gray-600 mb-8">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/orders"
                  className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
                >
                  View All Orders
                </Link>
                <button
                  onClick={fetchTrackingData}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🔄 Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'in_transit': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'delivery_attempted': 'bg-orange-100 text-orange-800',
      'cancelled': 'bg-red-100 text-red-800',
      'returned': 'bg-gray-100 text-gray-800'
    }
    return colors[status?.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-6">
        <nav className="text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">Home</Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/orders" className="text-gray-500 hover:text-blue-600 transition-colors">Orders</Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-blue-600 font-semibold">Track Package</li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-6 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Package Tracking
          </h1>
          <p className="text-xl text-gray-600">
            Track your order: <span className="font-bold text-blue-600">{trackingNumber}</span>
          </p>
        </div>

        {/* Tracking Status Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8">
            
            {/* Current Status */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-6 py-3 mb-4">
                <span className="text-3xl">🚚</span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(trackingData?.current_status)}`}>
                  {trackingData?.current_status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-lg text-gray-600">{trackingData?.status_description}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Delivery Progress</span>
                <span className="text-sm font-semibold text-blue-600">{trackingData?.delivery_progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${trackingData?.delivery_progress || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>🚛</span> Carrier
                </h4>
                <p className="text-gray-700">{trackingData?.carrier || 'N/A'}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>📅</span> Shipped Date
                </h4>
                <p className="text-gray-700">
                  {trackingData?.shipping_date 
                    ? new Date(trackingData.shipping_date).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>⏰</span> Est. Delivery
                </h4>
                <p className="text-gray-700">
                  {trackingData?.estimated_delivery 
                    ? new Date(trackingData.estimated_delivery).toLocaleDateString()
                    : 'TBD'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tracking Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-2xl">📍</span>
                Tracking Timeline
              </h3>
              
              <div className="space-y-6">
                {trackingData?.tracking_timeline?.map((update: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 relative">
                    {/* Timeline Line */}
                    {index < trackingData.tracking_timeline.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-blue-200 to-purple-200"></div>
                    )}
                    
                    {/* Timeline Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg z-10 ${
                      update.completed 
                        ? (update.is_current 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 ring-4 ring-blue-200' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-500'
                          )
                        : 'bg-gray-300'
                    }`}>
                      <span className="text-xl">{update.icon || '📦'}</span>
                    </div>
                    
                    {/* Timeline Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-bold text-lg ${
                          update.is_current ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {update.status}
                        </h4>
                        <div className="text-sm text-gray-500">
                          <span>{update.date}</span>
                          {update.time && <span className="ml-2">{update.time}</span>}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{update.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="bg-gray-100 px-3 py-1 rounded-full">
                          📍 {update.location}
                        </span>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tracking information available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order & Delivery Info */}
          <div className="space-y-6">
            
            {/* Order Information */}
            <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🛍️</span>
                Order Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order #</span>
                  <span className="font-semibold">#{trackingData?.order_info?.order_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold text-green-600">₺{trackingData?.order_info?.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items</span>
                  <span className="font-semibold">{trackingData?.order_info?.items_count || 0} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer</span>
                  <span className="font-semibold">{trackingData?.order_info?.customer_name || 'N/A'}</span>
                </div>
              </div>

              {trackingData?.order_info?.id && (
                <Link
                  href={`/orders/${trackingData.order_info.id}`}
                  className="mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 text-center block"
                >
                  📋 View Full Order
                </Link>
              )}
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📮</span>
                Delivery Address
              </h3>
              
              <div className="text-gray-700 space-y-1">
                <p className="font-semibold">{trackingData?.delivery_address?.recipient_name || 'N/A'}</p>
                {trackingData?.delivery_address?.company && (
                  <p className="text-sm text-gray-600">{trackingData.delivery_address.company}</p>
                )}
                <p>{trackingData?.delivery_address?.address_line1 || 'N/A'}</p>
                {trackingData?.delivery_address?.address_line2 && (
                  <p>{trackingData.delivery_address.address_line2}</p>
                )}
                <p>
                  {trackingData?.delivery_address?.city || 'N/A'}, {trackingData?.delivery_address?.state || ''} {trackingData?.delivery_address?.postal_code || ''}
                </p>
                <p>{trackingData?.delivery_address?.country || 'N/A'}</p>
                {trackingData?.delivery_address?.phone && (
                  <p className="text-sm text-gray-600">📞 {trackingData.delivery_address.phone}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                Actions
              </h3>
              
              <div className="space-y-3">
                <button 
                  onClick={fetchTrackingData}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                >
                  🔄 Refresh Status
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(trackingNumber)
                    alert('Tracking number copied!')
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                >
                  📋 Copy Tracking #
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items */}
        {trackingData?.order_info?.items && trackingData.order_info.items.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-2xl">📦</span>
                Items in This Package ({trackingData.order_info.items.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trackingData.order_info.items.map((item: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.name}</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Qty: {item.quantity}</span>
                      <span className="font-bold text-blue-600">₺{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link
            href="/orders"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
          >
            📋 All Orders
          </Link>
          
          <Link
            href="/"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
          >
            🛒 Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}