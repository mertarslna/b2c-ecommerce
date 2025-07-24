// src/contexts/WishlistContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useCart } from './CartContext'

export interface WishlistItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  reviews: number
  addedAt: string
}

interface WishlistContextType {
  items: WishlistItem[]
  addToWishlist: (product: any) => void
  removeFromWishlist: (productId: number) => void
  isInWishlist: (productId: number) => boolean
  clearWishlist: () => void
  moveToCart: (productId: number) => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([])

  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist))
      } catch (error) {
        console.error('Error loading wishlist from localStorage:', error)
        localStorage.removeItem('wishlist')
      }
    }
  }, [])

  // Save wishlist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items))
  }, [items])

  const addToWishlist = (product: any) => {
    const wishlistItem: WishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
      addedAt: new Date().toISOString()
    }

    setItems(prevItems => {
      // Check if item already exists
      const existingItem = prevItems.find(item => item.id === product.id)
      if (existingItem) {
        // Show notification that item is already in wishlist
        showNotification(`💖 "${product.name}" is already in your wishlist!`, 'info')
        return prevItems
      }

      // Add new item
      showNotification(`💖 "${product.name}" added to wishlist!`, 'success')
      return [...prevItems, wishlistItem]
    })
  }

  const removeFromWishlist = (productId: number) => {
    setItems(prevItems => {
      const removedItem = prevItems.find(item => item.id === productId)
      if (removedItem) {
        showNotification(`💔 "${removedItem.name}" removed from wishlist`, 'info')
      }
      return prevItems.filter(item => item.id !== productId)
    })
  }

  const isInWishlist = (productId: number): boolean => {
    return items.some(item => item.id === productId)
  }

  const clearWishlist = () => {
    setItems([])
    showNotification('🗑️ Wishlist cleared', 'info')
  }

  const moveToCart = (productId: number) => {
    const item = items.find(item => item.id === productId)
    if (item) {
      // Import cart functionality (we'll need to access CartContext)
      // For now, just remove from wishlist and show notification
      removeFromWishlist(productId)
      showNotification(`🛒 "${item.name}" moved to cart!`, 'success')
      
      // This will be implemented properly when we integrate with CartContext
      console.log('Move to cart:', item)
    }
  }

  // Simple notification function
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    }

    const notification = document.createElement('div')
    notification.textContent = message
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300`
    
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

  const value: WishlistContextType = {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    moveToCart
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}