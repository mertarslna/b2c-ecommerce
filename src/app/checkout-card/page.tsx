'use client'

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import { ShoppingCart, CreditCard, Lock, ArrowLeft } from 'lucide-react'

// Initialize Stripe
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublishableKey && !stripePublishableKey.includes('your_') 
  ? loadStripe(stripePublishableKey) 
  : null

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface ShippingAddress {
  address: string
  city: string
  postalCode: string
  country: string
}

interface OrderData {
  orderId: string
  customerInfo: CustomerInfo
  shippingAddress: ShippingAddress
  items: Array<{
    id: string
    name: string
    description: string
    price: number
    quantity: number
    image: string
  }>
  shipping: number
  tax: number
  total: number
}

const CheckoutForm: React.FC = () => {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<OrderData | null>(null)

  useEffect(() => {
    // Get order data from localStorage
    const storedData = localStorage.getItem('checkoutData')
    if (!storedData) {
      router.push('/checkout-new')
      return
    }
    
    try {
      const parsed = JSON.parse(storedData) as OrderData
      setOrderData(parsed)
    } catch (error) {
      console.error('Error parsing checkout data:', error)
      router.push('/checkout-new')
    }
  }, [router])

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const { customerInfo, shippingAddress, items, shipping, tax, total, orderId } = orderData

  const handleInputChange = (section: 'customer' | 'shipping', field: string, value: string) => {
    // Since data comes from previous step, we don't need to change it
    // This function can be removed or kept for future editing capability
  }

  const validateForm = () => {
    // Data already validated in previous step
    return true
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !validateForm()) {
      alert('Lütfen tüm gerekli alanları doldurun')
      return
    }

    setLoading(true)

    try {
      // First create payment intent
      const response = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'try',
          orderId,
          customerEmail: customerInfo.email,
          metadata: {
            customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
            phone: customerInfo.phone,
            shippingAddress: JSON.stringify(shippingAddress)
          }
        }),
      })

      const result = await response.json()
      console.log('Payment Intent API Response:', result)

      if (!result.success || result.error) {
        throw new Error(result.error?.message || 'API request failed')
      }

      const clientSecret = result.data.clientSecret

      if (!clientSecret) {
        throw new Error('Client secret not received from payment intent')
      }

      // Confirm payment with card element
      const cardElement = elements.getElement(CardElement)
      
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: {
              line1: shippingAddress.address,
              city: shippingAddress.city,
              country: shippingAddress.country,
            },
          },
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      console.log('Payment Intent Status:', paymentIntent.status)

      if (paymentIntent.status === 'succeeded') {
        // Save payment details to localStorage for success page
        const paymentDetails = {
          paymentIntentId: paymentIntent.id,
          amount: total,
          currency: 'TRY',
          status: 'succeeded',
          method: 'card',
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          customerEmail: customerInfo.email,
          orderId: orderId,
          timestamp: new Date().toISOString()
        }
        
        console.log('Saving payment details to localStorage:', paymentDetails)
        localStorage.setItem('lastPayment', JSON.stringify(paymentDetails))
        
        console.log('Redirecting to success page with:', { intentId: paymentIntent.id, orderId })
        router.push(`/payment/success?intentId=${paymentIntent.id}&order_id=${orderId}&amount=${total}`)
      }

    } catch (error) {
      console.error('Payment error:', error)
      alert(`Ödeme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setLoading(false)
    }
  }

  const cardElementOptions = {
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
    hidePostalCode: true,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/checkout-new')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kart ile Ödeme</h1>
            <p className="text-gray-600">Kart bilgilerinizi güvenle girin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information - Read Only */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Müşteri Bilgileri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ad
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                      {customerInfo.firstName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Soyad
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                      {customerInfo.lastName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                      {customerInfo.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                      {customerInfo.phone || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address - Read Only */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Teslimat Adresi</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adres
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                      {shippingAddress.address}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Şehir
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                        {shippingAddress.city}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Posta Kodu
                      </label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                        {shippingAddress.postalCode}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Kart Bilgileri
                </h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kart Numarası, Son Kullanma Tarihi ve CVC *
                  </label>
                  <div className="border border-gray-300 rounded-md p-3">
                    <CardElement options={cardElementOptions} />
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Lock className="h-4 w-4 mr-2" />
                  Ödeme bilgileriniz SSL ile şifrelenerek korunmaktadır
                </div>

                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'İşleniyor...' : `${(total / 100).toFixed(2)} TRY Öde`}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Sipariş Özeti
            </h2>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                  </div>
                  <div className="text-lg font-semibold">
                    {((item.price * item.quantity) / 100).toFixed(2)} TRY
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ara Toplam:</span>
                <span>{((total - shipping - tax) / 100).toFixed(2)} TRY</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kargo:</span>
                <span>{(shipping / 100).toFixed(2)} TRY</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Vergi:</span>
                <span>{(tax / 100).toFixed(2)} TRY</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Toplam:</span>
                <span>{(total / 100).toFixed(2)} TRY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutWithCardPage() {
  // Check if Stripe is configured
  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-red-500 mb-4">
            <CreditCard className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ödeme Sistemi Yapılandırılmamış
          </h2>
          <p className="text-gray-600 mb-6">
            Stripe ödeme sistemi henüz yapılandırılmamış. Lütfen site yöneticisiyle iletişime geçin.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
