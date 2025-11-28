/**
 * Stripe Server-Side SDK
 * Used for backend payment processing
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// Helper functions for common Stripe operations

/**
 * Create a payment intent for one-time payments
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

/**
 * Create a customer in Stripe
 */
export async function createCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
) {
  return await stripe.customers.create({
    email,
    name,
    metadata,
  })
}

/**
 * Create a subscription
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  })
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Update a subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  priceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
  })
}

/**
 * Retrieve a customer's payment methods
 */
export async function listPaymentMethods(customerId: string) {
  return await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  })
}

/**
 * Attach a payment method to a customer
 */
export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
) {
  return await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  })
}

/**
 * Detach a payment method from a customer
 */
export async function detachPaymentMethod(paymentMethodId: string) {
  return await stripe.paymentMethods.detach(paymentMethodId)
}

/**
 * Set default payment method for customer
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
) {
  return await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })
}

/**
 * Create a product
 */
export async function createProduct(
  name: string,
  description?: string,
  metadata?: Record<string, string>
) {
  return await stripe.products.create({
    name,
    description,
    metadata,
  })
}

/**
 * Create a price for a product
 */
export async function createPrice(
  productId: string,
  unitAmount: number,
  currency: string = 'usd',
  recurring?: { interval: 'month' | 'year' }
) {
  return await stripe.prices.create({
    product: productId,
    unit_amount: Math.round(unitAmount * 100), // Convert to cents
    currency,
    recurring,
  })
}

/**
 * Retrieve an invoice
 */
export async function getInvoice(invoiceId: string) {
  return await stripe.invoices.retrieve(invoiceId)
}

/**
 * List customer invoices
 */
export async function listInvoices(customerId: string, limit: number = 10) {
  return await stripe.invoices.list({
    customer: customerId,
    limit,
  })
}

/**
 * Create a refund
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
) {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
    reason,
  })
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}
