export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const adminSupabase = createAdminClient()
  const { data: order } = await adminSupabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const isOwner = order.user_id === user.id
  const { data: adminProfile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const isAdmin = adminProfile?.role === 'admin'

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { renderToBuffer } = await import('@react-pdf/renderer')
    const { InvoiceDocument } = await import('@/lib/pdf/invoice')

    const pdf = await renderToBuffer(InvoiceDocument({ order: order as unknown as Parameters<typeof InvoiceDocument>[0]['order'] }))

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.order_number ?? order.id.slice(0, 8)}.pdf"`,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (err) {
    console.error('[invoice]', err)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}
