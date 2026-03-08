'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  reviewId: string
  isApproved: boolean
}

export function ReviewActions({ reviewId, isApproved }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleApproval(approve: boolean) {
    setLoading(approve ? 'approve' : 'reject')
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, is_approved: approve }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to update review')
        return
      }

      toast.success(approve ? 'Review approved' : 'Review rejected')
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    setLoading('delete')
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to delete review')
        return
      }

      toast.success('Review deleted')
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {!isApproved && (
        <button
          onClick={() => handleApproval(true)}
          disabled={loading !== null}
          className="rounded p-1.5 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
          title="Approve"
        >
          {loading === 'approve' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </button>
      )}
      {isApproved && (
        <button
          onClick={() => handleApproval(false)}
          disabled={loading !== null}
          className="rounded p-1.5 text-yellow-600 hover:bg-yellow-50 transition-colors disabled:opacity-50"
          title="Reject"
        >
          {loading === 'reject' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading !== null}
        className="rounded p-1.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        title="Delete"
      >
        {loading === 'delete' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}
