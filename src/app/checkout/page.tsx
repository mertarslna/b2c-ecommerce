
// src/app/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

const StripeCheckoutForm = dynamic(() => import('@/components/StripeCheckoutForm'), { ssr: false })
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublishableKey && !stripePublishableKey.includes('your_') 
  ? loadStripe(stripePublishableKey) 
  : null
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCart()
  const { user, isAuthenticated, isLoading } = useUser()
  const router = useRouter()

  // Form States
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Review, 4: Confirmation
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Shipping Information
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  })


  // Payment Method: 'paythor' | 'stripe'
  const [paymentMethod, setPaymentMethod] = useState<'paythor' | 'stripe'>('paythor')
  // Payment Information (PayThor)
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    saveCard: false
  })

  // Shipping Options
  const [shippingMethod, setShippingMethod] = useState('standard')
  const shippingOptions = [
    { id: 'standard', name: 'Standard Delivery', price: 0, time: '5-7 business days' },
    { id: 'express', name: 'Express Delivery', price: 15.99, time: '2-3 business days' },
    { id: 'overnight', name: 'Overnight Delivery', price: 29.99, time: '1 business day' }
  ]

  // Order Summary ve currency
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    currency: 'USD',
    currencySymbol: '$',
    currencyError: ''
  })

  // Error States
  const [errors, setErrors] = useState<any>({})

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
        return
      }
      if (items.length === 0) {
        router.push('/cart')
        return
      }
    }
  }, [isAuthenticated, isLoading, items.length, router])

  // Initialize user data
  useEffect(() => {
    if (user) {
      const fullName = user.name || ''
      const nameParts = fullName.split(' ')
      
      setShippingInfo(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts[1] || '',
        email: user.email || ''
      }))
    }
  }, [user])

  // Calculate order summary (currency-aware)
  useEffect(() => {
    if (!items || items.length === 0) {
      setOrderSummary({ subtotal: 0, shipping: 0, tax: 0, total: 0, currency: 'USD', currencySymbol: '$', currencyError: '' })
      return
    }
    // Sepetteki tüm ürünlerin currency'sini kontrol et
    const uniqueCurrencies = Array.from(new Set(items.map(item => (item.currency || 'USD').toUpperCase())))
    let currencyError = ''
    if (uniqueCurrencies.length > 1) {
      currencyError = 'Sepette birden fazla para birimi var. Stripe ile ödeme için tüm ürünlerin para birimi aynı olmalı.'
    }
    const currency = uniqueCurrencies[0]
    const currencySymbol = currency === 'TRY' ? '₺' : (currency === 'EUR' ? '€' : '$')

    // Fiyat cinsini belirle (ör. TL/TRY için kuruş, USD için cent)
    const zeroDecimalCurrencies = ['JPY', 'KRW']
    const isZeroDecimal = zeroDecimalCurrencies.includes(currency)

    // Fiyatları doğru birimle topla
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const selectedShipping = shippingOptions.find(option => option.id === shippingMethod)
    const shipping = selectedShipping?.price || 0
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + shipping + tax

    setOrderSummary({
      subtotal,
      shipping,
      tax,
      total,
      currency,
      currencySymbol,
      currencyError
    })
  }, [items, shippingMethod])

  const validateStep = (stepNumber: number) => {
    const newErrors: any = {}
    if (stepNumber === 1) {
      // Validate shipping information
      if (!shippingInfo.firstName) newErrors.firstName = 'First name is required'
      if (!shippingInfo.lastName) newErrors.lastName = 'Last name is required'
      if (!shippingInfo.email) newErrors.email = 'Email is required'
      if (!shippingInfo.phone) newErrors.phone = 'Phone number is required'
      if (!shippingInfo.address) newErrors.address = 'Address is required'
      if (!shippingInfo.city) newErrors.city = 'City is required'
      if (!shippingInfo.zipCode) newErrors.zipCode = 'ZIP code is required'
    }
    if (stepNumber === 2 && paymentMethod === 'paythor') {
      // Validate PayThor ödeme formu
      if (!paymentInfo.cardNumber) newErrors.cardNumber = 'Card number is required'
      if (!paymentInfo.expiryDate) newErrors.expiryDate = 'Expiry date is required'
      if (!paymentInfo.cvv) newErrors.cvv = 'CVV is required'
      if (!paymentInfo.cardName) newErrors.cardName = 'Cardholder name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrevStep = () => {
    setStep(step - 1)
  }

  const handleInputChange = (field: string, value: string, type: 'shipping' | 'payment') => {
    if (type === 'shipping') {
      setShippingInfo(prev => ({ ...prev, [field]: value }))
    } else {
      setPaymentInfo(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }))
    }
  }

  const handlePlaceOrder = async () => {
    if (!validateStep(2)) return

    setIsProcessing(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Generate order ID
      const orderId = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

      // Clear cart
      clearCart()

      // Move to confirmation step
      setStep(4)

      // Store order ID for confirmation
      sessionStorage.setItem('lastOrderId', orderId)

    } catch (error) {
      console.error('Order placement failed:', error)
      setErrors({ general: 'Failed to place order. Please try again.' })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-pink-600">Loading Checkout...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      <main className="max-w-2xl mx-auto py-12">
        {/* Step 1: Shipping */}
        {step === 1 && (
          <div className="space-y-6 bg-white rounded-3xl shadow-xl border border-pink-100 p-8 my-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Teslimat Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Ad *</label>
                <input type="text" value={shippingInfo.firstName} onChange={e => handleInputChange('firstName', e.target.value, 'shipping')} className="w-full p-4 border-2 rounded-xl focus:outline-none border-pink-200 focus:border-pink-500" placeholder="Adınız" />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Soyad *</label>
                <input type="text" value={shippingInfo.lastName} onChange={e => handleInputChange('lastName', e.target.value, 'shipping')} className="w-full p-4 border-2 rounded-xl focus:outline-none border-pink-200 focus:border-pink-500" placeholder="Soyadınız" />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">E-posta *</label>
                <input type="email" value={shippingInfo.email} onChange={e => handleInputChange('email', e.target.value, 'shipping')} className="w-full p-4 border-2 rounded-xl focus:outline-none border-pink-200 focus:border-pink-500" placeholder="E-posta adresiniz" />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Telefon *</label>
                <input type="text" value={shippingInfo.phone} onChange={e => handleInputChange('phone', e.target.value, 'shipping')} className="w-full p-4 border-2 rounded-xl focus:outline-none border-pink-200 focus:border-pink-500" placeholder="Telefon numarası" />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">Adres *</label>
                <input type="text" value={shippingInfo.address} onChange={e => handleInputChange('address', e.target.value, 'shipping')} className="w-full p-4 border-2 rounded-xl focus:outline-none border-pink-200 focus:border-pink-500" placeholder="Adres" />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Şehir *</label>
                <input type="text" value={shippingInfo.city} onChange={e => handleInputChange('city', e.target.value, 'shipping')} className="w-full p-4 border-2 rounded-xl focus:outline-none border-pink-200 focus:border-pink-500" placeholder="Şehir" />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Posta Kodu *</label>
                <input type="text" value={shippingInfo.zipCode} onChange={e => handleInputChange('zipCode', e.target.value, 'shipping')} className="w-full p-4 border-2 rounded-xl focus:outline-none border-pink-200 focus:border-pink-500" placeholder="Posta Kodu" />
                {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Ülke</label>
                <input type="text" value={shippingInfo.country} onChange={e => handleInputChange('country', e.target.value, 'shipping')} className="w-full p-4 border-2 rounded-xl focus:outline-none border-pink-200 focus:border-pink-500" placeholder="Ülke" />
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button onClick={handleNextStep} className="bg-gradient-to-r from-pink-500 to-red-400 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-red-500 transition-all">Devam Et →</button>
            </div>
          </div>
        )}
        {/* Step 2: Ödeme Yöntemi Seçimi ve Formlar */}
        {step === 2 && (
          <div className="space-y-6 bg-white rounded-3xl shadow-xl border border-pink-100 p-8 my-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ödeme Yöntemi</h2>
            <div className="flex gap-6 mb-6">
              <button
                className={`px-6 py-3 rounded-xl font-semibold border-2 transition-all ${paymentMethod === 'paythor' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-pink-600 border-pink-200 hover:bg-pink-50'}`}
                onClick={() => setPaymentMethod('paythor')}
                type="button"
              >
                Kredi Kartı (PayThor)
              </button>
              <button
                className={`px-6 py-3 rounded-xl font-semibold border-2 transition-all ${paymentMethod === 'stripe' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                onClick={() => setPaymentMethod('stripe')}
                type="button"
              >
                Kredi Kartı (Stripe)
              </button>
            </div>
            {/* PayThor Form */}
            {paymentMethod === 'paythor' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Kart Numarası *</label>
                  <input type="text" value={paymentInfo.cardNumber} onChange={e => handleInputChange('cardNumber', e.target.value, 'payment')} className="w-full p-4 border-2 rounded-xl focus:outline-none border-pink-200 focus:border-pink-500" placeholder="1234 5678 9012 3456" />
                  {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Son Kullanma Tarihi *</label>
                    <input type="text" value={paymentInfo.expiryDate} onChange={e => handleInputChange('expiryDate', e.target.value, 'payment')} className="w-full p-4 border-2 rounded-xl focus:outline-none border-pink-200 focus:border-pink-500" placeholder="AA/YY" />
                    {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">CVV *</label>
                    <input type="text" value={paymentInfo.cvv} onChange={e => handleInputChange('cvv', e.target.value, 'payment')} className="w-full p-4 border-2 rounded-xl focus:outline-none border-pink-200 focus:border-pink-500" placeholder="123" />
                    {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Kart Sahibi Adı *</label>
                  <input type="text" value={paymentInfo.cardName} onChange={e => handleInputChange('cardName', e.target.value, 'payment')} className="w-full p-4 border-2 rounded-xl focus:outline-none border-pink-200 focus:border-pink-500" placeholder="Kart üzerindeki isim" />
                  {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="saveCard" checked={paymentInfo.saveCard} onChange={e => setPaymentInfo(prev => ({ ...prev, saveCard: e.target.checked }))} className="w-5 h-5 text-pink-600 rounded" />
                  <label htmlFor="saveCard" className="ml-3 text-gray-700">Kartı kaydet</label>
                </div>
              </div>
            )}
            {/* Stripe Form */}
            {paymentMethod === 'stripe' && (
              <div className="mt-6">
                {orderSummary.currencyError ? (
                  <div className="text-red-500 font-semibold text-center">{orderSummary.currencyError}</div>
                ) : stripePromise ? (
                  <Elements stripe={stripePromise}>
                    <StripeCheckoutForm
                      customerInfo={{
                        firstName: shippingInfo.firstName,
                        lastName: shippingInfo.lastName,
                        email: shippingInfo.email,
                        phone: shippingInfo.phone
                      }}
                      shippingAddress={{
                        address: shippingInfo.address,
                        city: shippingInfo.city,
                        postalCode: shippingInfo.zipCode,
                        country: shippingInfo.country
                      }}
                      items={items.map(item => ({
                        ...item,
                        description: '',
                        currency: item.currency || orderSummary.currency
                      }))}
                      shipping={orderSummary.shipping}
                      tax={orderSummary.tax}
                      total={orderSummary.total}
                      orderCurrency={orderSummary.currency}
                      orderCurrencySymbol={orderSummary.currencySymbol}
                      orderId={typeof window !== 'undefined' ? (sessionStorage.getItem('lastOrderId') || `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`) : ''}
                    />
                  </Elements>
                ) : (
                  <div className="text-red-500">Stripe anahtarı eksik veya hatalı.</div>
                )}
              </div>
            )}
            <div className="flex justify-between pt-6">
              <button onClick={handlePrevStep} className="bg-gray-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-600 transition-all">← Geri</button>
              {paymentMethod === 'paythor' ? (
                <button onClick={handleNextStep} className="bg-gradient-to-r from-pink-500 to-red-400 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-red-500 transition-all">Devam Et →</button>
              ) : null}
            </div>
          </div>
        )}
        {/* Step 3: Onay */}
        {step === 3 && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-xl border border-pink-100 p-8 my-12">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Siparişiniz Alındı!</h2>
            <p className="text-xl text-gray-600 mb-8">Ödemeniz başarıyla alındı. Teşekkürler!</p>
            <button onClick={() => router.push('/')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all">Alışverişe Devam Et</button>
          </div>
        )}
      </main>
    </div>
  );
}