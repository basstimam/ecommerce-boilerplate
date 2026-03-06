import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatGBPFromPence } from '@/lib/utils/currency'
import { ArrowLeft, Package, MapPin, CreditCard, FileText } from 'lucide-react'

export const metadata = { title: 'Order Details' }

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

const statusSteps = ['pending', 'processing', 'shipped', 'delivered']

interface OrderItem {
  product_id: string
  product_name: string
  variant_options?: Record<string, string>
  quantity: number
  unit_price_pence: number
  total_price_pence: number
  slug?: string
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

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!order) notFound()

  const items = (order.items as OrderItem[]) ?? []
  const shippingAddress = order.shipping_address as ShippingAddress
  const currentStep = statusSteps.indexOf(order.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/account/orders"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed on{' '}
            {new Date(order.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-800'}`}
        >
          {order.status}
        </span>
      </div>

      {!['cancelled', 'refunded'].includes(order.status) && (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Order Progress</h2>
          <div className="flex items-center">
            {statusSteps.map((step, idx) => (
              <div key={step} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      idx <= currentStep ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <p className={`mt-1 text-xs capitalize ${idx <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {step}
                  </p>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${idx < currentStep ? 'bg-gray-900' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          <Package className="h-4 w-4 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">
            Items ({items.length})
          </h2>
        </div>
        <ul className="divide-y divide-gray-100">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                {item.variant_options && Object.keys(item.variant_options).length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {Object.entries(item.variant_options)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                {formatGBPFromPence(item.total_price_pence ?? item.unit_price_pence * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Delivery Address</h2>
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
            <p className="text-sm text-gray-500">No address on record</p>
          )}
        </div>

        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Subtotal</dt>
              <dd className="font-medium">{formatGBPFromPence(order.subtotal_pence ?? 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">VAT (20%)</dt>
              <dd className="font-medium">{formatGBPFromPence(order.vat_pence ?? 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Shipping</dt>
              <dd className="font-medium">
                {order.shipping_pence === 0 ? 'Free' : formatGBPFromPence(order.shipping_pence ?? 0)}
              </dd>
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
        </div>
      </div>

      <div className="flex justify-end">
        <a
          href={`/api/orders/${order.id}/invoice`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Download Invoice (PDF)
        </a>
      </div>
    </div>
  )
}
