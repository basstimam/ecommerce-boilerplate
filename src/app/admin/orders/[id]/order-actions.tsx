'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronDown, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { OrderStatus } from '@/types/database.types'

interface OrderData {
  id: string
  order_number: string | null
  user_id: string
  status: OrderStatus
}

const VALID_TRANSITIONS: Record<string, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
}

export function AdminOrderActions({
  orderId,
  currentStatus,
  orderData,
}: {
  orderId: string
  currentStatus: string
  orderData?: OrderData
}) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const nextStatuses = VALID_TRANSITIONS[currentStatus] ?? []

  if (nextStatuses.length === 0) return null

  const updateStatus = async (status: OrderStatus) => {
    setLoading(true)
    setOpen(false)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      if (status === 'shipped' && orderData) {
        try {
          await fetch('/api/admin/orders/send-shipping-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              userId: orderData.user_id,
              orderNumber: orderData.order_number,
            }),
          })
        } catch (emailErr) {
          console.error('Failed to send shipping email:', emailErr)
        }
      }

      toast.success(`Order status updated to ${status}`)
      router.refresh()
    } catch (err) {
      toast.error('Failed to update status', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Update Status
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-lg border border-gray-100 bg-white shadow-lg z-10">
          {nextStatuses.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className="flex w-full items-center px-4 py-2.5 text-sm capitalize text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              Mark as {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
