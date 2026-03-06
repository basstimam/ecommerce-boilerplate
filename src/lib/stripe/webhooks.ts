import type Stripe from 'stripe'
import { stripe } from './client'

export function verifyStripeWebhook(body: string, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
}
