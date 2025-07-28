// src/app/checkout/page.tsx - COMPLETE VERSION
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'
import Link from 'next/link'

export default function CheckoutPage() {
    const { items: cartItems, getCartTotal } = useCart()
    const { user, isAuthenticated, isLoading, getCustomerProfileId } = useUser()
    const router = useRouter()

    // State management
    const [items, setItems] = useState<any[]>([])
    const [isBuyNowCheckout, setIsBuyNowCheckout] = useState(false)
    const [step, setStep] = useState(1)
    const [isProcessing, setIsProcessing] = useState(false)

    // Form data
    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Turkey'
    })

    const [paymentInfo, setPaymentInfo] = useState({
        method: 'creditcard',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardName: '',
        saveCard: false
    })

    const [shippingMethod, setShippingMethod] = useState('standard')
    const shippingOptions = [
        { id: 'standard', name: 'Standard Delivery', price: 0, time: '5-7 business days' },
        { id: 'express', name: 'Express Delivery', price: 15.99, time: '2-3 business days' },
        { id: 'overnight', name: 'Overnight Delivery', price: 29.99, time: '1 business day' }
    ]

    const [orderSummary, setOrderSummary] = useState({
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0
    })

    const [errors, setErrors] = useState<any>({})

    // Load items from cart or sessionStorage (Buy Now)
    useEffect(() => {
        const checkoutData = sessionStorage.getItem('checkoutData')

        if (checkoutData) {
            try {
                const parsedData = JSON.parse(checkoutData)
                if (parsedData.items && parsedData.items.length > 0) {
                    setItems(parsedData.items)
                    setIsBuyNowCheckout(true)
                    console.log('✅ Loaded Buy Now checkout data:', parsedData.items)
                    return
                }
            } catch (error) {
                console.error('❌ Error parsing checkout data:', error)
                sessionStorage.removeItem('checkoutData')
            }
        }

        if (cartItems.length > 0) {
            setItems(cartItems)
            setIsBuyNowCheckout(false)
            console.log('✅ Loaded cart items for checkout:', cartItems)
        }
    }, [cartItems])

    // Redirect logic
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/auth/login')
                return
            }

            if (items.length === 0 && cartItems.length === 0) {
                const checkoutData = sessionStorage.getItem('checkoutData')
                if (!checkoutData) {
                    router.push('/cart')
                    return
                }
            }
        }
    }, [isAuthenticated, isLoading, items.length, cartItems.length, router])

    // Initialize user data
    useEffect(() => {
        if (user) {
            setShippingInfo(prev => ({
                ...prev,
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                email: user.email || '',
                phone: user.phone || ''
            }))
        }
    }, [user])

    // Calculate order summary
    useEffect(() => {
        let subtotal = 0

        if (isBuyNowCheckout) {
            subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)
        } else {
            subtotal = getCartTotal()
        }

        const selectedShipping = shippingOptions.find(option => option.id === shippingMethod)
        const shipping = selectedShipping?.price || 0
        const tax = subtotal * 0.1
        const total = subtotal + shipping + tax

        setOrderSummary({
            subtotal,
            shipping,
            tax,
            total
        })
    }, [items, isBuyNowCheckout, getCartTotal, shippingMethod])

    const validateStep = (stepNumber: number) => {
        const newErrors: any = {}

        if (stepNumber === 1) {
            if (!shippingInfo.firstName) newErrors.firstName = 'First name is required'
            if (!shippingInfo.lastName) newErrors.lastName = 'Last name is required'
            if (!shippingInfo.email) newErrors.email = 'Email is required'
            if (!shippingInfo.phone) newErrors.phone = 'Phone number is required'
            if (!shippingInfo.address) newErrors.address = 'Address is required'
            if (!shippingInfo.city) newErrors.city = 'City is required'
            if (!shippingInfo.zipCode) newErrors.zipCode = 'ZIP code is required'
        }

        if (stepNumber === 2) {
            if (!paymentInfo.method) {
                newErrors.method = 'Please select a payment method'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1)
        }
    }

    const handlePrevStep = () => {
        setStep(step - 1)
    }

    const handleInputChange = (field: string, value: string, type: 'shipping' | 'payment') => {
        if (type === 'shipping') {
            setShippingInfo(prev => ({ ...prev, [field]: value }))
        } else {
            setPaymentInfo(prev => ({ ...prev, [field]: value }))
        }

        if (errors[field]) {
            setErrors((prev: any) => ({ ...prev, [field]: '' }))
        }
    }

    // Main order placement function with Paythor integration
    // Main order placement function with Paythor integration
  const handlePlaceOrder = async () => {
    if (!validateStep(2)) return

    setIsProcessing(true)

    try {
      // Debug information
      console.log('🔍 Debug info:', {
        user: user,
        isAuthenticated: isAuthenticated,
        userRole: user?.role,
        userId: user?.id
      })

      // ✅ Updated to await the async function
      const customerProfileId = await getCustomerProfileId()

      if (!customerProfileId) {
        throw new Error('Customer profile not found. Please log in again.')
      }

      console.log('🛒 Creating order with customer ID:', customerProfileId)

      // 1. Create the order first
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerProfileId,
          items: items,
          shippingInfo: shippingInfo,
          paymentInfo: paymentInfo,
          shippingMethod: shippingMethod,
          orderSummary: orderSummary
        })
      })

      const orderResult = await orderResponse.json()

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order')
      }

      console.log('✅ Order created successfully:', orderResult.data)

      // 2. Create Paythor payment
      const paymentResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderResult.data.orderId,
          paymentMethod: paymentInfo.method,
          returnUrl: `${window.location.origin}/checkout/success?orderId=${orderResult.data.orderId}`,
          cancelUrl: `${window.location.origin}/checkout/cancel?orderId=${orderResult.data.orderId}`
        })
      })

      const paymentResult = await paymentResponse.json()

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to create payment')
      }

      console.log('✅ Payment created successfully:', paymentResult.data)

      // 3. Store order and payment info
      sessionStorage.setItem('pendingOrderId', orderResult.data.orderId)
      sessionStorage.setItem('paymentToken', paymentResult.data.payment_token)
      
      // Clear checkout data
      if (isBuyNowCheckout) {
        sessionStorage.removeItem('checkoutData')
      }

      // 4. Redirect to Paythor payment page
      showNotification('🔄 Redirecting to payment...', 'success')
      
      // Redirect to Paythor payment link
      window.location.href = paymentResult.data.payment_link

    } catch (error) {
      console.error('❌ Order/Payment creation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process order. Please try again.'
      setErrors({ general: errorMessage })
      showNotification('❌ Order processing failed', 'error')
    } finally {
      setIsProcessing(false)
    }
  }





    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        const notification = document.createElement('div')
        notification.textContent = message

        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300`

        document.body.appendChild(notification)

        setTimeout(() => {
            notification.style.transform = 'translateX(0)'
        }, 100)

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)'
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification)
                }
            }, 300)
        }, 4000)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-2xl font-semibold text-pink-600">Loading Checkout...</h2>
                    </div>
                </div>
            </div>
        )
    }

    if (!isAuthenticated || (items.length === 0 && cartItems.length === 0)) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
            <Header />

            {/* Checkout type indicator */}
            {isBuyNowCheckout && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2">
                    <span className="font-semibold">🚀 Express Checkout - Buy Now</span>
                </div>
            )}

            {/* Progress Bar */}
            <div className="bg-white border-b border-pink-100">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-center">
                        {[
                            { step: 1, title: 'Shipping', icon: '📦' },
                            { step: 2, title: 'Payment', icon: '💳' },
                            { step: 3, title: 'Review', icon: '👀' }
                        ].map((item, index) => (
                            <div key={item.step} className="flex items-center">
                                <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all ${step >= item.step
                                        ? 'bg-gradient-to-r from-pink-500 to-red-400 text-white'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-semibold hidden sm:inline">{item.title}</span>
                                </div>
                                {index < 2 && (
                                    <div className={`w-12 h-1 mx-2 rounded transition-colors ${step > item.step ? 'bg-pink-500' : 'bg-gray-300'
                                        }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8">

                            {/* Step 1: Shipping Information */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-3xl">📦</span>
                                        <h2 className="text-3xl font-bold text-gray-900">Shipping Information</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">First Name *</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value, 'shipping')}
                                                className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${errors.firstName ? 'border-red-300 focus:border-red-500' : 'border-pink-200 focus:border-pink-500'
                                                    }`}
                                                placeholder="Enter first name"
                                            />
                                            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Last Name *</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value, 'shipping')}
                                                className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${errors.lastName ? 'border-red-300 focus:border-red-500' : 'border-pink-200 focus:border-pink-500'
                                                    }`}
                                                placeholder="Enter last name"
                                            />
                                            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Email Address *</label>
                                            <input
                                                type="email"
                                                value={shippingInfo.email}
                                                onChange={(e) => handleInputChange('email', e.target.value, 'shipping')}
                                                className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-pink-200 focus:border-pink-500'
                                                    }`}
                                                placeholder="Enter email address"
                                            />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">Phone Number *</label>
                                            <input
                                                type="tel"
                                                value={shippingInfo.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value, 'shipping')}
                                                className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-pink-200 focus:border-pink-500'
                                                    }`}
                                                placeholder="Enter phone number"
                                            />
                                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Street Address *</label>
                                        <input
                                            type="text"
                                            value={shippingInfo.address}
                                            onChange={(e) => handleInputChange('address', e.target.value, 'shipping')}
                                            className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${errors.address ? 'border-red-300 focus:border-red-500' : 'border-pink-200 focus:border-pink-500'
                                                }`}
                                            placeholder="Enter street address"
                                        />
                                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">City *</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.city}
                                                onChange={(e) => handleInputChange('city', e.target.value, 'shipping')}
                                                className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${errors.city ? 'border-red-300 focus:border-red-500' : 'border-pink-200 focus:border-pink-500'
                                                    }`}
                                                placeholder="Enter city"
                                            />
                                            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">State</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.state}
                                                onChange={(e) => handleInputChange('state', e.target.value, 'shipping')}
                                                className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                                                placeholder="Enter state"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-semibold mb-2">ZIP Code *</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.zipCode}
                                                onChange={(e) => handleInputChange('zipCode', e.target.value, 'shipping')}
                                                className={`w-full p-4 border-2 rounded-xl focus:outline-none transition-colors ${errors.zipCode ? 'border-red-300 focus:border-red-500' : 'border-pink-200 focus:border-pink-500'
                                                    }`}
                                                placeholder="Enter ZIP code"
                                            />
                                            {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">Country</label>
                                        <select
                                            value={shippingInfo.country}
                                            onChange={(e) => handleInputChange('country', e.target.value, 'shipping')}
                                            className="w-full p-4 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                                        >
                                            <option value="Turkey">Turkey 🇹🇷</option>
                                        </select>
                                    </div>

                                    {/* Shipping Options */}
                                    <div className="mt-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Shipping Method</h3>
                                        <div className="space-y-3">
                                            {shippingOptions.map((option) => (
                                                <label key={option.id} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-pink-300 transition-colors ${shippingMethod === option.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                                                    }`}>
                                                    <input
                                                        type="radio"
                                                        name="shipping"
                                                        value={option.id}
                                                        checked={shippingMethod === option.id}
                                                        onChange={(e) => setShippingMethod(e.target.value)}
                                                        className="w-5 h-5 text-pink-600"
                                                    />
                                                    <div className="ml-4 flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{option.name}</p>
                                                                <p className="text-gray-600 text-sm">{option.time}</p>
                                                            </div>
                                                            <p className="font-bold text-pink-600">
                                                                {option.price === 0 ? 'Free' : `$${option.price}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Payment Method Selection */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-3xl">💳</span>
                                        <h2 className="text-3xl font-bold text-gray-900">Payment Method</h2>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">🔒 Secure Payment with Paythor</h3>
                                        <p className="text-gray-600">Your payment will be processed securely through Paythor. You'll be redirected to complete your payment safely.</p>
                                    </div>

                                    {/* Payment Methods */}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Select Payment Method</h3>
                                        <div className="space-y-4">
                                            {[
                                                { id: 'creditcard', name: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard, American Express' },
                                                { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
                                                { id: 'digital_wallet', name: 'Digital Wallet', icon: '📱', description: 'Mobile payment options' }
                                            ].map((method) => (
                                                <label key={method.id} className={`flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all hover:border-pink-300 ${paymentInfo.method === method.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                                                    }`}>
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value={method.id}
                                                        checked={paymentInfo.method === method.id}
                                                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value }))}
                                                        className="w-5 h-5 text-pink-600"
                                                    />
                                                    <div className="ml-4 flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-2xl">{method.icon}</span>
                                                            <span className="font-semibold text-lg">{method.name}</span>
                                                        </div>
                                                        <p className="text-gray-600 text-sm">{method.description}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                        <p className="text-yellow-800 text-sm">
                                            <strong>Note:</strong> You will be redirected to Paythor's secure payment page to complete your transaction. Your payment information is never stored on our servers.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Review Order */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-3xl">👀</span>
                                        <h2 className="text-3xl font-bold text-gray-900">Review Your Order</h2>
                                    </div>

                                    {/* Shipping Info Review */}
                                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-600"><strong>Name:</strong> {shippingInfo.firstName} {shippingInfo.lastName}</p>
                                                <p className="text-gray-600"><strong>Email:</strong> {shippingInfo.email}</p>
                                                <p className="text-gray-600"><strong>Phone:</strong> {shippingInfo.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600"><strong>Address:</strong></p>
                                                <p className="text-gray-600">
                                                    {shippingInfo.address}<br />
                                                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                                                    {shippingInfo.country}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-pink-200">
                                            <p className="text-gray-600">
                                                <strong>Shipping Method:</strong> {shippingOptions.find(opt => opt.id === shippingMethod)?.name}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Info Review */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">
                                                {paymentInfo.method === 'creditcard' ? '💳' : paymentInfo.method === 'bank_transfer' ? '🏦' : '📱'}
                                            </span>
                                            <span className="font-semibold capitalize">
                                                {paymentInfo.method.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items Review */}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Order Items</h3>
                                        <div className="space-y-4">
                                            {items.map((item, index) => (
                                                <div key={`${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}-${index}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                        <div className="text-sm text-gray-600">
                                                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                                                            {item.selectedSize && <span className="ml-4">Size: {item.selectedSize}</span>}
                                                        </div>
                                                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-pink-600">${(item.price * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">🔒 Ready to Process Payment</h3>
                                        <p className="text-gray-700 mb-4">
                                            When you click "Place Order", you'll be redirected to Paythor to complete your payment securely.
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span>✅ Order Total: <strong>₺{orderSummary.total.toFixed(2)}</strong></span>
                                            <span className="mx-2">•</span>
                                            <span>✅ Payment Method: <strong>{paymentInfo.method.replace('_', ' ').toUpperCase()}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between pt-8 border-t border-gray-200">
                                {step > 1 ? (
                                    <button
                                        onClick={handlePrevStep}
                                        className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
                                    >
                                        ← Previous
                                    </button>
                                ) : (
                                    <Link
                                        href={isBuyNowCheckout ? "/" : "/cart"}
                                        className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
                                    >
                                        ← {isBuyNowCheckout ? 'Back to Product' : 'Back to Cart'}
                                    </Link>
                                )}

                                {step < 3 ? (
                                    <button
                                        onClick={handleNextStep}
                                        className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-red-500 transition-all duration-300"
                                    >
                                        Next →
                                    </button>
                                ) : (
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isProcessing}
                                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Redirecting to Payment...
                                            </>
                                        ) : (
                                            <>
                                                🔒 Proceed to Payment
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* General Error */}
                            {errors.general && (
                                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mt-6">
                                    {errors.general}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 sticky top-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h3>

                            {/* Checkout type indicator */}
                            {isBuyNowCheckout && (
                                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 mb-6">
                                    <p className="text-center font-semibold text-purple-700">🚀 Express Checkout</p>
                                </div>
                            )}

                            {/* Payment security badge */}
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🔒</span>
                                    <div>
                                        <p className="font-semibold text-green-800">Secure Payment</p>
                                        <p className="text-green-600 text-sm">Powered by Paythor</p>
                                    </div>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="space-y-4 mb-6">
                                {items.map((item, index) => (
                                    <div key={`summary-${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}-${index}`} className="flex items-center gap-3">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                                            <p className="text-gray-600 text-xs">
                                                Qty: {item.quantity}
                                                {item.selectedColor && ` • ${item.selectedColor}`}
                                                {item.selectedSize && ` • ${item.selectedSize}`}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-pink-600">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Order Totals */}
                            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">${orderSummary.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-semibold">
                                        {orderSummary.shipping === 0 ? 'Free' : `${orderSummary.shipping.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-semibold">${orderSummary.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="text-xl font-bold">Total</span>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-red-500 bg-clip-text text-transparent">
                                        ${orderSummary.total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Security Features */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">Secure Payment</p>
                                        <p className="text-gray-600 text-xs">SSL encrypted</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">Money Back Guarantee</p>
                                        <p className="text-gray-600 text-xs">30-day return policy</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">Order Updates</p>
                                        <p className="text-gray-600 text-xs">Email notifications</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}