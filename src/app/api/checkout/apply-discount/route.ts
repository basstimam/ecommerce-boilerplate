import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const schema = z.object({
  code: z.string().min(1),
  subtotal_pence: z.number().min(0),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subtotal_pence } = schema.parse(body)

    const supabase = createAdminClient()
    const { data: discount } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (!discount) {
      return NextResponse.json({ error: 'Invalid or expired discount code' }, { status: 400 })
    }

    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This discount code has expired' }, { status: 400 })
    }

    if (discount.usage_limit && (discount.usage_count ?? 0) >= discount.usage_limit) {
      return NextResponse.json({ error: 'This discount code has reached its usage limit' }, { status: 400 })
    }

    if (discount.min_order_pence && subtotal_pence < discount.min_order_pence) {
      const minPounds = (discount.min_order_pence / 100).toFixed(2)
      return NextResponse.json(
        { error: `Minimum order of £${minPounds} required for this code` },
        { status: 400 }
      )
    }

    let discount_pence = 0
    if (discount.type === 'percentage') {
      discount_pence = Math.round((subtotal_pence * discount.value) / 100)
    } else if (discount.type === 'fixed_amount') {
      discount_pence = discount.value_pence ?? Math.round(discount.value * 100)
      discount_pence = Math.min(discount_pence, subtotal_pence)
    } else if (discount.type === 'free_shipping') {
      discount_pence = 0
    }

    return NextResponse.json({
      success: true,
      code: discount.code,
      type: discount.type,
      discount_pence,
      is_free_shipping: discount.type === 'free_shipping',
      message: discount.type === 'free_shipping'
        ? 'Free shipping applied!'
        : `Discount of £${(discount_pence / 100).toFixed(2)} applied`,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request. Required: code (string), subtotal_pence (number)' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to apply discount' }, { status: 500 })
  }
}
