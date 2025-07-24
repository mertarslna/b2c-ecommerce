'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { PaymentSelector } from '@/components/payment/PaymentSelector'
import { useState, useEffect } from 'react'

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [orderData, setOrderData] = useState<{
    orderId: string
    amount: number
    currency: string
    customerId: string
  } | null>(null)

  useEffect(() => {
    // URL parametrelerinden ödeme bilgilerini al
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const currency = searchParams.get('currency') || 'TRY'
    const customerId = searchParams.get('customerId')

    if (orderId && amount && customerId) {
      setOrderData({
        orderId,
        amount: parseFloat(amount),
        currency,
        customerId
      })
    } else {
      // Eksik parametre varsa ana sayfaya yönlendir
      router.push('/')
    }
  }, [searchParams, router])

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId)
    // Başarı sayfasına yönlendir
    router.push(`/payment/success?paymentId=${paymentId}&orderId=${orderData?.orderId}`)
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    // Hata sayfasına yönlendir veya hata mesajı göster
    router.push(`/payment/error?error=${encodeURIComponent(error)}&orderId=${orderData?.orderId}`)
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ödeme bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Ödeme</h1>
            <p className="mt-2 text-gray-600">
              Güvenli ödeme sistemi ile alışverişinizi tamamlayın
            </p>
          </div>

          {/* Payment Component */}
          <PaymentSelector
            amount={orderData.amount}
            currency={orderData.currency}
            orderId={orderData.orderId}
            customerId={orderData.customerId}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />

          {/* Security Info */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">🔒</span>
                <span className="text-sm text-gray-600">SSL Güvenlik</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">🛡️</span>
                <span className="text-sm text-gray-600">PCI DSS Uyumlu</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm text-gray-600">3D Secure</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              Ödeme bilgileriniz 256-bit SSL şifreleme ile korunmaktadır.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
