"use client"

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import { ShoppingCart, CreditCard, Lock, ArrowLeft } from 'lucide-react'

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

interface StripeCheckoutFormProps {
  customerInfo: CustomerInfo
  shippingAddress: ShippingAddress
  items: Array<{
    id: string
    name: string
    description: string
    price: number
    quantity: number
    image: string
    currency?: string // ürünlerde currency varsa
  }>
  shipping: number
  tax: number
  total: number
  orderCurrency: string
  orderCurrencySymbol: string
  orderId: string
}


const CheckoutForm: React.FC<StripeCheckoutFormProps> = ({ customerInfo, shippingAddress, items, shipping, tax, total, orderCurrency, orderCurrencySymbol, orderId }) => {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Eğer props eksikse uyarı göster
  if (!customerInfo || !shippingAddress || !items || !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">Stripe ödeme için gerekli bilgiler eksik.</div>
          <button onClick={() => router.push('/checkout')} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg">Teslimat Bilgilerine Dön</button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      alert('Lütfen tüm gerekli alanları doldurun')
      return
    }

    setLoading(true)


    try {
      // Ülke adını iki harfli ISO koduna çevir
      const countryNameToCode: Record<string, string> = {
        'United States': 'US',
        'Turkey': 'TR',
        'Germany': 'DE',
        'France': 'FR',
        'United Kingdom': 'GB',
        'Netherlands': 'NL',
        'Italy': 'IT',
        'Spain': 'ES',
        'Canada': 'CA',
        'Australia': 'AU',
        // ...gerekirse ekle
      }
      const shippingAddressPatched = {
        ...shippingAddress,
        country: countryNameToCode[shippingAddress.country] || shippingAddress.country
      }

      const currency = orderCurrency.toUpperCase()
      const zeroDecimalCurrencies = ['JPY', 'KRW']
      const isZeroDecimal = zeroDecimalCurrencies.includes(currency)
      // Stripe için amount: TRY/USD/EUR için cent/kuruş, JPY için tam sayı
      const amount = isZeroDecimal ? Math.round(total / 100) : Math.round(total * 100)

      const response = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: currency.toLowerCase(),
          orderId,
          customerEmail: customerInfo.email,
          metadata: {
            customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
            phone: customerInfo.phone,
            shippingAddress: JSON.stringify(shippingAddressPatched)
          }
        }),
      })

      let result = null
      try {
        result = await response.json()
      } catch (err) {
        throw new Error('Stripe API yanıtı alınamadı veya bozuk. Sunucu hatası olabilir.')
      }
      if (!result || !result.success || result.error) {
        throw new Error(result?.error?.message || 'API request failed')
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
              country: shippingAddressPatched.country,
            },
          },
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      if (paymentIntent.status === 'succeeded') {
        // Save payment details to localStorage for success page
        const paymentDetails = {
          paymentIntentId: paymentIntent.id,
          amount,
          currency,
          status: 'succeeded',
          method: 'card',
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          customerEmail: customerInfo.email,
          orderId: orderId,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('lastPayment', JSON.stringify(paymentDetails))
        router.push(`/payment/success?intentId=${paymentIntent.id}&order_id=${orderId}&amount=${amount}`)
      }

    } catch (error) {
      alert(`Ödeme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
    } finally {
      setLoading(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#a21caf', // mor
        backgroundColor: '#fff0f6', // açık pembe
        fontFamily: 'inherit',
        '::placeholder': {
          color: '#d1a5f7', // açık mor
        },
        iconColor: '#ec4899', // pembe
      },
      invalid: {
        color: '#e11d48', // kırmızımsı pembe
        iconColor: '#e11d48',
      },
      complete: {
        color: '#10b981', // yeşil
      },
    },
    hidePostalCode: true,
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-3xl shadow-2xl border border-pink-200 p-8 my-8">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => router.push('/checkout')}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </button>
        <div className="text-center w-full">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-1">Kart ile Ödeme (Stripe)</h1>
          <p className="text-md text-pink-600">Kart bilgilerinizi güvenle girin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information - Read Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ad</label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm">{customerInfo.firstName}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Soyad</label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm">{customerInfo.lastName}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">E-posta</label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm">{customerInfo.email}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Telefon</label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm">{customerInfo.phone || '-'}</div>
          </div>
        </div>

        {/* Shipping Address - Read Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Adres</label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm">{shippingAddress.address}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Şehir</label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm">{shippingAddress.city}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Posta Kodu</label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm">{shippingAddress.postalCode}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ülke</label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 text-sm">{shippingAddress.country}</div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-200 rounded-2xl p-6 shadow">
          <h2 className="text-lg font-bold mb-4 flex items-center text-pink-700">
            <CreditCard className="mr-2 h-5 w-5 text-pink-500" />
            Kart Bilgileri
          </h2>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-pink-600 mb-2">Kart Numarası, Son Kullanma Tarihi ve CVC *</label>
            <div className="border-2 border-pink-200 rounded-xl p-3 bg-white focus-within:border-pink-500 transition-all">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
          <div className="flex items-center text-xs text-purple-700 mb-2">
            <Lock className="h-4 w-4 mr-2 text-purple-400" />
            Ödeme bilgileriniz SSL ile şifrelenerek korunmaktadır
          </div>
          <div className="bg-gradient-to-r from-pink-200 to-purple-200 border border-pink-300 rounded-md p-3 mb-2">
            <p className="text-xs text-pink-800">
              <strong>Test Kartı:</strong> 4242 4242 4242 4242, Son kullanma: herhangi gelecek tarih, CVC: herhangi 3 rakam
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mt-2 border border-pink-100">
          <h2 className="text-base font-semibold mb-4 flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Sipariş Özeti
          </h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-600">Adet: {item.quantity}</p>
                </div>
        <div className="text-sm font-semibold">{orderCurrencySymbol}{(item.price * item.quantity).toFixed(2)} {orderCurrency}</div>
              </div>
            ))}
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-xs">
            <span>Ara Toplam:</span>
            <span>{orderCurrencySymbol}{(total - shipping - tax).toFixed(2)} {orderCurrency}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Kargo:</span>
            <span>{orderCurrencySymbol}{shipping.toFixed(2)} {orderCurrency}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Vergi:</span>
            <span>{orderCurrencySymbol}{tax.toFixed(2)} {orderCurrency}</span>
          </div>
          <div className="flex justify-between text-base font-bold mt-2">
            <span>Toplam:</span>
            <span>{orderCurrencySymbol}{total.toFixed(2)} {orderCurrency}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 px-4 rounded-2xl font-bold text-lg shadow-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
        >
          {loading ? 'İşleniyor...' : `${orderCurrencySymbol}${total.toFixed(2)} ${orderCurrency} Öde`}
        </button>
      </form>
    </div>
  )
}

// Wrapper artık kullanılmıyor, CheckoutForm doğrudan props ile kullanılacak
export default CheckoutForm
