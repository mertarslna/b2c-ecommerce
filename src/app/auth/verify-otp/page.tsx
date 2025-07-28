// src/app/auth/verify-otp/page.tsx - COMPLETE VERSION
'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function VerifyOTPPage() {
  const [otp, setOTP] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [remainingAttempts, setRemainingAttempts] = useState(5)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailFromUrl = searchParams.get('email')
    if (emailFromUrl) {
      setEmail(emailFromUrl)
    } else {
      const storedEmail = localStorage.getItem('pendingVerificationEmail')
      if (storedEmail) {
        setEmail(storedEmail)
      }
    }
  }, [searchParams])

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split('')
      const newOTP = [...otp]
      pastedData.forEach((char, i) => {
        if (i + index < 6 && /^\d$/.test(char)) {
          newOTP[i + index] = char
        }
      })
      setOTP(newOTP)
      
      // Focus last filled input or next empty
      const lastFilledIndex = Math.min(index + pastedData.length - 1, 5)
      inputRefs.current[lastFilledIndex]?.focus()
      return
    }

    if (!/^\d?$/.test(value)) return // Only allow digits

    const newOTP = [...otp]
    newOTP[index] = value
    setOTP(newOTP)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      setStatus('error')
      setMessage('Please enter all 6 digits')
      return
    }

    if (!email) {
      setStatus('error')
      setMessage('Email address is required')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpString
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        
        // Clear stored email
        localStorage.removeItem('pendingVerificationEmail')
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setStatus('error')
        setMessage(data.error)
        
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts)
        }
        
        // Clear OTP on error
        setOTP(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      alert('Please enter your email address')
      return
    }

    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('New verification code sent! Please check your inbox.')
        setOTP(['', '', '', '', '', ''])
        setRemainingAttempts(5)
        setTimeLeft(600) // Reset timer
        setStatus('idle')
        setMessage('')
        inputRefs.current[0]?.focus()
      } else {
        alert(data.error || 'Failed to send verification code')
      }
    } catch (error) {
      alert('Failed to send verification code. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      <div className="flex items-center justify-center py-16 px-4">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-pink-100 transform hover:scale-[1.005] transition-transform duration-300">
          
          {status === 'success' ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-4">Verified! ✨</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-sm text-gray-500 mb-6">Redirecting to login page...</p>
              <Link
                href="/auth/login"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Continue to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Enter Verification Code</h1>
                <p className="text-gray-600 text-lg">
                  We sent a 6-digit code to
                </p>
                <p className="text-pink-600 font-semibold">{email}</p>
              </div>

              {/* Email Input (if not provided) */}
              {!email && (
                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none text-gray-800 transition-all duration-300"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Timer */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500">
                  Code expires in: <span className="font-mono font-bold text-red-500">{formatTime(timeLeft)}</span>
                </p>
              </div>

              {/* OTP Input */}
              <div className="mb-6">
                <div className="flex justify-center space-x-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all duration-300"
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                    />
                  ))}
                </div>
              </div>

              {/* Error/Status Message */}
              {message && (
                <div className={`p-4 rounded-xl mb-6 text-center ${
                  status === 'error' 
                    ? 'bg-red-50 border border-red-200 text-red-600' 
                    : 'bg-blue-50 border border-blue-200 text-blue-600'
                }`}>
                  {message}
                  {remainingAttempts < 5 && status === 'error' && (
                    <p className="text-sm mt-1">
                      {remainingAttempts} attempts remaining
                    </p>
                  )}
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerifyOTP}
                disabled={status === 'loading' || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-pink-500 to-red-400 text-white py-4 rounded-xl font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-95 flex items-center justify-center hover:from-pink-600 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Verify Code'
                )}
              </button>

              {/* Resend Button */}
              <div className="text-center mt-6">
                <p className="text-gray-600 mb-4">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendOTP}
                  disabled={isResending || timeLeft > 540} // Allow resend after 1 minute
                  className="text-pink-600 font-semibold hover:text-pink-700 hover:underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
                {timeLeft > 540 && (
                  <p className="text-xs text-gray-500 mt-1">
                    You can resend in {Math.ceil((timeLeft - 540) / 60)} minute(s)
                  </p>
                )}
              </div>

              {/* Back to Login */}
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-pink-600 font-semibold hover:underline transition-colors duration-200"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}