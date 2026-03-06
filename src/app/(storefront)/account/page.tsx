import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatGBPFromPence } from '@/lib/utils/currency'
import { Package, MapPin, Settings, ArrowRight, ShoppingBag } from 'lucide-react'

export const metadata = { title: 'My Account' }

export default async function AccountDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: orders }, { data: profile }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, status, total_pence, created_at, order_number')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user!.id)
      .single(),
  ])

  const totalSpend = orders?.reduce((sum, o) => sum + (o.total_pence ?? 0), 0) ?? 0
  const recentOrders = orders ?? []

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your orders, addresses and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{recentOrders.length}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Spend</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{formatGBPFromPence(totalSpend)}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Account Email</p>
          <p className="mt-1 text-sm font-medium text-gray-900 truncate">{user!.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { href: '/account/orders', icon: Package, label: 'My Orders', desc: 'Track and manage orders' },
          { href: '/account/addresses', icon: MapPin, label: 'Addresses', desc: 'Manage delivery addresses' },
          { href: '/account/profile', icon: Settings, label: 'Profile', desc: 'Update your details' },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:border-gray-300 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-900 transition-colors">
              <Icon className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{label}</p>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </Link>
        ))}
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-gray-600 hover:text-gray-900">
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No orders yet</p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[order.status] ?? 'bg-gray-100 text-gray-800'}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatGBPFromPence(order.total_pence ?? 0)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
