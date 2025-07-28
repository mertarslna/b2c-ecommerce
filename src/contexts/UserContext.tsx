// src/contexts/UserContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: 'ADMIN' | 'CUSTOMER' | 'SELLER'
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UserContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (first_name: string, last_name: string, email: string, password: string, phone?: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  updateProfile: (userData: Partial<User>) => Promise<boolean>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error loading user from localStorage:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        showNotification('🎉 Welcome! Login successful!', 'success')
        return true
      } else {
        showNotification(data.error || '❌ Login failed', 'error')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      showNotification('❌ Login failed. Please try again.', 'error')
      return false
    }
  }

  const register = async (first_name: string, last_name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ first_name, last_name, email, password, phone }),
      })

      const data = await response.json()

      if (response.ok) {
        showNotification('🎉 Account created successfully! Please log in.', 'success')
        return true
      } else {
        showNotification(data.error || '❌ Registration failed', 'error')
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      showNotification('❌ Registration failed. Please try again.', 'error')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    showNotification('👋 Successfully logged out', 'info')
  }

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        showNotification('✅ Profile updated successfully', 'success')
        return true
      } else {
        showNotification(data.error || '❌ Profile could not be updated', 'error')
        return false
      }
    } catch (error) {
      console.error('Profile update error:', error)
      showNotification('❌ Profile could not be updated', 'error')
      return false
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
    }, 4000)
  }

  const value: UserContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
    updateProfile
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}