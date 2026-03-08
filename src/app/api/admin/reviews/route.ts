import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAdminAction } from '@/lib/audit/logger'

const patchSchema = z.object({
  id: z.string().uuid(),
  is_approved: z.boolean(),
})

const deleteSchema = z.object({
  id: z.string().uuid(),
})

async function getAuthenticatedAdmin(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const adminSupabase = createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return null
  }

  return { user, adminSupabase, request }
}

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedAdmin(request)
  if (!auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = auth.adminSupabase
    .from('product_reviews')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status === 'pending') query = query.eq('is_approved', false)
  if (status === 'approved') query = query.eq('is_approved', true)

  const { data: reviews, count, error } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }

  const productIds = [...new Set((reviews ?? []).map((r) => r.product_id))]
  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id))]

  const [{ data: products }, { data: profiles }] = await Promise.all([
    productIds.length > 0
      ? auth.adminSupabase.from('products').select('id, name').in('id', productIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    userIds.length > 0
      ? auth.adminSupabase.from('profiles').select('id, full_name').in('id', userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
  ])

  const productMap = (products ?? []).reduce<Record<string, string>>((acc, p) => {
    acc[p.id] = p.name
    return acc
  }, {})

  const profileMap = (profiles ?? []).reduce<Record<string, string>>((acc, p) => {
    acc[p.id] = p.full_name ?? 'Anonymous'
    return acc
  }, {})

  const enrichedReviews = (reviews ?? []).map((r) => ({
    ...r,
    product_name: productMap[r.product_id] ?? 'Unknown Product',
    reviewer_name: profileMap[r.user_id] ?? 'Anonymous',
  }))

  return NextResponse.json({
    reviews: enrichedReviews,
    total: count ?? 0,
    page,
    page_size: pageSize,
    total_pages: Math.ceil((count ?? 0) / pageSize),
  })
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthenticatedAdmin(request)
  if (!auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { id, is_approved } = parsed.data

  const { data: existingReview } = await auth.adminSupabase
    .from('product_reviews')
    .select('is_approved')
    .eq('id', id)
    .single()

  if (!existingReview) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  const { error: updateError } = await auth.adminSupabase
    .from('product_reviews')
    .update({ is_approved })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }

  await logAdminAction({
    admin_id: auth.user.id,
    admin_email: auth.user.email ?? '',
    action: is_approved ? 'review.approved' : 'review.rejected',
    entity_type: 'review',
    entity_id: id,
    changes: { is_approved: { old: existingReview.is_approved, new: is_approved } },
  }, auth.request)

  return NextResponse.json({ message: `Review ${is_approved ? 'approved' : 'rejected'}` })
}

export async function DELETE(request: NextRequest) {
  const auth = await getAuthenticatedAdmin(request)
  if (!auth) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = deleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { id } = parsed.data

  const { data: existingReview } = await auth.adminSupabase
    .from('product_reviews')
    .select('id, product_id, user_id, rating')
    .eq('id', id)
    .single()

  if (!existingReview) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  const { error: deleteError } = await auth.adminSupabase
    .from('product_reviews')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }

  await logAdminAction({
    admin_id: auth.user.id,
    admin_email: auth.user.email ?? '',
    action: 'review.deleted',
    entity_type: 'review',
    entity_id: id,
  }, auth.request)

  return NextResponse.json({ message: 'Review deleted' })
}
