'use client'

import { useState } from 'react'

interface PayThorPaymentFormProps {
  amount: number
  currency?: string
  orderId: string
  customerId: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
}

export const PayThorPaymentForm = ({ 
  amount, 
  currency = 'TRY', 
  orderId, 
  customerId, 
  onSuccess, 
  onError 
}: PayThorPaymentFormProps) => {
  const [loading, setLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handlePayThorPayment = async () => {
    setLoading(true)
    setPaymentError(null)

    try {
      // Backend'de PayThor payment oluştur
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency,
          method: 'PAYTHOR',
          customerId,
          description: `Order #${orderId} payment via PayThor`
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || 'PayThor payment creation failed')
      }

      const { paymentUrl, paymentId } = result.data

      if (paymentUrl) {
        // PayThor ödeme sayfasına yönlendir
        window.location.href = paymentUrl
      } else {
        // Eğer paymentUrl yoksa, payment başarılı demektir
        onSuccess(paymentId)
      }

    } catch (error) {
      console.error('PayThor payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'PayThor ödeme işlemi başarısız oldu'
      setPaymentError(errorMessage)
      onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">PayThor ile Ödeme</h2>
      
      <div className="space-y-4">
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex justify-center items-center h-16">
            <div className="text-lg font-medium text-gray-600">
              PayThor Güvenli Ödeme
            </div>
          </div>
          <div className="text-sm text-gray-500 text-center mt-2">
            Türkiye'nin güvenli ödeme sistemi ile ödemelerinizi hızlı ve güvenli bir şekilde yapın.
          </div>
        </div>

        {paymentError && (
          <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
            {paymentError}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            Toplam: {amount} {currency}
          </div>
          <button
            onClick={handlePayThorPayment}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Yönlendiriliyor...' : `${amount} ${currency} Öde`}
          </button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          PayThor ile ödeme yaptığınızda güvenli ödeme sayfasına yönlendirileceksiniz.
        </div>
      </div>
    </div>
  )
}
