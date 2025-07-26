// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useUser()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email ve şifre zorunludur.')
      return
    }

    const success = await login(email, password)
    if (success) {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-pink-100 transform hover:scale-[1.005] transition-transform duration-300">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent leading-tight">
              Welcome Back!
            </h1>
            <p className="text-gray-600 text-lg">
              Log in to continue to your account.
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 text-center animate-fadeIn">
              {error}
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
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 text-lg font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-4 border-2 border-pink-200 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none text-gray-800 text-lg transition-all duration-300 shadow-sm hover:shadow-md"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                'Log In'
              )}
            </button>
          </form>

          <div className="text-center space-y-4 mt-8">
            <p className="text-gray-600 text-lg">
                Don't have an account?{' '}
              <Link href="/auth/signup" className="text-pink-600 font-semibold hover:text-pink-700 hover:underline transition-colors duration-200">
                  Sign Up
              </Link>
            </p>
            <p className="text-gray-500">
              <Link href="/auth/forgot-password" className="hover:text-pink-600 hover:underline transition-colors duration-200">
                Forgot Password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}