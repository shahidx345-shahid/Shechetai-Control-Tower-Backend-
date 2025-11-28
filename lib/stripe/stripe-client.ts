/**
 * Stripe Client-Side SDK
 * Used for frontend payment collection
 */

'use client'

import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

/**
 * Get Stripe.js instance
 */
export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    
    if (!key) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined')
    }
    
    stripePromise = loadStripe(key)
  }
  
  return stripePromise
}

/**
 * Redirect to Stripe Checkout
 * Note: redirectToCheckout is deprecated, use Stripe Checkout Sessions with redirect URL instead
 */
export async function redirectToCheckout(sessionId: string) {
  const stripe = await getStripe()
  
  if (!stripe) {
    throw new Error('Stripe failed to load')
  }
  
  // For newer Stripe.js versions, redirect manually
  window.location.href = `https://checkout.stripe.com/pay/${sessionId}`
}

/**
 * Confirm a payment
 */
export async function confirmPayment(
  clientSecret: string,
  elements: any,
  returnUrl: string
) {
  const stripe = await getStripe()
  
  if (!stripe) {
    throw new Error('Stripe failed to load')
  }
  
  return await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: returnUrl,
    },
  })
}

/**
 * Confirm a card payment
 */
export async function confirmCardPayment(
  clientSecret: string,
  paymentMethod: {
    card: any
    billing_details?: {
      name?: string
      email?: string
      phone?: string
      address?: any
    }
  }
) {
  const stripe = await getStripe()
  
  if (!stripe) {
    throw new Error('Stripe failed to load')
  }
  
  return await stripe.confirmCardPayment(clientSecret, {
    payment_method: paymentMethod,
  })
}

/**
 * Create payment method
 */
export async function createPaymentMethod(
  type: 'card',
  card: any,
  billingDetails?: {
    name?: string
    email?: string
    phone?: string
    address?: any
  }
) {
  const stripe = await getStripe()
  
  if (!stripe) {
    throw new Error('Stripe failed to load')
  }
  
  return await stripe.createPaymentMethod({
    type,
    card,
    billing_details: billingDetails,
  })
}
