import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'

const bodySchema = z.object({
  amount_pence: z.number().int().min(100),
  currency: z.literal('gbp').default('gbp'),
  metadata: z.record(z.string(), z.string()).optional().default({}),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { amount_pence, currency, metadata } = parsed.data

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount_pence,
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: {
      user_id: user.id,
      ...metadata,
    },
  })

  return NextResponse.json({ client_secret: paymentIntent.client_secret })
}
