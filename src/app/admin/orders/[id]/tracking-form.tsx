'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Truck } from 'lucide-react'

export function TrackingForm({
  orderId,
  currentNotes,
}: {
  orderId: string
  currentNotes?: string | null
}) {
  const parseTracking = (notes: string | null | undefined) => {
    try {
      const parsed = JSON.parse(notes ?? '{}')
      return { number: parsed.tracking_number ?? '', url: parsed.tracking_url ?? '' }
    } catch {
      return { number: '', url: '' }
    }
  }

  const existing = parseTracking(currentNotes)
  const [trackingNumber, setTrackingNumber] = useState(existing.number)
  const [trackingUrl, setTrackingUrl] = useState(existing.url)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const save = async () => {
    setLoading(true)
    try {
      const notesPayload = JSON.stringify({
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
      })

      const { error } = await supabase
        .from('orders')
        .update({ notes: notesPayload, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error
      toast.success('Tracking info saved')
      router.refresh()
    } catch (err) {
      toast.error('Failed to save tracking', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const fieldClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900'

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="h-4 w-4 text-gray-500" />
        <h2 className="font-semibold text-gray-900 text-sm">Tracking Information</h2>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tracking Number</label>
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className={fieldClass}
            placeholder="e.g. JD0002393456789012"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tracking URL (optional)</label>
          <input
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            className={fieldClass}
            type="url"
            placeholder="https://track.royalmail.com/..."
          />
        </div>
        <button
          onClick={save}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors w-full justify-center"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Tracking
        </button>
      </div>
    </div>
  )
}
