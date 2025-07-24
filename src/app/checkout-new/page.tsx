'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, CreditCard, Truck, Shield, Check } from 'lucide-react'

// Mock data - In real app, this would come from cart/context
const mockOrderData = {
  items: [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      description: 'High-quality sound with noise cancellation',
      price: 29900, // 299.00 TRY in cents
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop'
    },
    {
      id: '2', 
      name: 'Smartphone Case',
      description: 'Protective case with premium materials',
      price: 4900, // 49.00 TRY in cents
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=80&h=80&fit=crop'
    }
  ],
  shipping: 1500, // 15.00 TRY
  tax: 5200, // 52.00 TRY
}

interface OrderSummaryProps {
  items: typeof mockOrderData.items
  shipping: number
  tax: number
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items, shipping, tax }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal + shipping + tax

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <ShoppingCart className="mr-2 h-5 w-5" />
        Sipariş Özeti
      </h2>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
              <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
            </div>
            <div className="text-sm font-medium text-gray-900">
              ₺{((item.price * item.quantity) / 100).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Ara Toplam</span>
          <span>₺{(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Kargo</span>
          <span>₺{(shipping / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>KDV</span>
          <span>₺{(tax / 100).toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between text-base font-semibold">
            <span>Toplam</span>
            <span>₺{(total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  })
  
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'TR'
  })

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paythor'>('stripe')

  const handleInputChange = (section: 'customer' | 'shipping', field: string, value: string) => {
    if (section === 'customer') {
      setCustomerInfo(prev => ({ ...prev, [field]: value }))
    } else {
      setShippingAddress(prev => ({ ...prev, [field]: value }))
    }
  }

  const validateForm = () => {
    const requiredCustomerFields = ['email', 'firstName', 'lastName']
    const requiredShippingFields = ['address', 'city', 'postalCode']
    
    const customerValid = requiredCustomerFields.every(field => 
      customerInfo[field as keyof typeof customerInfo].trim() !== ''
    )
    
    const shippingValid = requiredShippingFields.every(field => 
      shippingAddress[field as keyof typeof shippingAddress].trim() !== ''
    )
    
    return customerValid && shippingValid
  }

  const handleCheckout = async () => {
    if (!validateForm()) {
      alert('Lütfen tüm gerekli alanları doldurun')
      return
    }

    setLoading(true)

    try {
      if (paymentMethod === 'stripe') {
        await handleStripeCheckout()
      } else {
        await handlePaythorCheckout()
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Ödeme işlemi başlatılırken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleStripeCheckout = async () => {
    try {
      // Store order data in localStorage for the card page
      const orderData = {
        orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customerInfo,
        shippingAddress,
        items: mockOrderData.items,
        shipping: mockOrderData.shipping,
        tax: mockOrderData.tax,
        total: mockOrderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + mockOrderData.shipping + mockOrderData.tax
      }
      
      localStorage.setItem('checkoutData', JSON.stringify(orderData))
      
      // Redirect to card input page
      router.push('/checkout-card')
    } catch (error) {
      console.error('Stripe checkout error:', error)
      if (error instanceof Error) {
        alert(`Ödeme işlemi başarısız: ${error.message}`)
      } else {
        alert('Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.')
      }
      throw error
    }
  }

  const handlePaythorCheckout = async () => {
    // Navigate to PayThor payment page with order data
    const orderData = {
      items: mockOrderData.items,
      shipping: mockOrderData.shipping,
      tax: mockOrderData.tax,
      customer: customerInfo,
      shippingAddress
    }
    
    const queryParams = new URLSearchParams({
      orderData: JSON.stringify(orderData)
    })
    
    router.push(`/payment/paythor?${queryParams}`)
  }

  const subtotal = mockOrderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal + mockOrderData.shipping + mockOrderData.tax

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ödeme</h1>
          <p className="text-gray-600">Siparişinizi tamamlamak için bilgilerinizi girin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Müşteri Bilgileri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.firstName}
                    onChange={(e) => handleInputChange('customer', 'firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.lastName}
                    onChange={(e) => handleInputChange('customer', 'lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Soyadınız"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('customer', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ornek@email.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('customer', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+90 5xx xxx xx xx"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Teslimat Adresi
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres *
                  </label>
                  <textarea
                    value={shippingAddress.address}
                    onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tam adresinizi yazın"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Şehir *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="İstanbul"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posta Kodu *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleInputChange('shipping', 'postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="34000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Ödeme Yöntemi
              </h2>
              <div className="space-y-3">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'stripe'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('stripe')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 ${
                        paymentMethod === 'stripe' ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'stripe' && (
                          <div className="w-full h-full bg-blue-500 rounded-full scale-50"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Stripe (Kredi/Banka Kartı)</h3>
                        <p className="text-sm text-gray-500">Güvenli uluslararası ödeme</p>
                      </div>
                    </div>
                    <Shield className="h-5 w-5 text-green-500" />
                  </div>
                </div>

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'paythor'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('paythor')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 ${
                        paymentMethod === 'paythor' ? 'border-blue-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'paythor' && (
                          <div className="w-full h-full bg-blue-500 rounded-full scale-50"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">PayThor (Türk Bankacılık)</h3>
                        <p className="text-sm text-gray-500">Yerli ödeme çözümü</p>
                      </div>
                    </div>
                    <Shield className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Check className="mr-2 h-5 w-5" />
                  )}
                  {loading ? 'Yönlendiriliyor...' : 'Devam Et'}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Siparişinizi tamamlayarak <a href="#" className="underline">Gizlilik Politikası</a> ve <a href="#" className="underline">Kullanım Şartları</a>'nı kabul etmiş olursunuz.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <OrderSummary 
              items={mockOrderData.items}
              shipping={mockOrderData.shipping}
              tax={mockOrderData.tax}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
