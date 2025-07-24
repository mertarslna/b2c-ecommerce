'use client'

import { useState } from 'react'
import { StripePaymentForm } from './StripePaymentForm'
import { PayThorPaymentForm } from './PayThorPaymentForm'

type PaymentMethod = 'STRIPE' | 'PAYTHOR' | 'CREDIT_CARD'

interface PaymentSelectorProps {
  amount: number
  currency?: string
  orderId: string
  customerId: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
}

export const PaymentSelector = ({ 
  amount, 
  currency = 'TRY', 
  orderId, 
  customerId, 
  onSuccess, 
  onError 
}: PaymentSelectorProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('STRIPE')

  const paymentMethods = [
    {
      id: 'STRIPE' as PaymentMethod,
      name: 'Kredi Kartı (Stripe)',
      description: 'Visa, MasterCard, Amex ile güvenli ödeme',
      icon: '💳'
    },
    {
      id: 'PAYTHOR' as PaymentMethod,
      name: 'PayThor',
      description: 'Türkiye\'nin güvenli ödeme sistemi',
      icon: '🇹🇷'
    }
  ]

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'STRIPE':
        return (
          <StripePaymentForm
            amount={amount}
            currency={currency}
            orderId={orderId}
            customerId={customerId}
            onSuccess={onSuccess}
            onError={onError}
          />
        )
      case 'PAYTHOR':
        return (
          <PayThorPaymentForm
            amount={amount}
            currency={currency}
            orderId={orderId}
            customerId={customerId}
            onSuccess={onSuccess}
            onError={onError}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Payment Method Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Ödeme Yöntemi Seçin</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sipariş No:</span>
          <span className="font-medium">{orderId}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600">Toplam Tutar:</span>
          <span className="text-lg font-semibold">{amount} {currency}</span>
        </div>
      </div>

      {/* Selected Payment Form */}
      {renderPaymentForm()}
    </div>
  )
}
