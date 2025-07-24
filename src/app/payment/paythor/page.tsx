'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentPayThorRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get order data from URL parameters
    const orderDataParam = searchParams.get('orderData')
    
    if (orderDataParam) {
      try {
        // Decode and parse the order data
        const orderData = JSON.parse(decodeURIComponent(orderDataParam))
        
        // Save to localStorage for PayThor checkout page
        localStorage.setItem('paymentData', JSON.stringify({
          amount: calculateTotal(orderData),
          currency: 'TRY',
          orderId: `order-${Date.now()}`,
          customerEmail: orderData.customer?.email || '',
          customerName: `${orderData.customer?.firstName || ''} ${orderData.customer?.lastName || ''}`.trim(),
          customerPhone: orderData.customer?.phone || '',
          description: `Sipariş - ${orderData.items?.length || 0} ürün`,
          items: orderData.items?.map((item: any) => ({
            name: item.name,
            price: Math.round(item.price * item.quantity),
            quantity: item.quantity
          })) || []
        }))
        
        // Redirect to PayThor checkout page
        router.push('/checkout/paythor')
      } catch (error) {
        console.error('Error parsing order data:', error)
        router.push('/checkout')
      }
    } else {
      // No order data, redirect to main checkout
      router.push('/checkout')
    }
  }, [searchParams, router])

  // Calculate total from order data
  function calculateTotal(orderData: any): number {
    const itemsTotal = orderData.items?.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0) || 0
    const shipping = orderData.shipping || 0
    const tax = orderData.tax || 0
    
    return (itemsTotal + shipping + tax) / 100 // Convert from kuruş to TL
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">PayThor ödeme sayfasına yönlendiriliyor...</p>
      </div>
    </div>
  )
}
