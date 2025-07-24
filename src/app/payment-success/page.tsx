'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Package, CreditCard, Home, Mail } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const orderId = searchParams.get('orderId')
  const method = searchParams.get('method')
  const merchantReference = searchParams.get('merchant_reference')
  const paymentId = searchParams.get('paymentId')
  
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    // PayThor checkout verilerini temizle
    localStorage.removeItem('paythorCheckoutData')
    localStorage.removeItem('paythor_merchant_reference')
    
    // Redirect to home after 10 seconds
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const getPaymentMethodName = (method: string | null) => {
    switch (method) {
      case 'stripe':
        return 'Stripe'
      case 'paythor':
        return 'PayThor'
      default:
        return 'Ödeme Sistemi'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Ödemeniz Başarılı!
          </h1>
          <p className="text-gray-600">
            Siparişiniz başarıyla alındı ve işleme alındı.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            {orderId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sipariş No:</span>
                <span className="font-semibold text-gray-900">{orderId}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ödeme Yöntemi:</span>
              <span className="font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-4 h-4 mr-1" />
                {getPaymentMethodName(method)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Durum:</span>
              <span className="font-semibold text-green-600">Onaylandı</span>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center justify-center">
            <Package className="w-5 h-5 mr-2" />
            Sırada Ne Var?
          </h3>
          <div className="text-left space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <Mail className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
              <span>Sipariş onay e-postası gönderilecek</span>
            </div>
            <div className="flex items-start">
              <Package className="w-4 h-4 mr-2 mt-0.5 text-orange-500" />
              <span>Ürünleriniz 1-3 iş günü içinde kargoya verilecek</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
              <span>Kargo takip bilgileri SMS ile gönderilecek</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Home className="mr-2 h-5 w-5" />
            Ana Sayfaya Dön
          </button>
          
          <p className="text-xs text-gray-500">
            {countdown > 0 ? (
              <>Ana sayfaya {countdown} saniye sonra otomatik yönlendirileceksiniz</>
            ) : (
              'Yönlendiriliyor...'
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Herhangi bir sorunuz varsa{' '}
            <a href="mailto:destek@example.com" className="text-blue-600 underline">
              destek@example.com
            </a>{' '}
            adresinden bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  )
}
