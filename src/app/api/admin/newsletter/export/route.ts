import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const adminSupabase = createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: subscribers } = await adminSupabase
    .from('newsletter_subscribers')
    .select('email, subscribed_at, is_active')
    .order('subscribed_at', { ascending: false })

  const rows = (subscribers ?? []).map((s) => [
    s.email,
    new Date(s.subscribed_at).toLocaleDateString('en-GB'),
    s.is_active !== false ? 'Active' : 'Unsubscribed',
  ])

  const csv = [
    ['Email', 'Subscribed Date', 'Status'].join(','),
    ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
  ].join('\r\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
