import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatGBPFromPence } from '@/lib/utils/currency'
import { Package, ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = { title: 'My Orders' }

const STATUS_BADGE: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-muted text-muted-foreground',
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
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders?.length ?? 0} order{orders?.length !== 1 ? 's' : ''} placed
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-base font-medium mb-1">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              When you place an order, it will appear here.
            </p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = (order.items as Array<{ product_name: string; quantity: number }>) ?? []
            const itemCount = items.reduce((sum, i) => sum + (i.quantity ?? 1), 0)

            return (
              <Card key={order.id} className="overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Order #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[order.status] ?? 'bg-muted text-muted-foreground'}`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatGBPFromPence(order.total_pence ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-5 py-4">
                  <p className="text-sm text-muted-foreground">
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                    {items[0]
                      ? ` · ${items[0].product_name}${items.length > 1 ? ` +${items.length - 1} more` : ''}`
                      : ''}
                  </p>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex items-center gap-1 text-sm font-medium hover:text-muted-foreground transition-colors"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
