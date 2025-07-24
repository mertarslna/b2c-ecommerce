/**
 * PayThor API Integration - Modern Implementation
 * Bu dosya PayThor'un Laravel çalışan versiyonuna uygun şekilde tasarlanmıştır
 */

import PayThorAuth from './paythor-auth-direct'

export interface PayThorCreatePaymentRequest {
  amount: string                    // "10.00" format
  currency: string                  // "TRY"
  buyer_fee: string                // "0"
  method: string                   // "creditcard"
  merchant_reference: string       // Unique order reference
  return_url: string              // Success redirect URL
  cancel_url: string              // Cancel redirect URL  
  callback_url: string            // Webhook URL
  
  // Customer Information
  first_name: string
  last_name: string
  email: string
  phone: string
  
  // Address Information
  address_line_1: string
  city: string
  postal_code: string
  country: string                 // "TR"
  
  // Order Information
  order_id: string
  description: string
}

export interface PayThorCreatePaymentResponse {
  status: "success" | "error"
  message: string
  meta: {
    timestamp: string
    request_id: string
    code: number
  }
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
    payment_url?: string
    transaction_id?: string
  }
}

export interface PayThorPaymentStatusResponse {
  status: "success" | "error"
  message: string
  meta: {
    timestamp: string
    request_id: string
    code: number
  }
  data?: {
    id: number
    amount: string
    currency: string
    status: string // "pending", "paid", "failed", "cancelled"
    merchant_reference: string
    payment_token: string
    transaction_id?: string
    created_at: string
    updated_at: string
  }
}

/**
 * Modern PayThor API Client
 * Laravel working example'a uygun format
 */
export class PayThorAPI {
  private baseUrl: string
  private auth: PayThorAuth

  constructor() {
    // Laravel working example'da dev-api.paythor.com kullanılıyor
    this.baseUrl = process.env.PAYTHOR_BASE_URL || 'https://dev-api.paythor.com'
    this.auth = PayThorAuth.getInstance()
  }

  /**
   * Ödeme oluşturur
   */
  async createPayment(request: PayThorCreatePaymentRequest): Promise<PayThorCreatePaymentResponse> {
    try {
      if (!this.auth.isAuthenticated()) {
        throw new Error('PayThor authentication required')
      }

      console.log('PayThor API: Creating payment with request:', request)

      const response = await fetch(`${this.baseUrl}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.auth.getTokenWithHeaders()
        },
        body: JSON.stringify(request)
      })

      const result = await response.json()
      console.log('PayThor API: Create payment response:', result)

      if (!response.ok) {
        throw new Error(`PayThor API Error: ${response.status} - ${result.message || result.error || 'Unknown error'}`)
      }

      return result
    } catch (error) {
      console.error('PayThor API: Create payment error:', error)
      throw error
    }
  }

  /**
   * Ödeme durumunu kontrol eder
   */
  async getPaymentStatus(paymentToken: string): Promise<PayThorPaymentStatusResponse> {
    try {
      if (!this.auth.isAuthenticated()) {
        throw new Error('PayThor authentication required')
      }

      console.log('PayThor API: Getting payment status for token:', paymentToken)

      const response = await fetch(`${this.baseUrl}/payment/status/${paymentToken}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...this.auth.getTokenWithHeaders()
        }
      })

      const result = await response.json()
      console.log('PayThor API: Payment status response:', result)

      if (!response.ok) {
        throw new Error(`PayThor API Error: ${response.status} - ${result.message || result.error || 'Unknown error'}`)
      }

      return result
    } catch (error) {
      console.error('PayThor API: Get payment status error:', error)
      throw error
    }
  }

  /**
   * Auth durumunu kontrol eder
   */
  isAuthenticated(): boolean {
    return this.auth.isAuthenticated()
  }

  /**
   * Logout yapar
   */
  logout(): void {
    this.auth.logout()
  }
}

// Singleton instance
export const payThorAPI = new PayThorAPI()
export default payThorAPI
