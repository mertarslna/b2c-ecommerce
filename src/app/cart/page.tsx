'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number // in cents
  image: string
  quantity: number
  description?: string
  category?: string
}

interface CartState {
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartState>({
    items: [],
    subtotal: 0,
    shipping: 1500, // 15 TL shipping
    tax: 0,
    total: 0
  })

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        setCart(cartData)
      } catch (error) {
        console.error('Error loading cart:', error)
        loadSampleCart()
      }
    } else {
      loadSampleCart()
    }
  }, [])

  const loadSampleCart = () => {
    const sampleItems: CartItem[] = [
      {
        id: '1',
        name: 'Premium Wireless Headphones',
        description: 'High-quality sound with noise cancellation',
        price: 29900, // 299.00 TL
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
        quantity: 1,
        category: 'Electronics'
      },
      {
        id: '2',
        name: 'Smartphone Case',
        description: 'Protective case with premium materials',
        price: 4900, // 49.00 TL
        image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=300&fit=crop',
        quantity: 2,
        category: 'Accessories'
      },
      {
        id: '3',
        name: 'Wireless Charger',
        description: 'Fast wireless charging pad',
        price: 7900, // 79.00 TL
        image: 'https://images.unsplash.com/photo-1609592308116-44c5b2a9db5e?w=300&h=300&fit=crop',
        quantity: 1,
        category: 'Electronics'
      }
    ]

    calculateTotals(sampleItems)
  }

  const calculateTotals = (items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = Math.round(subtotal * 0.18) // 18% KDV
    const shipping = items.length > 0 ? 1500 : 0
    const total = subtotal + tax + shipping

    const newCart = {
      items,
      subtotal,
      shipping,
      tax,
      total
    }

    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }

    const updatedItems = cart.items.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
    calculateTotals(updatedItems)
  }

  const removeItem = (id: string) => {
    const updatedItems = cart.items.filter(item => item.id !== id)
    calculateTotals(updatedItems)
  }

  const clearCart = () => {
    calculateTotals([])
  }

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert('Sepetiniz boş!')
      return
    }

    // Save cart data for checkout
    localStorage.setItem('checkoutCart', JSON.stringify(cart))
    router.push('/checkout')
  }

  const continueShopping = () => {
    router.push('/')
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sepetiniz Boş</h1>
            <p className="text-gray-600 mb-8">Alışverişe başlamak için ürün ekleyin</p>
            <button
              onClick={continueShopping}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Alışverişe Başla
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={continueShopping}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Alışverişe Devam Et
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="mr-3 h-8 w-8" />
              Sepetim ({cart.items.length} ürün)
            </h1>
            {cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Sepeti Temizle
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">Ürünler</h2>
                <div className="space-y-6">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                        {item.category && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-2">
                            {item.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 rounded-l-lg"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[50px] border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 rounded-r-lg"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <div className="text-base font-semibold text-gray-900">
                            ₺{((item.price * item.quantity) / 100).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ₺{(item.price / 100).toFixed(2)} / adet
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-6">Sipariş Özeti</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Ara Toplam</span>
                  <span>₺{(cart.subtotal / 100).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Kargo</span>
                  <span>₺{(cart.shipping / 100).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>KDV (%18)</span>
                  <span>₺{(cart.tax / 100).toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Toplam</span>
                    <span>₺{(cart.total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ödemeye Geç
              </button>

              <button
                onClick={continueShopping}
                className="w-full mt-3 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Alışverişe Devam Et
              </button>

              {/* Additional Info */}
              <div className="mt-6 text-xs text-gray-500 space-y-2">
                <div className="flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  <span>Ücretsiz iade (14 gün)</span>
                </div>
                <div className="flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  <span>Hızlı teslimat (1-3 gün)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
