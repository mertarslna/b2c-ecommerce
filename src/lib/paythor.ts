import PayThorAuth from './paythor-auth'

export interface PayThorCardInfo {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardHolderName: string
}

export interface PayThorDirectPaymentRequest extends PayThorPaymentRequest {
  cardInfo: PayThorCardInfo
}

export interface PayThorCartItem {
  id: string
  name: string
  type: 'product' | 'discount' | 'shipping' | 'tax'
  price: string
  quantity: number
}

export interface PayThorAddress {
  line_1: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface PayThorPaymentRequest {
  payment: {
    amount: string
    currency: string
    buyer_fee: string
    method: string
    merchant_reference: string
  }
  payer: {
    first_name: string
    last_name: string
    email: string
    phone: string
    address: PayThorAddress
    ip: string
  }
  order: {
    cart: PayThorCartItem[]
    shipping: {
      first_name: string
      last_name: string
      phone: string
      email: string
      address: PayThorAddress
    }
    invoice: {
      id: string
      first_name: string
      last_name: string
      price: string
      quantity: number
    }
  }
}

export interface PayThorPaymentResponse {
  success: boolean
  payment_token?: string
  payment_url?: string
  error?: string
  message?: string
  // Real PayThor API format
  status?: string
  data?: {
    id: number
    amount: string
    currency: string
    status: string
    merchant_reference: string
    buyer_fee: string
    gateway_fee: string
    created_at: string
    date_due: string
    payment_token: string
    payment_link?: string | null
    transaction_id?: string
  }
  meta?: {
    timestamp: string
    request_id: string
    code: number
  }
}

export interface PayThorPaymentStatus {
  payment_token: string
  status: string
  amount: number
  currency: string
  order_id: string
  transaction_id?: string
  created_at: string
  updated_at: string
}

export class PayThorService {
  private apiKey: string
  private apiSecret: string
  private baseUrl: string
  private testMode: boolean
  private auth: PayThorAuth

  constructor() {
    this.apiKey = process.env.PAYTHOR_API_KEY || ''
    this.apiSecret = process.env.PAYTHOR_API_SECRET || ''
    this.baseUrl = process.env.PAYTHOR_BASE_URL || 'https://api.paythor.com'
    this.testMode = process.env.PAYTHOR_TEST_MODE === 'true'
    this.auth = PayThorAuth.getInstance()
  }

  isConfigured(): boolean {
    // Test mode'da her zaman true döndür
    if (this.testMode) {
      return true
    }
    
    return !!(
      this.apiKey && 
      this.apiKey.length > 5
    )
  }

  async ensureAuthenticated(): Promise<boolean> {
    if (this.testMode) {
      return true // Test mode'da authentication gerektirmeyen
    }

    if (this.auth.isAuthenticated()) {
      return true
    }

    // Try to login with environment credentials
    const email = process.env.PAYTHOR_EMAIL
    const password = process.env.PAYTHOR_PASSWORD

    if (!email || !password) {
      console.error('PayThor credentials not found in environment variables')
      return false
    }

    try {
      const result = await this.auth.login(email, password)
      return result.status === 'success'
    } catch (error) {
      console.error('PayThor authentication failed:', error)
      return false
    }
  }

  private getClientIp(): string {
    // In a real application, you would get the actual client IP
    return '127.0.0.1'
  }

  private createCartHash(items: PayThorCartItem[]): string {
    const crypto = require('crypto')
    const itemsString = JSON.stringify(items)
    return crypto.createHash('md5').update(itemsString).digest('hex').substring(0, 10)
  }

  async createPayment(paymentData: PayThorPaymentRequest): Promise<PayThorPaymentResponse> {
    console.log('PayThor createPayment called with:', JSON.stringify(paymentData, null, 2))
    
    if (!this.isConfigured()) {
      console.log('PayThor not configured and not in test mode')
      return {
        success: false,
        error: 'PayThor is not configured'
      }
    }

    // Test mode için mock response döndür
    if (this.testMode) {
      console.log('PayThor Test Mode: Returning mock payment response')
      const mockResponse = {
        success: true,
        payment_token: `test_token_${Date.now()}`,
        payment_url: `https://test.paythor.com/payment/test_token_${Date.now()}`
      }
      console.log('Mock response:', mockResponse)
      return mockResponse
    }

    // Ensure authentication for production mode
    const isAuthenticated = await this.ensureAuthenticated()
    if (!isAuthenticated) {
      return {
        success: false,
        error: 'PayThor authentication failed'
      }
    }

    console.log('PayThor configured and authenticated, proceeding with real API call...')
    
    try {
      console.log('Making API request to:', `${this.baseUrl}/payment/create`)
      console.log('Request data:', JSON.stringify(paymentData, null, 2))

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Add authorization header if we have a token
      const token = this.auth.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${this.baseUrl}/payment/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentData)
      })

      console.log('API response status:', response.status)
      const result = await response.json()
      console.log('API response body:', JSON.stringify(result, null, 2))

      if (response.ok && result.success) {
        return {
          success: true,
          payment_token: result.payment_token || result.transaction_id,
          payment_url: result.payment_url || result.redirect_url
        }
      } else {
        return {
          success: false,
          error: result.error || result.message || 'Payment creation failed',
          message: result.message
        }
      }
    } catch (error) {
      console.error('PayThor API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async createDirectPayment(paymentData: PayThorDirectPaymentRequest): Promise<PayThorPaymentResponse> {
    console.log('PayThor createDirectPayment called with card info')
    
    if (!this.isConfigured()) {
      console.log('PayThor not configured')
      return {
        success: false,
        error: 'PayThor is not configured'
      }
    }

    // Test mode için mock response döndür
    if (this.testMode) {
      console.log('PayThor Test Mode: Processing direct card payment')
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock successful payment
      const mockResponse = {
        success: true,
        status: 'success',
        data: {
          id: Math.floor(Math.random() * 10000),
          amount: paymentData.payment.amount,
          currency: paymentData.payment.currency,
          status: 'completed',
          merchant_reference: paymentData.payment.merchant_reference,
          buyer_fee: '0.00',
          gateway_fee: '0.50',
          created_at: new Date().toISOString(),
          date_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          payment_token: `direct_${Date.now()}`,
          payment_link: null, // No link needed for direct payment
          transaction_id: `TXN${Date.now()}`
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: `REQ${Date.now()}`,
          code: 1
        }
      }
      
      console.log('Mock direct payment response:', mockResponse)
      return mockResponse
    }

    // Ensure authentication for production mode
    const isAuthenticated = await this.ensureAuthenticated()
    if (!isAuthenticated) {
      return {
        success: false,
        error: 'PayThor authentication failed'
      }
    }

    // Real API call would go here
    console.log('PayThor configured and authenticated, processing direct card payment...')
    
    try {
      // Prepare payment data with card info for direct payment
      const directPaymentRequest = {
        ...paymentData,
        card: {
          number: paymentData.cardInfo.cardNumber.replace(/\s/g, ''),
          expiry_month: paymentData.cardInfo.expiryMonth,
          expiry_year: paymentData.cardInfo.expiryYear,
          cvv: paymentData.cardInfo.cvv,
          holder_name: paymentData.cardInfo.cardHolderName
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Add authorization header if we have a token
      const token = this.auth.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${this.baseUrl}/payment/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(directPaymentRequest)
      })

      const result = await response.json()
      console.log('Direct payment API response:', result)

      if (response.ok && result.status === 'success') {
        return {
          success: true,
          status: 'success',
          data: result.data,
          meta: result.meta
        }
      } else {
        return {
          success: false,
          error: result.message || 'Direct payment failed'
        }
      }
    } catch (error) {
      console.error('PayThor Direct Payment Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    try {
      // PayThor uses the same endpoint for all payments, including direct card payments
      const response = await fetch(`${this.baseUrl}/payment/create`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...paymentData,
          // Add card info to the main payment data
          card: {
            number: paymentData.cardInfo.cardNumber,
            expiry_month: paymentData.cardInfo.expiryMonth,
            expiry_year: paymentData.cardInfo.expiryYear,
            cvv: paymentData.cardInfo.cvv,
            holder_name: paymentData.cardInfo.cardHolderName
          }
        })
      })

      const result = await response.json()
      console.log('PayThor direct payment response:', result)

      return result
    } catch (error) {
      console.error('PayThor direct payment error:', error)
      return {
        success: false,
        error: 'Payment processing failed'
      }
    }
  }

  async getPaymentStatus(paymentToken: string): Promise<PayThorPaymentStatus | null> {
    if (!this.isConfigured()) {
      throw new Error('PayThor is not configured')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/payment/getbytoken/${paymentToken}`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      )

      const result = await response.json()

      if (response.ok && result.success) {
        return result.data as PayThorPaymentStatus
      } else {
        throw new Error(result.error || 'Failed to get payment status')
      }
    } catch (error) {
      console.error('PayThor status check error:', error)
      return null
    }
  }

  verifyCallback(callbackData: Record<string, any>): boolean {
    if (this.testMode) {
      // Test mode'da tüm callback'leri geçerli kabul et
      return true
    }

    // Gerçek signature verification burada yapılacak
    // PayThor'un callback verification dokumentasyonuna göre implement edilmeli
    return true
  }
}

export const payThorService = new PayThorService()
