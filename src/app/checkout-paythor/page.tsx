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
    setCardInfo(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  // Form submit işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Basit validasyon
    const newErrors: Partial<CardInfo> = {};
    if (!cardInfo.cardNumber || cardInfo.cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Kart numarası geçersiz';
    if (!cardInfo.expiryMonth || !cardInfo.expiryYear) newErrors.expiryMonth = 'Son kullanma tarihi eksik';
    if (!cardInfo.cvv || cardInfo.cvv.length < 3) newErrors.cvv = 'CVV geçersiz';
    if (!cardInfo.cardHolderName) newErrors.cardHolderName = 'Kart üzerindeki isim gerekli';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // API'nin beklediği şekilde request objesini oluştur
      const paymentRequest: PayThorCreatePaymentRequest = {
        amount: checkoutData!.total.toFixed(2),
        currency: 'TRY',
        buyer_fee: '0',
        method: 'creditcard',
        merchant_reference: checkoutData!.orderId,
        return_url: window.location.origin + '/payment-success',
        cancel_url: window.location.origin + '/payment-cancel',
        callback_url: window.location.origin + '/api/paythor/callback',
        first_name: checkoutData!.customerInfo.firstName,
        last_name: checkoutData!.customerInfo.lastName,
        email: checkoutData!.customerInfo.email,
        phone: checkoutData!.customerInfo.phone,
        address_line_1: checkoutData!.shippingAddress.address,
        city: checkoutData!.shippingAddress.city,
        postal_code: checkoutData!.shippingAddress.postalCode,
        country: checkoutData!.shippingAddress.country,
        order_id: checkoutData!.orderId,
        description: checkoutData!.items.map(i => i.name).join(', '),
      };

      // Kart bilgilerini header/body ile göndermek gerekiyorsa burada ekleyin (API dokümantasyonuna göre)
      // Şu an sadece request objesi gönderiliyor.

      const response = await payThorAPI.createPayment(paymentRequest);
      if (response.status === 'success') {
        router.push('/payment-success');
      } else {
        alert('Ödeme başarısız: ' + (response.message || 'Bilinmeyen hata'));
      }
    } catch (err) {
      alert('Ödeme sırasında hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!checkoutData) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">PayThor ile Güvenli Ödeme</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-medium">Kart Numarası</label>
          <input
            type="text"
            value={formatCardNumber(cardInfo.cardNumber)}
            onChange={e => handleCardInfoChange('cardNumber', e.target.value)}
            className="input"
            maxLength={19}
            placeholder="0000 0000 0000 0000"
          />
          {errors.cardNumber && <span className="text-red-500 text-sm">{errors.cardNumber}</span>}
        </div>
        <div className="flex gap-2">
          <div>
            <label className="block font-medium">Ay</label>
            <input
              type="text"
              value={cardInfo.expiryMonth}
              onChange={e => handleCardInfoChange('expiryMonth', e.target.value)}
              className="input"
              maxLength={2}
              placeholder="AA"
            />
          </div>
          <div>
            <label className="block font-medium">Yıl</label>
            <input
              type="text"
              value={cardInfo.expiryYear}
              onChange={e => handleCardInfoChange('expiryYear', e.target.value)}
              className="input"
              maxLength={2}
              placeholder="YY"
            />
          </div>
          <div>
            <label className="block font-medium">CVV</label>
            <input
              type="text"
              value={cardInfo.cvv}
              onChange={e => handleCardInfoChange('cvv', e.target.value)}
              className="input"
              maxLength={4}
              placeholder="CVV"
            />
            {errors.cvv && <span className="text-red-500 text-sm">{errors.cvv}</span>}
          </div>
        </div>
        <div>
          <label className="block font-medium">Kart Üzerindeki İsim</label>
          <input
            type="text"
            value={cardInfo.cardHolderName}
            onChange={e => handleCardInfoChange('cardHolderName', e.target.value)}
            className="input"
            placeholder="Ad Soyad"
          />
          {errors.cardHolderName && <span className="text-red-500 text-sm">{errors.cardHolderName}</span>}
        </div>
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Ödeme Yapılıyor...' : 'Ödemeyi Tamamla'}
        </button>
      </form>
    </div>
  );
}
