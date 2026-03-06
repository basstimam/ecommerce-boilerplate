import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatGBPFromPence } from '@/lib/utils/currency'
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react'
import { AdminOrderActions } from './order-actions'
import { TrackingForm } from './tracking-form'

export const metadata = { title: 'Order Details' }

interface OrderItem {
  product_id: string
  product_name: string
  variant_options?: Record<string, string>
  quantity: number
  unit_price_pence: number
  total_price_pence: number
  image_url?: string
}

interface ShippingAddress {
  full_name: string
  line1: string
  line2?: string
  city: string
  county?: string
  postcode: string
  country: string
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase.from('orders').select('*').eq('id', id).single()
  if (!order) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email:id')
    .eq('id', order.user_id)
    .single()

  const items = (order.items as OrderItem[]) ?? []
  const shippingAddress = order.shipping_address as ShippingAddress

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
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          All Orders
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date(order.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${statusColor[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
            {order.status}
          </span>
          <AdminOrderActions orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-gray-100">
              <Package className="h-4 w-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Items ({items.length})</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 p-4">
                  <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                    {item.variant_options && Object.keys(item.variant_options).length > 0 && (
                      <p className="text-xs text-gray-500">
                        {Object.entries(item.variant_options).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatGBPFromPence(item.unit_price_pence)}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatGBPFromPence(item.total_price_pence ?? item.unit_price_pence * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {order.notes && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-sm font-medium text-amber-900 mb-1">Order Notes</p>
              <p className="text-sm text-amber-700">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Payment Summary</h2>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd>{formatGBPFromPence(order.subtotal_pence ?? 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">VAT</dt>
                <dd>{formatGBPFromPence(order.vat_pence ?? 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Shipping</dt>
                <dd>{order.shipping_pence === 0 ? 'Free' : formatGBPFromPence(order.shipping_pence ?? 0)}</dd>
              </div>
              {(order.discount_pence ?? 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt>Discount</dt>
                  <dd>−{formatGBPFromPence(order.discount_pence!)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold">
                <dt>Total</dt>
                <dd>{formatGBPFromPence(order.total_pence ?? 0)}</dd>
              </div>
            </dl>
            {order.stripe_payment_intent_id && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Stripe PI: {order.stripe_payment_intent_id.slice(0, 20)}…</p>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900 text-sm">Shipping Address</h2>
            </div>
            {shippingAddress ? (
              <address className="not-italic text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-900">{shippingAddress.full_name}</p>
                <p>{shippingAddress.line1}</p>
                {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                <p>{shippingAddress.city}</p>
                {shippingAddress.county && <p>{shippingAddress.county}</p>}
                <p>{shippingAddress.postcode}</p>
                <p>{shippingAddress.country}</p>
              </address>
            ) : (
              <p className="text-sm text-gray-400">No address</p>
            )}
          </div>

          <TrackingForm orderId={order.id} currentNotes={order.notes} />

          {profile && (
            <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 text-sm mb-3">Customer</h2>
              <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
              <Link
                href={`/admin/customers?user=${order.user_id}`}
                className="text-xs text-gray-500 hover:text-gray-900"
              >
                View customer →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
