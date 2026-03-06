import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { verifyStripeWebhook } from '@/lib/stripe/webhooks'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = verifyStripeWebhook(body, signature)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      default:
        break
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Handler error'
    console.error(`Webhook handler error [${event.type}]:`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createAdminClient()
  const userId = paymentIntent.metadata?.user_id
  if (!userId) return

  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .maybeSingle()

  if (existing) return

  await supabase.from('orders').insert({
    user_id: userId,
    status: 'processing',
    stripe_payment_intent_id: paymentIntent.id,
    shipping_address: {},
    subtotal_pence: paymentIntent.amount,
    vat_pence: 0,
    total_pence: paymentIntent.amount,
    notes: JSON.stringify({ shipping_rate_id: paymentIntent.metadata?.shipping_rate_id }),
  })
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createAdminClient()
  await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('stripe_payment_intent_id', paymentIntent.id)
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const supabase = createAdminClient()
  const paymentIntentId =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id

  if (!paymentIntentId) return

  const fullyRefunded = charge.amount_refunded >= charge.amount
  await supabase
    .from('orders')
    .update({ status: fullyRefunded ? 'refunded' : 'processing' })
    .eq('stripe_payment_intent_id', paymentIntentId)
}
