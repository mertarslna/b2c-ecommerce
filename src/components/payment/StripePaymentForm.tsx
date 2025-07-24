'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Stripe public key - environment variable'dan gelecek
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface StripePaymentFormProps {
  amount: number
  currency?: string
  orderId: string
  customerId: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
}

const PaymentForm = ({ amount, currency = 'TRY', orderId, customerId, onSuccess, onError }: StripePaymentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setPaymentError(null)

    try {
      // Önce backend'de payment oluştur
      const createPaymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency,
          method: 'STRIPE',
          customerId,
          description: `Order #${orderId} payment`
        }),
      })

      const createPaymentResult = await createPaymentResponse.json()

      if (!createPaymentResult.success) {
        throw new Error(createPaymentResult.error?.message || 'Payment creation failed')
      }

      const { clientSecret, paymentId } = createPaymentResult.data

      if (!clientSecret) {
        throw new Error('No client secret received')
      }

      // Stripe ile ödeme işlemini tamamla
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // TODO: Gerçek billing bilgilerini ekle
            name: 'Customer Name',
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentId)
      } else {
        throw new Error('Payment not completed')
      }

    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ödeme işlemi başarısız oldu'
      setPaymentError(errorMessage)
      onError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
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
          type="submit"
          disabled={!stripe || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'İşleniyor...' : `${amount} ${currency} Öde`}
        </button>
      </div>
    </form>
  )
}

export const StripePaymentForm = (props: StripePaymentFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Kredi Kartı ile Ödeme</h2>
        <PaymentForm {...props} />
      </div>
    </Elements>
  )
}
