'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, CreditCard, Lock, ArrowLeft } from 'lucide-react'

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
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [paytrToken, setPaytrToken] = useState<string | null>(null)

  useEffect(() => {
    // Sepet verilerini localStorage'dan al
    const storedOrderData = localStorage.getItem('checkoutData')
    if (storedOrderData) {
      setOrderData(JSON.parse(storedOrderData))
    } else {
      // Eğer veri yoksa sepete yönlendir
      router.push('/cart')
    }
  }, [router])

  const handlePayment = async () => {
    if (!orderData) return

    setLoading(true)

    try {
      const response = await fetch('/api/paytr/create-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.orderId,
          email: orderData.customerInfo.email,
          amount: orderData.total,
          userName: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
          userAddress: `${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.postalCode}`,
          userPhone: orderData.customerInfo.phone,
          items: orderData.items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        })
      })

      const result = await response.json()

      if (result.success && result.data.token) {
        setPaytrToken(result.data.token)
        // PayTR iframe'ini göster
      } else {
        console.error('PayTR token error:', result.error)
        alert('Ödeme işlemi başlatılamadı: ' + (result.error?.message || 'Bilinmeyen hata'))
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Ödeme işlemi sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Sipariş bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  const { customerInfo, shippingAddress, items, shipping, tax, total } = orderData

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-blue-600" />
            PayTR ile Ödeme
          </h1>
          <p className="text-gray-600 mt-2">
            Güvenli ödeme için PayTR kullanıyoruz
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-green-600" />
              Güvenli Ödeme
            </h2>

            {paytrToken ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm mb-3">
                    PayTR güvenli ödeme ekranı aşağıda yüklendi. Kart bilgilerinizi girerek ödemenizi tamamlayabilirsiniz.
                  </p>
                </div>
                
                <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                  <iframe
                    src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="PayTR Güvenli Ödeme"
                    style={{ border: 'none' }}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Test Modu:</strong> Bu test modudur. Gerçek bir ödeme yapılmayacaktır.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">PayTR ile ödeme avantajları:</h3>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• 3D Secure güvenlik teknolojisi</li>
                    <li>• Tüm büyük bankalarla entegrasyon</li>
                    <li>• Anlık ödeme onayı</li>
                    <li>• Taksit seçenekleri</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Müşteri Bilgileri</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                      <p><strong>Ad Soyad:</strong> {customerInfo.firstName} {customerInfo.lastName}</p>
                      <p><strong>E-posta:</strong> {customerInfo.email}</p>
                      <p><strong>Telefon:</strong> {customerInfo.phone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Teslimat Adresi</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm">
                      <p>{shippingAddress.address}</p>
                      <p>{shippingAddress.city} {shippingAddress.postalCode}</p>
                      <p>{shippingAddress.country}</p>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        PayTR Yükleniyor...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        PayTR ile Öde - {(total / 100).toFixed(2)} TL
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Sipariş Özeti
            </h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b pb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                  </div>
                  <div className="text-lg font-semibold">
                    {((item.price * item.quantity) / 100).toFixed(2)} TL
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ara Toplam:</span>
                <span>{((total - shipping - tax) / 100).toFixed(2)} TL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Kargo:</span>
                <span>{(shipping / 100).toFixed(2)} TL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Vergi:</span>
                <span>{(tax / 100).toFixed(2)} TL</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Toplam:</span>
                <span>{(total / 100).toFixed(2)} TL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutWithPayTRPage() {
  // Check if PayTR is enabled
  const paytrEnabled = process.env.NEXT_PUBLIC_PAYTR_ENABLED === 'true'
  
  if (!paytrEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-red-500 mb-4">
            <CreditCard className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            PayTR Ödeme Sistemi Devre Dışı
          </h2>
          <p className="text-gray-600 mb-6">
            PayTR ödeme sistemi şu anda devre dışıdır. Lütfen başka bir ödeme yöntemi seçin.
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

  return <CheckoutForm />
}
