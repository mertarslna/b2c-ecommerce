'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  quantity: number
  currency: string // ürünün para birimi (zorunlu)
  selectedSize?: string
  selectedColor?: string
  cartItemId?: string // ID of cart item in database
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  addToCart: (product: any, quantity?: number, size?: string, color?: string) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getCartCount: () => number
  getTotalItems: () => number
  getCartTotal: () => number
  isInCart: (productId: string) => boolean
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Mock customer ID - في الإنتاج، هتجيب من Authentication
  const customerId = "550e8400-e29b-41d4-a716-446655440040" // John Doe customer from seed

  // Load cart from database on component mount
  useEffect(() => {
    refreshCart()
  }, [])

  const refreshCart = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cart?customerId=${customerId}`)
      const result = await response.json()

      if (result.success) {
        // Her ürünün currency'si zorunlu, yoksa USD olarak ata (geliştirici uyarısı için log ekle)
        const itemsWithCurrency = result.data.items.map((item: any) => {
          if (!item.currency) {
            console.warn('Üründe currency eksik, USD atanıyor:', item)
          }
          return {
            ...item,
            currency: item.currency || 'USD'
          }
        })
        setItems(itemsWithCurrency)
      } else {
        console.error('Failed to load cart:', result.error)
        showNotification('❌ Failed to load cart', 'error')
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      showNotification('❌ Error loading cart', 'error')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product: any, quantity = 1, size?: string, color?: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          productId: product.id,
          quantity,
          selectedSize: size,
          selectedColor: color,
          currency: product.currency || 'USD'
        })
      })

      const result = await response.json()

      if (result.success) {
        await refreshCart() // Refresh cart to get updated data
        // No notification - clean UX like big e-commerce sites
      } else {
        showNotification(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      showNotification('❌ Failed to add item to cart', 'error')
    }
  }

  const removeFromCart = async (cartItemId: string) => {
    try {
      const response = await fetch(`/api/cart/items/${cartItemId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        // Remove only the specific item, don't refresh entire cart
        setItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId))
        // No notification - clean UX
      } else {
        showNotification(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      showNotification('❌ Failed to remove item', 'error')
    }
  }

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId)
      return
    }

    try {
      const response = await fetch(`/api/cart/items/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity })
      })

      const result = await response.json()

      if (result.success) {
        // Update only the specific item, don't refresh entire cart
        setItems(prevItems =>
          prevItems.map(item =>
            item.cartItemId === cartItemId 
              ? { ...item, quantity }
              : item
          )
        )
      } else {
        showNotification(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      showNotification('❌ Failed to update quantity', 'error')
    }
  }

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId })
      })

      const result = await response.json()

      if (result.success) {
        setItems([])
        showNotification('🧹 Cart cleared', 'success')
      } else {
        showNotification(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error clearing cart:', error)
      showNotification('❌ Failed to clear cart', 'error')
    }
  }

  const getCartCount = () => {
    return items.length
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const isInCart = (productId: string) => {
    return items.some(item => item.id === productId)
  }

  // Enhanced notification function
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    const notification = document.createElement('div')
    notification.textContent = message
    
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300`
    
    document.body.appendChild(notification)
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 100)
    
    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  const value: CartContextType = {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getTotalItems,
    getCartTotal,
    isInCart,
    refreshCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}