import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const postSchema = z.object({
  product_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('product_id')

  if (!productId) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: reviews, error } = await supabase
    .from('product_reviews')
    .select('id, rating, title, body, is_verified, created_at, user_id')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }

  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id))]
  let profileMap: Record<string, string> = {}

  if (userIds.length > 0) {
    const adminSupabase = createAdminClient()
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)

    profileMap = (profiles ?? []).reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = p.full_name ?? 'Anonymous'
      return acc
    }, {})
  }

  const enrichedReviews = (reviews ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    is_verified: r.is_verified,
    created_at: r.created_at,
    reviewer_name: profileMap[r.user_id] ?? 'Anonymous',
  }))

  return NextResponse.json({ reviews: enrichedReviews })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { product_id, rating, title, body: reviewBody } = parsed.data

  const { data: existing } = await supabase
    .from('product_reviews')
    .select('id')
    .eq('product_id', product_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'You have already reviewed this product' },
      { status: 409 }
    )
  }

  const adminSupabase = createAdminClient()
  const { data: deliveredOrders } = await adminSupabase
    .from('orders')
    .select('id, items')
    .eq('user_id', user.id)
    .in('status', ['delivered', 'completed'])

  let isVerified = false
  if (deliveredOrders && deliveredOrders.length > 0) {
    isVerified = deliveredOrders.some((order) => {
      const items = order.items as Array<{ product_id?: string }> | null
      return Array.isArray(items) && items.some((item) => item.product_id === product_id)
    })
  }

  const { error: insertError } = await adminSupabase
    .from('product_reviews')
    .insert({
      product_id,
      user_id: user.id,
      rating,
      title: title ?? null,
      body: reviewBody ?? null,
      is_verified: isVerified,
      is_approved: false,
    })

  if (insertError) {
    console.error('[Reviews] Insert error:', insertError)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }

  return NextResponse.json(
    { message: 'Review submitted for approval' },
    { status: 201 }
  )
}
