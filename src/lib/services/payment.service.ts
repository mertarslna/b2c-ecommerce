import { prisma } from '../prisma'
import { stripe, STRIPE_CONFIG } from '../stripe'
import { payThorService, PayThorPaymentRequest } from '../paythor'
import { PaymentMethod, PaymentStatus } from '@prisma/client'

export interface CreatePaymentRequest {
  orderId: string
  amount: number
  currency?: string
  method: PaymentMethod
  customerId: string
  description?: string
  metadata?: Record<string, any>
}

export interface CreatePaymentResponse {
  success: boolean
  data?: {
    paymentId: string
    clientSecret?: string
    paymentUrl?: string
    status: PaymentStatus
  }
  error?: {
    code: string
    message: string
  }
}

export interface PaymentWebhookData {
  paymentId: string
  status: PaymentStatus
  transactionId?: string
  metadata?: Record<string, any>
}

export class PaymentService {
  
  /**
   * Yeni bir ödeme oluşturur
   */
  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      // Önce veritabanında payment kaydı oluştur
      const payment = await prisma.payment.create({
        data: {
          order_id: request.orderId,
          amount: request.amount,
          method: request.method,
          status: 'PENDING',
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      // Ödeme sağlayıcısına göre işlem yap
      if (request.method === 'STRIPE') {
        return await this.createStripePayment(payment.id, request)
      } else if (request.method === 'PAYTHOR') {
        return await this.createPayThorPayment(payment.id, request)
      } else {
        // Diğer ödeme yöntemleri için basit işlem
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'PROCESSING' }
        })

        return {
          success: true,
          data: {
            paymentId: payment.id,
            status: 'PROCESSING'
          }
        }
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      return {
        success: false,
        error: {
          code: 'PAYMENT_CREATION_ERROR',
          message: 'Ödeme oluşturulamadı'
        }
      }
    }
  }

  /**
   * Stripe ile ödeme oluşturur
   */
  private async createStripePayment(paymentId: string, request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Stripe expects cents
        currency: request.currency || 'try',
        payment_method_types: ['card'],
        metadata: {
          paymentId,
          orderId: request.orderId,
          customerId: request.customerId,
          ...request.metadata
        },
        description: request.description
      })

      // Veritabanını güncelle
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          transaction_id: paymentIntent.id,
          status: 'PROCESSING'
        }
      })

      return {
        success: true,
        data: {
          paymentId,
          clientSecret: paymentIntent.client_secret || undefined,
          status: 'PROCESSING'
        }
      }
    } catch (error) {
      console.error('Stripe payment error:', error)
      
      // Veritabanını güncelle
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED' }
      })

      return {
        success: false,
        error: {
          code: 'STRIPE_ERROR',
          message: 'Stripe ödeme hatası'
        }
      }
    }
  }

  /**
   * PayThor ile ödeme oluşturur
   */
  private async createPayThorPayment(paymentId: string, request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const payThorRequest: PayThorPaymentRequest = {
        amount: request.amount,
        currency: request.currency || 'TRY',
        orderId: request.orderId,
        customerId: request.customerId,
        description: request.description,
        metadata: {
          paymentId,
          ...request.metadata
        }
      }

      const result = await payThorService.createPayment(payThorRequest)

      if (!result.success) {
        // Veritabanını güncelle
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'FAILED' }
        })

        return {
          success: false,
          error: {
            code: 'PAYTHOR_ERROR',
            message: result.error || 'PayThor payment failed'
          }
        }
      }

      // Veritabanını güncelle
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          transaction_id: result.payment_token,
          status: 'PROCESSING'
        }
      })

      return {
        success: true,
        data: {
          paymentId,
          paymentUrl: result.payment_url || '',
          status: 'PROCESSING'
        }
      }
    } catch (error) {
      console.error('PayThor payment error:', error)
      
      // Veritabanını güncelle
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED' }
      })

      return {
        success: false,
        error: {
          code: 'PAYTHOR_ERROR',
          message: 'PayThor ödeme hatası'
        }
      }
    }
  }

  /**
   * Ödeme durumunu getirir
   */
  async getPayment(paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              customer: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      })

      if (!payment) {
        return {
          success: false,
          error: {
            code: 'PAYMENT_NOT_FOUND',
            message: 'Ödeme bulunamadı'
          }
        }
      }

      return {
        success: true,
        data: payment
      }
    } catch (error) {
      console.error('Get payment error:', error)
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Veritabanı hatası'
        }
      }
    }
  }

  /**
   * Ödemeyi tamamlar
   */
  async completePayment(paymentId: string, transactionId?: string) {
    try {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          transaction_id: transactionId || undefined,
          payment_date: new Date(),
          updated_at: new Date()
        },
        include: {
          order: true
        }
      })

      // Siparişi güncelle
      await prisma.order.update({
        where: { id: payment.order_id },
        data: {
          status: 'PROCESSING' // Ödeme tamamlandı, sipariş işleme alındı
        }
      })

      return {
        success: true,
        data: payment
      }
    } catch (error) {
      console.error('Complete payment error:', error)
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Ödeme tamamlanamadı'
        }
      }
    }
  }

  /**
   * Ödemeyi iptal eder
   */
  async cancelPayment(paymentId: string, reason?: string) {
    try {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED',
          updated_at: new Date()
        },
        include: {
          order: true
        }
      })

      // Siparişi iptal et
      await prisma.order.update({
        where: { id: payment.order_id },
        data: {
          status: 'CANCELLED'
        }
      })

      return {
        success: true,
        data: payment
      }
    } catch (error) {
      console.error('Cancel payment error:', error)
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Ödeme iptal edilemedi'
        }
      }
    }
  }

  /**
   * İade işlemi yapar
   */
  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      })

      if (!payment) {
        return {
          success: false,
          error: {
            code: 'PAYMENT_NOT_FOUND',
            message: 'Ödeme bulunamadı'
          }
        }
      }

      if (payment.status !== 'COMPLETED') {
        return {
          success: false,
          error: {
            code: 'INVALID_PAYMENT_STATUS',
            message: 'Sadece tamamlanmış ödemeler iade edilebilir'
          }
        }
      }

      // Ödeme sağlayıcısına göre iade işlemi
      let refundSuccess = true
      let refundError = null

      if (payment.method === 'STRIPE' && payment.transaction_id) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: payment.transaction_id,
            amount: amount ? Math.round(amount * 100) : undefined
          })
          console.log('Stripe refund created:', refund.id)
        } catch (error) {
          console.error('Stripe refund error:', error)
          refundSuccess = false
          refundError = 'Stripe iade hatası'
        }
      } else if (payment.method === 'PAYTHOR' && payment.transaction_id) {
        try {
          // PayThor refund - sistem üzerinden desteklenmiyor, manuel işlem gerekli
          refundSuccess = false
          refundError = 'PayThor üzerinden yapılan ödemelerin iadesi sistem üzerinden desteklenmemektedir. Lütfen iade işlemini manuel olarak gerçekleştiriniz.'
        } catch (error) {
          console.error('PayThor refund error:', error)
          refundSuccess = false
          refundError = 'PayThor iade hatası'
        }
      }

      if (refundSuccess) {
        // Veritabanını güncelle
        const updatedPayment = await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'REFUNDED',
            updated_at: new Date()
          }
        })

        return {
          success: true,
          data: updatedPayment
        }
      } else {
        return {
          success: false,
          error: {
            code: 'REFUND_ERROR',
            message: refundError || 'İade işlemi başarısız'
          }
        }
      }
    } catch (error) {
      console.error('Refund payment error:', error)
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'İade işlemi gerçekleştirilemedi'
        }
      }
    }
  }

  /**
   * Webhook verilerini işler
   */
  async handleWebhook(webhookData: PaymentWebhookData) {
    try {
      const payment = await prisma.payment.update({
        where: { id: webhookData.paymentId },
        data: {
          status: webhookData.status,
          transaction_id: webhookData.transactionId || undefined,
          updated_at: new Date()
        }
      })

      // Ödeme tamamlandıysa siparişi güncelle
      if (webhookData.status === 'COMPLETED') {
        await prisma.order.update({
          where: { id: payment.order_id },
          data: {
            status: 'PROCESSING'
          }
        })
      }

      return {
        success: true,
        data: payment
      }
    } catch (error) {
      console.error('Webhook handling error:', error)
      return {
        success: false,
        error: {
          code: 'WEBHOOK_ERROR',
          message: 'Webhook işlenemedi'
        }
      }
    }
  }
}

export const paymentService = new PaymentService()
