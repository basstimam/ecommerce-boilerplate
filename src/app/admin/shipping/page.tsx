import { createClient } from '@/lib/supabase/server'
import { Truck } from 'lucide-react'
import { ShippingZoneEditor } from './shipping-zone-editor'

export const metadata = { title: 'Shipping Zones' }

export default async function AdminShippingPage() {
  const supabase = await createClient()
  const { data: zones } = await supabase
    .from('shipping_zones')
    .select('*')
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shipping Zones</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure shipping rates for UK zones. Prices in pence (399 = £3.99).
        </p>
      </div>

      {!zones || zones.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm">
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <Truck className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500 mb-1">No shipping zones configured</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Run <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">supabase/seed.sql</code> to seed default UK shipping zones, or create them manually.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {zones.map((zone) => (
            <ShippingZoneEditor key={zone.id} zone={zone} />
          ))}
        </div>
      )}

      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
        <p className="text-sm font-medium text-amber-900 mb-1">UK Shipping Zones</p>
        <ul className="text-sm text-amber-700 space-y-1">
          <li><strong>Mainland UK</strong> — Standard delivery, free over £50</li>
          <li><strong>Northern Ireland</strong> — BT postcode prefix, flat rate</li>
          <li><strong>Highlands &amp; Islands</strong> — HS, ZE, KW, IV, PH, AB, PA, KA prefixes</li>
        </ul>
      </div>
    </div>
  )
}
