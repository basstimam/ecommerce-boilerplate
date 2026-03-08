import Link from 'next/link'
import { Star, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ReviewActions } from './review-actions'

export const metadata = { title: 'Admin Reviews' }

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const adminSupabase = createAdminClient()

  const pageNum = Math.max(1, parseInt(page ?? '1'))
  const pageSize = 20
  const from = (pageNum - 1) * pageSize
  const to = from + pageSize - 1

  let query = adminSupabase
    .from('product_reviews')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status === 'pending') query = query.eq('is_approved', false)
  if (status === 'approved') query = query.eq('is_approved', true)

  const { data: reviews, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  const productIds = [...new Set((reviews ?? []).map((r) => r.product_id))]
  const userIds = [...new Set((reviews ?? []).map((r) => r.user_id))]

  const [{ data: products }, { data: profiles }] = await Promise.all([
    productIds.length > 0
      ? adminSupabase.from('products').select('id, name').in('id', productIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    userIds.length > 0
      ? adminSupabase.from('profiles').select('id, full_name').in('id', userIds)
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

  function getStatusLabel(isApproved: boolean): { label: string; className: string } {
    if (isApproved) return { label: 'Approved', className: 'bg-green-100 text-green-800' }
    return { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  function truncate(text: string | null, maxLen: number): string {
    if (!text) return '—'
    return text.length > maxLen ? `${text.slice(0, maxLen)}...` : text
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">{count ?? 0} reviews</p>
      </div>

      <div className="flex gap-2">
        {[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
        ].map(({ value, label }) => (
          <Link
            key={value}
            href={`?status=${value}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              (status ?? 'all') === value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(reviews ?? []).map((review) => {
              const statusInfo = getStatusLabel(review.is_approved)
              return (
                <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[160px]">
                      {productMap[review.product_id] ?? 'Unknown'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 truncate max-w-[120px]">
                      {profileMap[review.user_id] ?? 'Anonymous'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-[250px]">
                      {review.title && (
                        <p className="font-medium text-gray-900 text-xs truncate">{review.title}</p>
                      )}
                      <p className="text-xs text-gray-500 truncate">
                        {truncate(review.body, 80)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(review.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <ReviewActions
                      reviewId={review.id}
                      isApproved={review.is_approved}
                    />
                  </td>
                </tr>
              )
            })}
            {(reviews ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-400">No reviews found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">Page {pageNum} of {totalPages}</p>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link
                href={`?page=${pageNum - 1}${status ? `&status=${status}` : ''}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {pageNum < totalPages && (
              <Link
                href={`?page=${pageNum + 1}${status ? `&status=${status}` : ''}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
