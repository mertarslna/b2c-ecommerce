'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Lock, ArrowLeft, Check, AlertCircle } from 'lucide-react'

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

  const initializePayThorSession = async (data: CheckoutData) => {
    try {
      console.log('PayThor token kontrol ediliyor...')
      
      // PayThor token'ını kontrol et
      const token = localStorage.getItem('paythor_token')
      if (!token) {
        console.error('PayThor token bulunamadı')
        alert('PayThor oturumu bulunamadı. Lütfen giriş yapın.')
        router.push('/paythor-login')
        return
      }

      console.log('PayThor token mevcut, ödeme sistemi hazır.')
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
      const token = localStorage.getItem('paythor_token')
      
      if (!token) {
        alert('PayThor oturumu bulunamadı. Lütfen giriş yapın.')
        router.push('/paythor-login')
        return
      }

      console.log('PayThor ödeme işlemi başlatılıyor...')
      console.log('Token:', token.substring(0, 20) + '...') // Token'ın ilk 20 karakteri

      // PayThor ödeme isteği (basitleştirilmiş format)
      const merchantReference = `ORDER-${checkoutData.orderId}-${Date.now()}`
      
      const paymentRequest = {
        amount: (checkoutData.total / 100).toFixed(2),
        currency: "TRY",
        buyer_fee: "0",
        method: "creditcard",
        merchant_reference: merchantReference,
        return_url: `${window.location.origin}/payment-success`,
        cancel_url: `${window.location.origin}/payment-cancel`,
        callback_url: `${window.location.origin}/api/payment/callback`,
        
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

      const response = await fetch('https://dev-api.paythor.com/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-API-Key': token, // Alternative header
          'Api-Key': token,   // Another alternative
        },
        body: JSON.stringify(paymentRequest)
      })

      const result = await response.json()
      console.log('PayThor payment response:', result)

      if (!response.ok) {
        console.error('PayThor Payment API Error:', response.status, response.statusText, result)
        console.error('Payment request was:', paymentRequest)
        throw new Error(`PayThor Payment API Error: ${response.status} - ${result.message || result.error || 'Unknown error'}`)
      }

      if ((response.status === 200 || response.status === 201) && result.data) {
        // PayThor'dan gelen payment URL'ini bul
        const paymentUrl = result.data.payment_url || result.data.url || result.payment_url
        
        if (paymentUrl) {
          // Merchant reference'ı localStorage'da sakla
          localStorage.setItem('paythor_merchant_reference', merchantReference)
          
          // PayThor ödeme sayfasına yönlendir
          window.location.href = paymentUrl
        } else {
          throw new Error('Payment URL not received from PayThor')
        }
      } else {
        // Ödeme başarısız
        let errorMessage = "Ödeme işlemi başarısız oldu."
        if (result.message) {
          errorMessage = result.message
        } else if (result.error) {
          errorMessage = result.error
        } else if (result.details) {
          if (Array.isArray(result.details)) {
            errorMessage = result.details.join(", ")
          } else {
            errorMessage = result.details
          }
        }
        
        alert(`Ödeme Hatası: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.')
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
