import { createClient } from '@/lib/supabase/server'
import { formatGBPFromPence } from '@/lib/utils/currency'
import { Search, Users } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Admin Customers' }

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q, page } = await searchParams
  const supabase = await createClient()

  const pageNum = Math.max(1, parseInt(page ?? '1'))
  const pageSize = 25
  const from = (pageNum - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('profiles')
    .select('id, full_name, phone, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q) query = query.ilike('full_name', `%${q}%`)

  const { data: profiles, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  const profileIds = profiles?.map((p) => p.id) ?? []
  const { data: orderStats } = profileIds.length > 0
    ? await supabase
        .from('orders')
        .select('user_id, total_pence')
        .in('user_id', profileIds)
        .neq('status', 'cancelled')
    : { data: [] }

  const statsByUser = (orderStats ?? []).reduce<Record<string, { count: number; total: number }>>((acc, o) => {
    if (!acc[o.user_id]) acc[o.user_id] = { count: 0, total: 0 }
    acc[o.user_id].count += 1
    acc[o.user_id].total += o.total_pence ?? 0
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="mt-1 text-sm text-gray-500">{count ?? 0} registered accounts</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <form>
          <input
            name="q"
            defaultValue={q}
            type="search"
            placeholder="Search by name..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </form>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(profiles ?? []).map((profile) => {
              const stats = statsByUser[profile.id] ?? { count: 0, total: 0 }
              return (
                <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold">
                        {profile.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{profile.full_name ?? '—'}</p>
                        {profile.phone && <p className="text-xs text-gray-500">{profile.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">{stats.count}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatGBPFromPence(stats.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders?user=${profile.id}`}
                      className="text-xs font-medium text-gray-600 hover:text-gray-900"
                    >
                      Orders
                    </Link>
                  </td>
                </tr>
              )
            })}
            {(profiles ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No customers found</p>
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
                href={`?page=${pageNum - 1}${q ? `&q=${q}` : ''}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {pageNum < totalPages && (
              <Link
                href={`?page=${pageNum + 1}${q ? `&q=${q}` : ''}`}
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
