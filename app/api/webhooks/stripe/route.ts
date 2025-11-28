/**
 * Stripe Webhook Handler
 * Handles Stripe events like payment success, subscription changes, etc.
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe, verifyWebhookSignature } from '@/lib/stripe/stripe-server'
import { initializeFirebaseAdmin } from '@/lib/firebase/admin'
import {
  sendPaymentReceiptEmail,
  sendSubscriptionNotification,
} from '@/lib/email/email-service'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    // Verify webhook signature
    let event
    try {
      event = verifyWebhookSignature(body, signature, webhookSecret)
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('✅ Webhook event received:', event.type)

    const { db } = initializeFirebaseAdmin()

    // Handle different event types
    switch (event.type) {
      // Payment succeeded
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        console.log('💰 Payment succeeded:', paymentIntent.id)

        // Update payment status in database
        const paymentRef = db.collection('payments').doc(paymentIntent.id)
        await paymentRef.set(
          {
            status: 'succeeded',
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            customerId: paymentIntent.customer,
            metadata: paymentIntent.metadata,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        )

        // Send receipt email if customer email is available
        if (paymentIntent.receipt_email) {
          await sendPaymentReceiptEmail(
            paymentIntent.receipt_email,
            paymentIntent.metadata?.customerName || 'Customer',
            paymentIntent.amount / 100,
            paymentIntent.currency,
            `/dashboard/invoices/${paymentIntent.id}`
          )
        }

        break
      }

      // Payment failed
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        console.log('❌ Payment failed:', paymentIntent.id)

        await db
          .collection('payments')
          .doc(paymentIntent.id)
          .set(
            {
              status: 'failed',
              error: paymentIntent.last_payment_error?.message,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          )

        break
      }

      // Subscription created
      case 'customer.subscription.created': {
        const subscription = event.data.object
        console.log('📅 Subscription created:', subscription.id)

        await db.collection('subscriptions').doc(subscription.id).set({
          userId: subscription.metadata?.userId,
          customerId: subscription.customer,
          status: subscription.status,
          planId: subscription.items.data[0].price.id,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        // Send notification
        if (subscription.metadata?.userEmail) {
          await sendSubscriptionNotification(
            subscription.metadata.userEmail,
            subscription.metadata.userName || 'Customer',
            'activated',
            subscription.metadata.planName || 'Subscription',
            'Your subscription is now active!'
          )
        }

        break
      }

      // Subscription updated
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        console.log('🔄 Subscription updated:', subscription.id)

        await db
          .collection('subscriptions')
          .doc(subscription.id)
          .set(
            {
              status: subscription.status,
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000).toISOString(),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
              cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          )

        break
      }

      // Subscription deleted
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log('🗑️ Subscription deleted:', subscription.id)

        await db
          .collection('subscriptions')
          .doc(subscription.id)
          .set(
            {
              status: 'canceled',
              canceledAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          )

        // Send notification
        if (subscription.metadata?.userEmail) {
          await sendSubscriptionNotification(
            subscription.metadata.userEmail,
            subscription.metadata.userName || 'Customer',
            'cancelled',
            subscription.metadata.planName || 'Subscription',
            'Your subscription has been cancelled.'
          )
        }

        break
      }

      // Invoice paid
      case 'invoice.paid': {
        const invoice = event.data.object
        console.log('✅ Invoice paid:', invoice.id)

        await db.collection('invoices').doc(invoice.id).set({
          subscriptionId: (invoice as any).subscription,
          customerId: (invoice as any).customer,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency,
          status: 'paid',
          paidAt: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
          invoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        break
      }

      // Invoice payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.log('❌ Invoice payment failed:', invoice.id)

        await db
          .collection('invoices')
          .doc(invoice.id)
          .set(
            {
              status: 'payment_failed',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          )

        break
      }

      // Customer created
      case 'customer.created': {
        const customer = event.data.object
        console.log('👤 Customer created:', customer.id)

        await db.collection('stripeCustomers').doc(customer.id).set({
          userId: customer.metadata?.userId,
          email: customer.email,
          name: customer.name,
          createdAt: new Date().toISOString(),
        })

        break
      }

      // Payment method attached
      case 'payment_method.attached': {
        const paymentMethod = event.data.object
        console.log('💳 Payment method attached:', paymentMethod.id)

        await db.collection('paymentMethods').doc(paymentMethod.id).set({
          customerId: paymentMethod.customer,
          type: paymentMethod.type,
          card: paymentMethod.card
            ? {
                brand: paymentMethod.card.brand,
                last4: paymentMethod.card.last4,
                expMonth: paymentMethod.card.exp_month,
                expYear: paymentMethod.card.exp_year,
              }
            : null,
          createdAt: new Date().toISOString(),
        })

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing, need raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}
