import { createClient } from '@/lib/supabase/server'
import { formatGBPFromPence } from '@/lib/utils/currency'

export const metadata = { title: 'Analytics' }

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return {
      label: d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      start: d.toISOString(),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString(),
    }
  }).reverse()

  const monthlyData = await Promise.all(
    months.map(async ({ label, start, end }) => {
      const [{ data: orders }, { count: newCustomers }] = await Promise.all([
        supabase
          .from('orders')
          .select('total_pence, status')
          .gte('created_at', start)
          .lte('created_at', end),
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', start)
          .lte('created_at', end),
      ])

      const completedOrders = (orders ?? []).filter((o) => !['cancelled', 'refunded'].includes(o.status))
      const revenue = completedOrders.reduce((s, o) => s + (o.total_pence ?? 0), 0)

      return { label, revenue, orderCount: completedOrders.length, newCustomers: newCustomers ?? 0 }
    })
  )

  const { data: topProducts } = await supabase
    .from('products')
    .select('id, name, slug, price_pence, stock_quantity')
    .eq('is_active', true)
    .order('stock_quantity', { ascending: true })
    .limit(5)

  const { data: statusBreakdown } = await supabase
    .from('orders')
    .select('status')

  const statusCounts = (statusBreakdown ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {})

  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0)
  const totalOrders = monthlyData.reduce((s, m) => s + m.orderCount, 0)
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1)

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-400',
    processing: 'bg-blue-400',
    shipped: 'bg-purple-400',
    delivered: 'bg-green-400',
    cancelled: 'bg-red-400',
    refunded: 'bg-gray-400',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Last 6 months performance overview.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">6-Month Revenue</p>
          <p className="text-3xl font-bold text-gray-900">{formatGBPFromPence(totalRevenue)}</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">6-Month Orders</p>
          <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Monthly Revenue</h2>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-gray-500">{formatGBPFromPence(m.revenue)}</span>
              <div
                className="w-full bg-gray-900 rounded-t-sm min-h-[4px] transition-all"
                style={{ height: `${(m.revenue / maxRevenue) * 120}px` }}
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Orders by Status</h2>
          {Object.keys(statusCounts).length === 0 ? (
            <p className="text-sm text-gray-400">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => {
                const total = Object.values(statusCounts).reduce((a, b) => a + b, 0)
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm capitalize text-gray-700">{status}</span>
                      <span className="text-sm font-medium text-gray-900">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${statusColor[status] ?? 'bg-gray-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Monthly Orders vs Customers</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">New Customers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthlyData.map((m) => (
                <tr key={m.label}>
                  <td className="py-2 text-gray-700">{m.label}</td>
                  <td className="py-2 text-right font-medium text-gray-900">{m.orderCount}</td>
                  <td className="py-2 text-right text-gray-600">{m.newCustomers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Low Stock Products</h2>
        {!topProducts || topProducts.length === 0 ? (
          <p className="text-sm text-gray-400">No products with low stock</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topProducts.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 text-gray-900">{p.name}</td>
                  <td className="py-2 text-right text-gray-600">{formatGBPFromPence(p.price_pence ?? 0)}</td>
                  <td className={`py-2 text-right font-medium ${(p.stock_quantity ?? 0) <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                    {p.stock_quantity ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
