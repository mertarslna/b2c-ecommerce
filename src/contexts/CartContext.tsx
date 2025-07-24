// src/contexts/CartContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: any, quantity?: number, size?: string, color?: string) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getCartCount: () => number // عدد المنتجات المختلفة
  getTotalItems: () => number // إجمالي القطع
  getCartTotal: () => number
  isInCart: (productId: number) => boolean
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

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: any, quantity = 1, size?: string, color?: string) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
      )

      if (existingItem) {
        // Update quantity if item exists
        return prevItems.map(item =>
          item.id === product.id && 
          item.selectedSize === size && 
          item.selectedColor === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.category,
          quantity,
          selectedSize: size,
          selectedColor: color
        }
        return [...prevItems, newItem]
      }
    })

    // Show success notification
    showNotification(`✅ "${product.name}" added to cart!`)
  }

  const removeFromCart = (productId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId))
    showNotification('🗑️ Item removed from cart')
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    showNotification('🧹 Cart cleared')
  }

  const getCartCount = () => {
    return items.length // عدد المنتجات المختلفة (Unique Products)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0) // إجمالي القطع
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const isInCart = (productId: number) => {
    return items.some(item => item.id === productId)
  }

  // Simple notification function
  const showNotification = (message: string) => {
    // Create notification element
    const notification = document.createElement('div')
    notification.textContent = message
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300'
    
    document.body.appendChild(notification)
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 100)
    
    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount, // عدد المنتجات المختلفة
    getTotalItems, // إجمالي القطع
    getCartTotal,
    isInCart
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}