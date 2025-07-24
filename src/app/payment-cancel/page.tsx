'use client'

import React, { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, Home } from 'lucide-react'

export default function PaymentCancelPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const orderId = searchParams.get('orderId')
  const merchantReference = searchParams.get('merchant_reference')

  useEffect(() => {
    // PayThor checkout verilerini temizle
    localStorage.removeItem('paythorCheckoutData')
    localStorage.removeItem('paythor_merchant_reference')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Cancel Icon */}
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Ödeme İptal Edildi
          </h1>
          <p className="text-gray-600">
            Ödeme işlemi iptal edildi veya başarısız oldu.
          </p>
        </div>

        {/* Order Info */}
        {orderId && (
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center mb-2">
              <span className="text-sm text-red-600">Sipariş No:</span>
            </div>
            <div className="font-semibold text-red-800">#{orderId}</div>
            {merchantReference && (
              <div className="text-xs text-red-600 mt-1">
                Referans: {merchantReference}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Tekrar Dene
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Ana Sayfaya Dön
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 mt-6">
          Sorun devam ederse, lütfen müşteri hizmetlerimizle iletişime geçin.
        </p>
      </div>
    </div>
  )
}
