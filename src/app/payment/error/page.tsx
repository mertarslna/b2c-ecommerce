'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function PaymentErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [errorData, setErrorData] = useState<{
    error: string
    orderId: string | null
  } | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')
    const orderId = searchParams.get('orderId')

    if (error) {
      setErrorData({ error: decodeURIComponent(error), orderId })
    } else {
      // Hata parametresi yoksa ana sayfaya yönlendir
      router.push('/')
    }
  }, [searchParams, router])

  const handleRetryPayment = () => {
    if (errorData?.orderId) {
      router.push(`/payment?orderId=${errorData.orderId}`)
    } else {
      router.push('/cart')
    }
  }

  if (!errorData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Ödeme Başarısız
          </h1>
          
          <p className="text-gray-600 mb-6">
            Ödeme işlemi tamamlanamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyiniz.
          </p>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-red-600">
              <strong>Hata:</strong> {errorData.error}
            </div>
            {errorData.orderId && (
              <div className="text-sm text-red-600 mt-2">
                <strong>Sipariş No:</strong> {errorData.orderId}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tekrar Dene
            </button>
            
            <Link 
              href="/cart"
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors inline-block"
            >
              Sepete Dön
            </Link>
            
            <Link 
              href="/support"
              className="w-full text-blue-600 hover:text-blue-800 transition-colors inline-block"
            >
              Yardım Al
            </Link>
          </div>

          {/* Common Solutions */}
          <div className="mt-6 text-left">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Yaygın Çözümler:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Kart bilgilerinizi kontrol edin</li>
              <li>• Kart limitinizi kontrol edin</li>
              <li>• İnternet bağlantınızı kontrol edin</li>
              <li>• Farklı bir ödeme yöntemi deneyin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
