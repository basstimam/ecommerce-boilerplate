import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email)
      .single()

    if (existing) {
      if (existing.is_active === false) {
        await supabase
          .from('newsletter_subscribers')
          .update({ is_active: true, subscribed_at: new Date().toISOString() })
          .eq('id', existing.id)
        return NextResponse.json({ success: true, message: 'Resubscribed successfully' })
      }
      return NextResponse.json({ success: true, message: 'Already subscribed' })
    }

    const { error } = await supabase.from('newsletter_subscribers').insert({
      email,
      is_active: true,
      subscribed_at: new Date().toISOString(),
    })

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Subscribed successfully' })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    console.error('[newsletter/subscribe]', err)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
