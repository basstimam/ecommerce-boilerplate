import { createClient } from '@/lib/supabase/server'
import { formatGBPFromPence } from '@/lib/utils/currency'
import { ShoppingBag, Users, Package, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

  const [
    { count: totalOrders },
    { count: monthOrders },
    { count: lastMonthOrders },
    { data: revenueData },
    { data: lastMonthRevData },
    { count: totalCustomers },
    { count: totalProducts },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth),
    supabase.from('orders').select('total_pence').gte('created_at', startOfMonth).neq('status', 'cancelled'),
    supabase.from('orders').select('total_pence').gte('created_at', startOfLastMonth).lte('created_at', endOfLastMonth).neq('status', 'cancelled'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('id, order_number, status, total_pence, created_at').order('created_at', { ascending: false }).limit(8),
  ])

  const monthRevenue = revenueData?.reduce((s, o) => s + (o.total_pence ?? 0), 0) ?? 0
  const lastMonthRevenue = lastMonthRevData?.reduce((s, o) => s + (o.total_pence ?? 0), 0) ?? 0
  const revChange = lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0
  const orderChange = (lastMonthOrders ?? 0) > 0 ? (((monthOrders ?? 0) - (lastMonthOrders ?? 0)) / (lastMonthOrders ?? 1)) * 100 : 0

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  }

  const stats = [
    {
      label: 'Revenue This Month',
      value: formatGBPFromPence(monthRevenue),
      icon: TrendingUp,
      change: revChange,
      sub: `vs last month`,
    },
    {
      label: 'Orders This Month',
      value: monthOrders ?? 0,
      icon: ShoppingBag,
      change: orderChange,
      sub: `${totalOrders ?? 0} total`,
    },
    {
      label: 'Total Customers',
      value: totalCustomers ?? 0,
      icon: Users,
      change: null,
      sub: 'registered accounts',
    },
    {
      label: 'Active Products',
      value: totalProducts ?? 0,
      icon: Package,
      change: null,
      sub: 'in catalogue',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your store performance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, change, sub }) => (
          <div key={label} className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{label}</p>
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <div className="mt-1 flex items-center gap-1">
              {change !== null && (
                <span className={`flex items-center text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {Math.abs(change).toFixed(1)}%
                </span>
              )}
              <span className="text-xs text-gray-400">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(recentOrders ?? []).map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatGBPFromPence(order.total_pence ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
