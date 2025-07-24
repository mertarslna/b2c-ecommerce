'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Lock, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { payThorAPI, PayThorCreatePaymentRequest } from '@/lib/paythor-api'
import PayThorAuth from '@/lib/paythor-auth-direct'

interface CheckoutData {
  orderId: string
  customerInfo: {
    email: string
    firstName: string
    lastName: string
    phone: string
  }
  shippingAddress: {
    address: string
    city: string
    postalCode: string
    country: string
  }
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    description?: string
  }>
  shipping: number
  tax: number
  total: number
}

interface CardInfo {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardHolderName: string
}

export default function PayThorCheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cardInfo, setCardInfo] = useState<CardInfo>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolderName: ''
  })
  const [errors, setErrors] = useState<Partial<CardInfo>>({})

  useEffect(() => {
    // Get checkout data from localStorage
    const storedData = localStorage.getItem('paythorCheckoutData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setCheckoutData(data)
        setCardInfo(prev => ({
          ...prev,
          cardHolderName: `${data.customerInfo.firstName} ${data.customerInfo.lastName}`
        }))
        
        // PayThor API'ye sayfa açıldığında istek gönder
        initializePayThorSession(data)
      } catch (error) {
        console.error('Error parsing checkout data:', error)
        router.push('/checkout')
      }
    } else {
      router.push('/checkout')
    }
  }, [router])

  // PayThor auth kontrolü için ayrı useEffect
  useEffect(() => {
    console.log('=== PAYTHOR AUTH KONTROL useEffect ===')
    
    // PayThor auth instance'ını al ve refresh et
    const auth = PayThorAuth.getInstance();
    console.log('1. Auth instance alındı')
    
    // Token'ı localStorage'dan tekrar yükle
    auth.refreshToken();
    console.log('2. Token refresh edildi')
    
    // Kimlik doğrulama durumunu kontrol et
    const isAuth = auth.isAuthenticated();
    console.log('3. isAuthenticated():', isAuth)
    
    if (!isAuth) {
      console.log('4. Kullanıcı authenticated değil, login sayfasına yönlendiriliyor')
      router.push('/paythor-login?redirect=/checkout-paythor');
      return;
    }
    
    // Token kontrolü
    const token = auth.getToken();
    console.log('5. getToken():', token ? token.substring(0, 20) + '...' : 'null')
    
    // Headers kontrolü
    const headers = auth.getTokenWithHeaders();
    console.log('6. getTokenWithHeaders():', headers)
    
    // localStorage kontrolü
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem('paythor_token');
      console.log('7. localStorage direct token:', localToken ? localToken.substring(0, 20) + '...' : 'null')
    }
    
    setAuthToken(token);
    console.log('8. Auth token state set edildi:', token ? 'var' : 'yok')
    
    console.log('=== PAYTHOR AUTH KONTROL useEffect TAMAM ===')
  }, [router]);

  const initializePayThorSession = async (data: CheckoutData) => {
    try {
      console.log('PayThor token kontrol ediliyor...')
      
      // PayThor Auth service ile token kontrolü
      if (!payThorAPI.isAuthenticated()) {
        console.error('PayThor oturumu geçersiz veya süresi dolmuş')
        alert('PayThor oturumu bulunamadı veya süresi dolmuş. Lütfen giriş yapın.')
        router.push('/paythor-login')
        return
      }

      console.log('PayThor token mevcut ve geçerli, ödeme sistemi hazır.')
      console.log('Laravel çalışan PayThor sistemi kullanılıyor - dev-api.paythor.com')
    } catch (error) {
      console.error('PayThor token kontrolü hatası:', error)
    }
  }

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const handleCardInfoChange = (field: keyof CardInfo, value: string) => {
    let formattedValue = value

    if (field === 'cardNumber') {
      // Remove spaces and limit to 16 digits
      const digits = value.replace(/\D/g, '').slice(0, 16)
      formattedValue = formatCardNumber(digits)
    } else if (field === 'expiryMonth' || field === 'expiryYear') {
      // Only allow digits
      formattedValue = value.replace(/\D/g, '').slice(0, field === 'expiryMonth' ? 2 : 4)
    } else if (field === 'cvv') {
      // Only allow digits, max 4
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    setCardInfo(prev => ({ ...prev, [field]: formattedValue }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateCardInfo = (): boolean => {
    const newErrors: Partial<CardInfo> = {}

    // Card number validation (simple length check)
    const cardDigits = cardInfo.cardNumber.replace(/\D/g, '')
    if (!cardDigits || cardDigits.length < 16) {
      newErrors.cardNumber = 'Geçerli bir kart numarası girin (16 haneli)'
    }

    // Expiry month validation
    const month = parseInt(cardInfo.expiryMonth)
    if (!cardInfo.expiryMonth || month < 1 || month > 12) {
      newErrors.expiryMonth = 'Geçerli bir ay girin (01-12)'
    }

    // Expiry year validation
    const currentYear = new Date().getFullYear()
    const year = parseInt(cardInfo.expiryYear)
    if (!cardInfo.expiryYear || year < currentYear || year > currentYear + 20) {
      newErrors.expiryYear = 'Geçerli bir yıl girin'
    }

    // CVV validation
    if (!cardInfo.cvv || cardInfo.cvv.length < 3) {
      newErrors.cvv = 'Geçerli bir CVV girin (3-4 haneli)'
    }

    // Card holder name validation
    if (!cardInfo.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Kart sahibinin adını girin'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validateCardInfo() || !checkoutData) {
      return
    }

    setLoading(true)

    try {
      // PayThor Auth service ile token al
      console.log('PayThor authentication kontrolü yapılıyor...')
      
      // localStorage'dan token kontrolü
      const storedToken = localStorage.getItem('paythor_token')
      const storedExpiry = localStorage.getItem('paythor_token_expiry')
      
      console.log('Stored token:', storedToken ? 'EXISTS' : 'NOT_FOUND')
      console.log('Stored expiry:', storedExpiry)
      
      if (!payThorAPI.isAuthenticated()) {
        alert('PayThor oturumu bulunamadı veya süresi dolmuş. Lütfen giriş yapın.')
        console.log('Redirecting to PayThor login...')
        router.push('/paythor-login?returnUrl=' + encodeURIComponent('/checkout-paythor'))
        return
      }

      console.log('PayThor ödeme işlemi başlatılıyor...')

      // PayThor ödeme isteği (modern format)
      const merchantReference = `ORDER-${checkoutData.orderId}-${Date.now()}`
      
      const paymentRequest: PayThorCreatePaymentRequest = {
        amount: (checkoutData.total / 100).toFixed(2),
        currency: "TRY",
        buyer_fee: "0",
        method: "creditcard",
        merchant_reference: merchantReference,
        return_url: `${window.location.origin}/payment-success`,
        cancel_url: `${window.location.origin}/payment-cancel`,
        callback_url: `${window.location.origin}/api/webhooks/paythor`,
        
        // Müşteri bilgileri
        first_name: checkoutData.customerInfo.firstName,
        last_name: checkoutData.customerInfo.lastName,
        email: checkoutData.customerInfo.email,
        phone: checkoutData.customerInfo.phone,
        
        // Adres bilgileri
        address_line_1: checkoutData.shippingAddress.address,
        city: checkoutData.shippingAddress.city,
        postal_code: checkoutData.shippingAddress.postalCode || "34000",
        country: checkoutData.shippingAddress.country || "TR",
        
        // Sipariş bilgileri
        order_id: checkoutData.orderId,
        description: `Sipariş #${checkoutData.orderId} - ${checkoutData.items.length} ürün`
      }

      console.log('PayThor payment request:', paymentRequest)

      // PayThor token'ını al
      const authInstance = PayThorAuth.getInstance()
      console.log('PayThor auth instance created')
      console.log('Is authenticated:', authInstance.isAuthenticated())
      
      const tokenData = authInstance.getTokenWithHeaders()
      console.log('Token data from getTokenWithHeaders:', tokenData)
      
      const directToken = authInstance.getToken()
      console.log('Direct token from getToken:', directToken)
      
      // localStorage'dan da kontrol et
      const localStorageToken = localStorage.getItem('paythor_token')
      console.log('Token from localStorage:', localStorageToken)
      
      const { token } = tokenData
      
      if (!token) {
        console.error('Token bulunamadı. Debugging info:')
        console.error('- authInstance.isAuthenticated():', authInstance.isAuthenticated())
        console.error('- directToken:', directToken)
        console.error('- localStorageToken:', localStorageToken)
        throw new Error('PayThor token not found')
      }

      console.log('Token found, using:', token.substring(0, 20) + '...')

      const response = await fetch('/api/paythor/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentRequest)
      })

      const data = await response.json()
      console.log('PayThor payment response:', data)

      if (response.ok && data.status === 'success' && data.data && data.data.payment_url) {
        // Merchant reference'ı localStorage'da sakla
        localStorage.setItem('paythor_merchant_reference', merchantReference)
        
        // PayThor ödeme sayfasına yönlendir
        window.location.href = data.data.payment_url
      } else {
        throw new Error(data.message || 'Payment URL not received from PayThor')
      }
    } catch (error) {
      console.error('Payment error:', error)
      let errorMessage = 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.'
      
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      alert(`Ödeme Hatası: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Geri Dön
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PayThor Ödeme</h1>
            <p className="text-gray-600">Kart bilgilerinizi güvenle girin</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Sipariş Özeti</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Sipariş No:</span>
              <span className="font-medium">{checkoutData.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span>Ürün Sayısı:</span>
              <span>{checkoutData.items.length} adet</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Toplam:</span>
              <span>₺{(checkoutData.total / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Card Information Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Kart Bilgileri
          </h2>

          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kart Numarası *
              </label>
              <input
                type="text"
                value={cardInfo.cardNumber}
                onChange={(e) => handleCardInfoChange('cardNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {errors.cardNumber && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.cardNumber}
                </p>
              )}
            </div>

            {/* Card Holder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kart Sahibinin Adı *
              </label>
              <input
                type="text"
                value={cardInfo.cardHolderName}
                onChange={(e) => handleCardInfoChange('cardHolderName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cardHolderName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Kartın üzerindeki isim"
              />
              {errors.cardHolderName && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.cardHolderName}
                </p>
              )}
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ay *
                </label>
                <input
                  type="text"
                  value={cardInfo.expiryMonth}
                  onChange={(e) => handleCardInfoChange('expiryMonth', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="MM"
                  maxLength={2}
                />
                {errors.expiryMonth && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.expiryMonth}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yıl *
                </label>
                <input
                  type="text"
                  value={cardInfo.expiryYear}
                  onChange={(e) => handleCardInfoChange('expiryYear', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="YYYY"
                  maxLength={4}
                />
                {errors.expiryYear && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.expiryYear}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV *
                </label>
                <input
                  type="text"
                  value={cardInfo.cvv}
                  onChange={(e) => handleCardInfoChange('cvv', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cvv ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123"
                  maxLength={4}
                />
                {errors.cvv && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cvv}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Güvenli Ödeme</h3>
                <p className="text-xs text-green-600 mt-1">
                  Kart bilgileriniz SSL ile şifrelenerek güvenle iletilir
                </p>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <Check className="mr-2 h-5 w-5" />
            )}
            {loading ? 'İşleniyor...' : `₺${(checkoutData.total / 100).toFixed(2)} Öde`}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Ödeme yaparak <a href="#" className="underline">Kullanım Şartları</a>'nı kabul etmiş olursunuz
          </p>
        </div>
      </div>
    </div>
  )
}
