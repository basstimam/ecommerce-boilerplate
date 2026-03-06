'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react'
import { formatGBPFromPence } from '@/lib/utils/currency'

interface ShippingRate {
  name: string
  price_pence: number
  days_min: number
  days_max: number
  min_order_pence?: number
}

interface ShippingZone {
  id: string
  name: string
  zone_type: string
  postcode_prefixes: string[]
  rates: ShippingRate[]
  is_active: boolean
}

export function ShippingZoneEditor({ zone }: { zone: ShippingZone }) {
  const [open, setOpen] = useState(false)
  const [rates, setRates] = useState<ShippingRate[]>((zone.rates as ShippingRate[]) ?? [])
  const [isActive, setIsActive] = useState(zone.is_active)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const updateRate = (idx: number, field: keyof ShippingRate, value: string | number) => {
    setRates((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)))
  }

  const save = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('shipping_zones')
        .update({ rates, is_active: isActive })
        .eq('id', zone.id)
      if (error) throw error
      toast.success(`${zone.name} updated`)
      router.refresh()
    } catch (err) {
      toast.error('Failed to save', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const fieldClass = 'w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900'

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-gray-900 text-left">{zone.name}</p>
            <p className="text-xs text-gray-500 text-left">
              {zone.postcode_prefixes.join(', ')} · {(rates as ShippingRate[]).length} rate(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-5 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-medium text-gray-500">Name</th>
                  <th className="text-left py-2 font-medium text-gray-500">Price (pence)</th>
                  <th className="text-left py-2 font-medium text-gray-500">Min Days</th>
                  <th className="text-left py-2 font-medium text-gray-500">Max Days</th>
                  <th className="text-left py-2 font-medium text-gray-500">Free over (pence)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rates.map((rate, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pr-2">
                      <input
                        value={rate.name}
                        onChange={(e) => updateRate(idx, 'name', e.target.value)}
                        className={fieldClass}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <div>
                        <input
                          type="number"
                          min="0"
                          value={rate.price_pence}
                          onChange={(e) => updateRate(idx, 'price_pence', parseInt(e.target.value) || 0)}
                          className={fieldClass}
                        />
                        <span className="text-gray-400 mt-0.5 block">{formatGBPFromPence(rate.price_pence)}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min="1"
                        value={rate.days_min}
                        onChange={(e) => updateRate(idx, 'days_min', parseInt(e.target.value) || 1)}
                        className={fieldClass}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min="1"
                        value={rate.days_max}
                        onChange={(e) => updateRate(idx, 'days_max', parseInt(e.target.value) || 1)}
                        className={fieldClass}
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min="0"
                        value={rate.min_order_pence ?? ''}
                        onChange={(e) => updateRate(idx, 'min_order_pence', parseInt(e.target.value) || 0)}
                        placeholder="none"
                        className={fieldClass}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Zone Active</span>
            </label>

            <button
              onClick={save}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Zone
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
