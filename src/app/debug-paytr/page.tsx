'use client'

import React from 'react'

export default function DebugPayTRPage() {
  const paytrMerchantId = process.env.PAYTR_MERCHANT_ID
  const paytrEnabled = process.env.NEXT_PUBLIC_PAYTR_ENABLED
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">PayTR Debug Bilgileri</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg space-y-4">
        <div>
          <strong>Environment Variables:</strong>
        </div>
        
        <div>
          <label className="font-semibold">NEXT_PUBLIC_PAYTR_ENABLED:</label>
          <div className="mt-1 p-2 bg-white rounded border">
            {paytrEnabled || 'Tanımlanmamış'}
          </div>
        </div>
        
        <div>
          <label className="font-semibold">PAYTR_MERCHANT_ID (Server Only):</label>
          <div className="mt-1 p-2 bg-white rounded border">
            {paytrMerchantId ? 'Tanımlı (güvenlik nedeniyle gizli)' : 'Tanımlanmamış'}
          </div>
        </div>

        <div>
          <label className="font-semibold">PayTR Durumu:</label>
          <div className="mt-1 p-2 bg-white rounded border">
            {paytrEnabled === 'true' 
              ? '✅ PayTR etkin' 
              : '❌ PayTR etkin değil'}
          </div>
        </div>

        <div>
          <label className="font-semibold">Konfigürasyon Kontrolü:</label>
          <div className="mt-1 p-2 bg-white rounded border">
            {paytrEnabled === 'true' && paytrMerchantId && !paytrMerchantId.includes('your_')
              ? '✅ PayTR yapılandırılmış görünüyor' 
              : '❌ PayTR yapılandırması eksik veya placeholder değerler mevcut'}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="font-semibold text-blue-800 mb-2">PayTR Test Bilgileri:</h2>
        <div className="text-blue-700 text-sm space-y-1">
          <p><strong>Test Modu:</strong> Evet (Gerçek ödeme yapılmaz)</p>
          <p><strong>Test Kartı:</strong> Herhangi bir kart numarası (16 haneli)</p>
          <p><strong>CVV:</strong> Herhangi 3 haneli sayı</p>
          <p><strong>Son Kullanma:</strong> Gelecekteki herhangi bir tarih</p>
        </div>
      </div>
    </div>
  )
}
