// src/contexts/WishlistContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface WishlistItem {
  id: string // UUID string
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
  loading: boolean
  addToWishlist: (product: any) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  toggleWishlist: (product: any) => Promise<void> // ✅ New optimistic toggle method
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => Promise<void>
  moveToCart: (productId: string) => Promise<void>
  refreshWishlist: () => Promise<void>
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
  const [loading, setLoading] = useState(true)
  
  // Mock customer ID - في الإنتاج، هتجيب من Authentication
  const customerId = "550e8400-e29b-41d4-a716-446655440040"

  // Load wishlist from database on component mount
  useEffect(() => {
    refreshWishlist()
  }, [])

  const refreshWishlist = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/wishlist?customerId=${customerId}`)
      const result = await response.json()

      if (result.success) {
        setItems(result.data.items || [])
      } else {
        console.error('Failed to load wishlist:', result.error)
        showNotification('❌ Failed to load wishlist', 'error')
      }
    } catch (error) {
      console.error('Error loading wishlist:', error)
      showNotification('❌ Error loading wishlist', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ✅ OPTIMISTIC TOGGLE - This is the main method ProductCard should use
  const toggleWishlist = async (product: any) => {
    const productId = product.id.toString() // Ensure string
    const isCurrentlyInWishlist = items.some(item => item.id === productId)
    
    if (isCurrentlyInWishlist) {
      // OPTIMISTIC REMOVE
      const itemToRemove = items.find(item => item.id === productId)
      
      // 1. Update UI immediately (Optimistic)
      setItems(prevItems => prevItems.filter(item => item.id !== productId))
      
      // 2. Call API in background
      try {
        const response = await fetch(`/api/wishlist/items/${productId}?customerId=${customerId}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        
        if (result.success) {
          // Success - UI already updated
          if (itemToRemove) {
            showNotification(`💔 "${itemToRemove.name}" removed from wishlist`, 'info')
          }
        } else {
          // Failure - Revert UI
          if (itemToRemove) {
            setItems(prevItems => [...prevItems, itemToRemove])
          }
          showNotification(`❌ ${result.error}`, 'error')
        }
      } catch (error) {
        // Network error - Revert UI
        if (itemToRemove) {
          setItems(prevItems => [...prevItems, itemToRemove])
        }
        console.error('Error removing from wishlist:', error)
        showNotification('❌ Failed to remove from wishlist', 'error')
      }
    } else {
      // OPTIMISTIC ADD
      const wishlistItem: WishlistItem = {
        id: productId,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: typeof product.category === 'string' ? product.category : product.category?.name || 'Unknown',
        rating: product.rating || 0,
        reviews: product.reviews || Math.floor(Math.random() * 100) + 10,
        addedAt: new Date().toISOString()
      }
      
      // 1. Update UI immediately (Optimistic)
      setItems(prevItems => [...prevItems, wishlistItem])
      
      // 2. Call API in background
      try {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId,
            productId: productId
          })
        })

        const result = await response.json()

        if (result.success) {
          // Success - UI already updated
          showNotification(`💖 "${product.name}" added to wishlist!`, 'success')
        } else {
          // Failure - Revert UI
          setItems(prevItems => prevItems.filter(item => item.id !== productId))
          
          if (result.error === 'Product already in wishlist') {
            // Special case: Item was already in DB, so keep it in UI
            setItems(prevItems => [...prevItems, wishlistItem])
            showNotification(`💖 "${product.name}" is already in your wishlist!`, 'info')
          } else {
            showNotification(`❌ ${result.error}`, 'error')
          }
        }
      } catch (error) {
        // Network error - Revert UI
        setItems(prevItems => prevItems.filter(item => item.id !== productId))
        console.error('Error adding to wishlist:', error)
        showNotification('❌ Failed to add to wishlist', 'error')
      }
    }
  }

  // Legacy methods for backward compatibility
  const addToWishlist = async (product: any) => {
    const productId = product.id.toString()
    if (items.some(item => item.id === productId)) {
      showNotification(`💖 "${product.name}" is already in your wishlist!`, 'info')
      return
    }
    await toggleWishlist(product)
  }

  const removeFromWishlist = async (productId: string) => {
    const product = items.find(item => item.id === productId.toString())
    if (product) {
      await toggleWishlist(product)
    }
  }

  const isInWishlist = useCallback((productId: string): boolean => {
    return items.some(item => item.id === productId.toString())
  }, [items])

  const clearWishlist = async () => {
    // Store original items for potential revert
    const originalItems = [...items]
    
    // Optimistic update
    setItems([])
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId })
      })

      const result = await response.json()

      if (result.success) {
        showNotification('🗑️ Wishlist cleared', 'info')
      } else {
        // Revert on failure
        setItems(originalItems)
        showNotification(`❌ ${result.error}`, 'error')
      }
    } catch (error) {
      // Revert on error
      setItems(originalItems)
      console.error('Error clearing wishlist:', error)
      showNotification('❌ Failed to clear wishlist', 'error')
    }
  }

  const moveToCart = async (productId: string) => {
    const item = items.find(item => item.id === productId.toString())
    if (item) {
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId,
            productId: productId,
            quantity: 1
          })
        })

        const result = await response.json()

        if (result.success) {
          // Remove from wishlist after successful cart addition
          await removeFromWishlist(productId)
          showNotification(`🛒 "${item.name}" moved to cart!`, 'success')
        } else {
          showNotification(`❌ ${result.error}`, 'error')
        }
      } catch (error) {
        console.error('Error moving to cart:', error)
        showNotification('❌ Failed to move to cart', 'error')
      }
    }
  }

  // Enhanced notification function
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
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist, // ✅ Main method for ProductCard
    isInWishlist,
    clearWishlist,
    moveToCart,
    refreshWishlist
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}