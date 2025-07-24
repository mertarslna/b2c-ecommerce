'use client'

import React from 'react'

export default function DebugStripePage() {
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Stripe Debug Bilgileri</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg space-y-4">
        <div>
          <strong>Environment Variables:</strong>
        </div>
        
        <div>
          <label className="font-semibold">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:</label>
          <div className="mt-1 p-2 bg-white rounded border">
            {stripePublishableKey || 'Tanımlanmamış'}
          </div>
        </div>
        
        <div>
          <label className="font-semibold">Key Kontrolü:</label>
          <div className="mt-1 p-2 bg-white rounded border">
            {stripePublishableKey && !stripePublishableKey.includes('your_') 
              ? '✅ Gerçek anahtar mevcut' 
              : '❌ Placeholder anahtar veya anahtar yok'}
          </div>
        </div>

        <div>
          <label className="font-semibold">Stripe Promise Durumu:</label>
          <div className="mt-1 p-2 bg-white rounded border">
            {stripePublishableKey && !stripePublishableKey.includes('your_') 
              ? '✅ Stripe yüklenecek' 
              : '❌ Stripe yüklenmeyecek'}
          </div>
        </div>
      </div>
    </div>
  )
}
