'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#424770',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#9e2146',
    },
  },
}

function CheckoutForm({ clientSecret, paymentId }: { clientSecret: string, paymentId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [succeeded, setSucceeded] = useState(false)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)
    setProcessing(true)

    const card = elements.getElement(CardElement)

    if (!card) {
      setError('Kart bilgileri bulunamadı')
      setLoading(false)
      setProcessing(false)
      return
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: 'Test Customer',
          },
        }
      })

      if (error) {
        setError(error.message || 'Ödeme işlemi başarısız oldu')
        setProcessing(false)
      } else {
        setSucceeded(true)
        setProcessing(false)
        // Redirect to success page
        router.push(`/payment/success?paymentId=${paymentId}&intentId=${paymentIntent.id}`)
      }
    } catch (err) {
      setError('Ödeme işlemi sırasında bir hata oluştu')
      setProcessing(false)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kart Bilgileri</h2>
        <p className="text-gray-600">Güvenli ödeme için kart bilgilerinizi girin</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kart Bilgileri
            </label>
            <div className="border border-gray-300 rounded-lg p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          {/* Test Cards Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Test Kartları:</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <div>✅ Başarılı: 4242 4242 4242 4242</div>
              <div>❌ Başarısız: 4000 0000 0000 0002</div>
              <div>🔐 3D Secure: 4000 0000 0000 3220</div>
              <div className="text-blue-600 mt-2">Son kullanma: Gelecekteki herhangi bir tarih, CVC: Herhangi 3 rakam</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">❌</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || loading || processing || succeeded}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              İşleniyor...
            </>
          ) : succeeded ? (
            <>
              <span className="mr-2">✅</span>
              Ödeme Başarılı
            </>
          ) : (
            'Ödemeyi Tamamla'
          )}
        </button>
      </form>

      {/* Security Features */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <span>🔒</span>
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🛡️</span>
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🔐</span>
            <span>3D Secure</span>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Powered by Stripe
        </p>
      </div>
    </div>
  )
}

export default function StripePaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const clientSecret = searchParams.get('clientSecret')
  const paymentId = searchParams.get('paymentId')

  useEffect(() => {
    if (!clientSecret || !paymentId) {
      router.push('/checkout')
    }
  }, [clientSecret, paymentId, router])

  if (!clientSecret || !paymentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Güvenli Ödeme</h1>
          <p className="text-gray-600">Stripe güvenli ödeme sistemi ile ödemenizi tamamlayın</p>
        </div>

        {/* Payment Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <div className="ml-2 text-sm text-gray-600">Sipariş Bilgileri</div>
            </div>
            <div className="w-16 h-0.5 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="ml-2 text-sm font-medium text-blue-600">Ödeme</div>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div className="ml-2 text-sm text-gray-600">Tamamlandı</div>
            </div>
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm clientSecret={clientSecret} paymentId={paymentId} />
        </Elements>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Geri Dön
          </button>
        </div>
      </div>
    </div>
  )
}
