import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateShipping } from '@/lib/shipping/calculator'
import { normalizePostcode } from '@/lib/utils/postcode'

const bodySchema = z.object({
  postcode: z.string().min(1),
  subtotal_pence: z.number().int().min(0),
  items: z
    .array(
      z.object({
        product_id: z.string(),
        variant_id: z.string().optional(),
        quantity: z.number().int().positive(),
        price_pence: z.number().int().min(0),
        weight_grams: z.number().optional(),
      })
    )
    .optional()
    .default([]),
})

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed. Use POST.' }, { status: 405 })
}

export async function POST(request: NextRequest) {
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

  const { postcode, subtotal_pence, items } = parsed.data
  const normalizedPostcode = normalizePostcode(postcode)

  const options = await calculateShipping(normalizedPostcode, items, subtotal_pence)

  return NextResponse.json({ options })
}
