import Stripe from 'stripe'

// Stripe is optional - if no key provided, payment features will be disabled
const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
}) : null

export const CURRENCY = 'TRY'
export const PAYMENT_METHODS = ['card'] as const

// Stripe configuration for Turkish market
export const STRIPE_CONFIG = {
  country: 'TR',
  currency: CURRENCY,
  payment_method_types: PAYMENT_METHODS,
  capture_method: 'automatic' as const,
  confirmation_method: 'automatic' as const,
}
