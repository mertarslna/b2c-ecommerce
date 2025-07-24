import crypto from 'crypto'

export interface PayTRPaymentRequest {
  merchant_id: string
  user_ip: string
  merchant_oid: string
  email: string
  payment_amount: string
  paytr_token: string
  user_basket: string
  debug_on?: string
  no_installment?: string
  max_installment?: string
  user_name: string
  user_address: string
  user_phone: string
  merchant_ok_url: string
  merchant_fail_url: string
  timeout_limit?: string
  currency?: string
  test_mode?: string
}

export interface PayTRTokenRequest {
  merchant_id: string
  user_ip: string
  merchant_oid: string
  email: string
  payment_amount: string
  user_basket: string
  no_installment: string
  max_installment: string
  user_name: string
  user_address: string
  user_phone: string
  merchant_ok_url: string
  merchant_fail_url: string
  timeout_limit: string
  currency: string
  test_mode: string
}

export class PayTRService {
  private merchantId: string
  private merchantKey: string
  private merchantSalt: string
  private baseUrl: string

  constructor() {
    this.merchantId = process.env.PAYTR_MERCHANT_ID || ''
    this.merchantKey = process.env.PAYTR_MERCHANT_KEY || ''
    this.merchantSalt = process.env.PAYTR_MERCHANT_SALT || ''
    this.baseUrl = 'https://www.paytr.com/odeme/api/get-token'
  }

  isConfigured(): boolean {
    return !!(
      this.merchantId && 
      this.merchantKey && 
      this.merchantSalt &&
      !this.merchantId.includes('your_') &&
      !this.merchantKey.includes('your_') &&
      !this.merchantSalt.includes('your_')
    )
  }

  generateToken(data: PayTRTokenRequest): string {
    const hashStr = [
      data.merchant_id,
      data.user_ip,
      data.merchant_oid,
      data.email,
      data.payment_amount,
      data.user_basket,
      data.no_installment,
      data.max_installment,
      data.user_name,
      data.user_address,
      data.user_phone,
      data.merchant_ok_url,
      data.merchant_fail_url,
      data.timeout_limit,
      data.currency,
      data.test_mode,
      this.merchantSalt
    ].join('|')

    return crypto
      .createHmac('sha256', this.merchantKey)
      .update(hashStr)
      .digest('base64')
  }

  async createPaymentToken(orderData: {
    orderId: string
    email: string
    amount: number // cents cinsinden
    userIp: string
    userName: string
    userAddress: string
    userPhone: string
    items: Array<{
      name: string
      price: number
      quantity: number
    }>
  }): Promise<{ success: boolean; token?: string; error?: string }> {
    
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'PayTR is not configured'
      }
    }

    // Sepet string'ini oluştur
    const userBasket = JSON.stringify(
      orderData.items.map(item => [
        item.name,
        (item.price / 100).toFixed(2), // TL cinsine çevir
        item.quantity
      ])
    )

    const tokenData: PayTRTokenRequest = {
      merchant_id: this.merchantId,
      user_ip: orderData.userIp,
      merchant_oid: orderData.orderId,
      email: orderData.email,
      payment_amount: (orderData.amount / 100 * 100).toString(), // PayTR kuruş bekliyor
      user_basket: Buffer.from(userBasket).toString('base64'),
      no_installment: '0',
      max_installment: '0',
      user_name: orderData.userName,
      user_address: orderData.userAddress,
      user_phone: orderData.userPhone,
      merchant_ok_url: `${process.env.NEXTAUTH_URL}/api/paytr/success`,
      merchant_fail_url: `${process.env.NEXTAUTH_URL}/api/paytr/fail`,
      timeout_limit: '30',
      currency: 'TL',
      test_mode: '1' // Test modu
    }

    const paytrToken = this.generateToken(tokenData)

    const postData = {
      ...tokenData,
      paytr_token: paytrToken
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(postData)
      })

      const result = await response.text()
      
      if (result.startsWith('SUCCESS.TOKEN:')) {
        const token = result.split(':')[1]
        return { success: true, token }
      } else {
        return { success: false, error: result }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  verifyCallback(postData: Record<string, string>): boolean {
    const {
      merchant_oid,
      status,
      total_amount,
      hash
    } = postData

    if (!merchant_oid || !status || !total_amount || !hash) {
      return false
    }

    const hashStr = [
      merchant_oid,
      this.merchantSalt,
      status,
      total_amount
    ].join('|')

    const calculatedHash = crypto
      .createHmac('sha256', this.merchantKey)
      .update(hashStr)
      .digest('base64')

    return hash === calculatedHash
  }
}

export const paytrService = new PayTRService()
