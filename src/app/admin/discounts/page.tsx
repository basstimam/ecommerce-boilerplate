import { createClient } from '@/lib/supabase/server'
import { formatGBPFromPence } from '@/lib/utils/currency'
import { Plus, Tag } from 'lucide-react'
import { AdminDiscountActions } from './discount-actions'

export const metadata = { title: 'Discount Codes' }

export default async function AdminDiscountsPage() {
  const supabase = await createClient()

  const { data: discounts } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Codes</h1>
          <p className="mt-1 text-sm text-gray-500">{discounts?.length ?? 0} codes</p>
        </div>
        <AdminDiscountActions mode="create" discount={null} />
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Uses</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(discounts ?? []).map((d) => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    {d.code}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 capitalize">{d.type?.replace('_', ' ')}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {d.type === 'percentage'
                    ? `${d.value}%`
                    : d.type === 'fixed_amount'
                    ? formatGBPFromPence(d.value_pence ?? d.value * 100)
                    : 'Free shipping'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {d.usage_count ?? 0}
                  {d.usage_limit ? ` / ${d.usage_limit}` : ' / ∞'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {d.expires_at
                    ? new Date(d.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Never'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${d.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {d.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminDiscountActions mode="edit" discount={d} />
                </td>
              </tr>
            ))}
            {(discounts ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <Tag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No discount codes yet</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
