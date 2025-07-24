// src/contexts/UserContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'user' | 'admin'
  createdAt: string
}

interface UserContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
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
      // Mock authentication - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (email === 'test@example.com' && password === 'password123') {
        const mockUser: User = {
          id: '1',
          name: 'John Doe',
          email: email,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          role: 'user',
          createdAt: new Date().toISOString()
        }
        setUser(mockUser)
        
        // Show success notification
        showNotification('🎉 Welcome back! Login successful', 'success')
        return true
      } else {
        showNotification('❌ Invalid email or password', 'error')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      showNotification('❌ Login failed. Please try again.', 'error')
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Mock registration - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const mockUser: User = {
        id: Date.now().toString(),
        name: name,
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff6b9d&color=fff&size=150`,
        role: 'user',
        createdAt: new Date().toISOString()
      }
      
      // Don't auto-login after registration
      showNotification('🎉 Account created successfully! Please login.', 'success')
      return true
    } catch (error) {
      console.error('Registration error:', error)
      showNotification('❌ Registration failed. Please try again.', 'error')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    showNotification('👋 Logged out successfully', 'info')
  }

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false

      // Mock profile update - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      
      showNotification('✅ Profile updated successfully', 'success')
      return true
    } catch (error) {
      console.error('Profile update error:', error)
      showNotification('❌ Failed to update profile', 'error')
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