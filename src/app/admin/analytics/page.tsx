import { createClient } from '@/lib/supabase/server'
import { formatGBPFromPence } from '@/lib/utils/currency'
import { BarChart2, Package, ShoppingBag } from 'lucide-react'

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

      const completedOrders = (orders ?? []).filter(
        (o) => !['cancelled', 'refunded'].includes(o.status),
      )
      const revenue = completedOrders.reduce((s, o) => s + (o.total_pence ?? 0), 0)

      return { label, revenue, orderCount: completedOrders.length, newCustomers: newCustomers ?? 0 }
    }),
  )

  const { data: topProducts } = await supabase
    .from('products')
    .select('id, name, slug, price_pence, stock_quantity')
    .eq('is_active', true)
    .order('stock_quantity', { ascending: true })
    .limit(5)

  const { data: statusBreakdown } = await supabase.from('orders').select('status')

  const statusCounts = (statusBreakdown ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {})

  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0)
  const totalOrders = monthlyData.reduce((s, m) => s + m.orderCount, 0)
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1)

  const statusColor: Record<string, string> = {
    pending_payment: 'bg-amber-400',
    paid: 'bg-blue-400',
    processing: 'bg-indigo-400',
    shipped: 'bg-purple-400',
    in_transit: 'bg-cyan-400',
    out_for_delivery: 'bg-teal-400',
    delivered: 'bg-green-400',
    completed: 'bg-emerald-500',
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
          <p className="mt-1 text-xs text-gray-400">All completed orders</p>
        </div>
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">6-Month Orders</p>
          <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
          <p className="mt-1 text-xs text-gray-400">Excluding cancelled &amp; refunded</p>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Monthly Revenue</h2>
        {totalRevenue === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart2 className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">No revenue data yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Revenue will appear here once orders are placed
            </p>
          </div>
        ) : (
          <div className="flex items-end gap-3 h-44">
            {monthlyData.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500">{formatGBPFromPence(m.revenue)}</span>
                <div
                  className="w-full rounded-t-sm min-h-[4px] bg-indigo-500 transition-all hover:bg-indigo-600"
                  style={{ height: `${(m.revenue / maxRevenue) * 140}px` }}
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Orders by Status</h2>
          {Object.keys(statusCounts).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingBag className="h-8 w-8 text-gray-200 mb-2" />
              <p className="text-sm font-medium text-gray-400">No orders yet</p>
              <p className="text-xs text-gray-300 mt-1">Status breakdown will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => {
                const total = Object.values(statusCounts).reduce((a, b) => a + b, 0)
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm capitalize text-gray-700">
                        {status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {count}{' '}
                        <span className="text-gray-400 font-normal">({pct}%)</span>
                      </span>
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
                <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Customers
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthlyData.map((m) => (
                <tr key={m.label} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 text-gray-700">{m.label}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-900">{m.orderCount}</td>
                  <td className="py-2.5 text-right text-gray-600">{m.newCustomers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Low Stock Products</h2>
        {!topProducts || topProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-8 w-8 text-gray-200 mb-2" />
            <p className="text-sm font-medium text-gray-400">All products are well stocked</p>
            <p className="text-xs text-gray-300 mt-1">Products with low stock will appear here</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 text-gray-900 font-medium">{p.name}</td>
                  <td className="py-2.5 text-right text-gray-600">
                    {formatGBPFromPence(p.price_pence ?? 0)}
                  </td>
                  <td
                    className={`py-2.5 text-right font-semibold ${
                      (p.stock_quantity ?? 0) <= 5 ? 'text-red-600' : 'text-gray-900'
                    }`}
                  >
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
