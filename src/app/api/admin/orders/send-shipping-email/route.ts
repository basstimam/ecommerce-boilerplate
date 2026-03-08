import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendShippingConfirmationEmail } from '@/lib/email/resend'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, userId, orderNumber } = await request.json()

    if (!orderId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId)

    if (!authUser?.email) {
      return NextResponse.json({ error: 'Customer email not found' }, { status: 404 })
    }

    await sendShippingConfirmationEmail({
      to: authUser.email,
      orderNumber: orderNumber ?? orderId,
      customerName: profile?.full_name ?? 'Customer',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send shipping email:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
