import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatGBPFromPence } from '@/lib/utils/currency'
import { Package, ArrowRight, ShoppingBag } from 'lucide-react'

export const metadata = { title: 'My Orders' }

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

export default async function AccountOrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total_pence, created_at, items')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          {orders?.length ?? 0} order{orders?.length !== 1 ? 's' : ''} placed
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-base font-medium text-gray-900 mb-1">No orders yet</h3>
            <p className="text-sm text-gray-500 mb-6">When you place an order, it will appear here.</p>
            <Link
              href="/products"
              className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = (order.items as Array<{ product_name: string; quantity: number }>) ?? []
            const itemCount = items.reduce((sum, i) => sum + (i.quantity ?? 1), 0)

            return (
              <div key={order.id} className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Package className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-800'}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatGBPFromPence(order.total_pence ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                    {items[0] ? ` · ${items[0].product_name}${items.length > 1 ? ` +${items.length - 1} more` : ''}` : ''}
                  </p>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
