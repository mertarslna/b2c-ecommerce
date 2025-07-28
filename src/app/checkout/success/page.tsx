
// src/app/checkout/cancel/page.tsx - COMPLETE VERSION
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'

export default function PaymentCancelPage() {
  const { user, isAuthenticated } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
  }, [isAuthenticated, router])

  const handleRetryPayment = async () => {
    if (!orderId) return

    setLoading(true)
    try {
      // Redirect back to checkout with the same order
      router.push(`/checkout?retry=${orderId}`)
    } catch (error) {
      console.error('Error retrying payment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Header />
      
      <div className="container mx-auto px-6 py-16">
        <div className="text-center py-20">
          <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-3xl p-16 max-w-2xl mx-auto">
            
            {/* Cancel Icon */}
            <div className="text-8xl mb-6">🚫</div>
            
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Payment Cancelled
            </h1>
            
            {/* Description */}
            <p className="text-xl text-gray-600 mb-8">
              Your payment was cancelled and no charges were made to your account. 
              Your order is still pending and you can retry the payment.
            </p>
            
            {/* Order Information */}
            {orderId && (
              <div className="bg-white rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                <div className="text-gray-700">
                  <p><strong>Order ID:</strong> #{orderId.slice(-8)}</p>
                  <p><strong>Status:</strong> <span className="text-orange-600">Payment Pending</span></p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your items are reserved for 24 hours while you complete payment.
                  </p>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {orderId && (
                <button
                  onClick={handleRetryPayment}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 inline" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Redirecting...
                    </>
                  ) : (
                    <>🔄 Retry Payment</>
                  )}
                </button>
              )}
              
              <Link
                href="/cart"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
              >
                🛒 Back to Cart
              </Link>
              
              <Link
                href="/"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
              >
                🏠 Continue Shopping
              </Link>
            </div>
            
            {/* Help Section */}
            <div className="mt-12 pt-8 border-t border-orange-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl mb-2">💬</div>
                  <h4 className="font-semibold mb-1">Live Chat</h4>
                  <p className="text-gray-600">Get instant help from our support team</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl mb-2">📞</div>
                  <h4 className="font-semibold mb-1">Call Us</h4>
                  <p className="text-gray-600">+90 212 XXX XXXX</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl mb-2">📧</div>
                  <h4 className="font-semibold mb-1">Email</h4>
                  <p className="text-gray-600">support@yourstore.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}