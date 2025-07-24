// src/app/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    if (!email) {
      setError('Email address is required.')
      setIsLoading(false)
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email address format.')
      setIsLoading(false)
      return
    }

    try {
      // Mock password reset for demonstration
      await new Promise(resolve => setTimeout(resolve, 2000))

      setSuccess('Password reset email sent! Check your inbox.')
      
      // Create success notification
      const notification = document.createElement('div')
      notification.textContent = '📧 Password reset email sent!'
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300'
      
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.style.transform = 'translateX(0)'
      }, 100)
      
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)'
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 300)
      }, 5000)

    } catch (err) {
      console.error("Password reset error:", err)
      setError('An unexpected error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-pink-100 transform hover:scale-[1.005] transition-transform duration-300">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent leading-tight">
              Forgot Password?
            </h1>
            <p className="text-gray-600 text-lg">
              Don't worry! Enter your email and we'll send you a reset link.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-center animate-fadeIn">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-xl mb-6 text-center animate-fadeIn">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 text-lg font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-4 border-2 border-pink-200 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none text-gray-800 text-lg transition-all duration-300 shadow-sm hover:shadow-md"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-red-400 text-white py-4 rounded-xl font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-95 flex items-center justify-center hover:from-pink-600 hover:to-red-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Send Reset Email'
              )}
            </button>
          </form>

          <div className="text-center space-y-4 mt-8">
            <p className="text-gray-600">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-pink-600 font-semibold hover:text-pink-700 hover:underline transition-colors duration-200">
                Back to Login
              </Link>
            </p>
            <p className="text-gray-500">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-pink-600 hover:text-pink-700 hover:underline transition-colors duration-200">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}