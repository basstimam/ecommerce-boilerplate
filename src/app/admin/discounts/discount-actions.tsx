'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Loader2 } from 'lucide-react'

const discountSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
  value: z.number({ coerce: true }).min(0),
  usage_limit: z.number({ coerce: true }).optional(),
  expires_at: z.string().optional(),
  min_order_pence: z.number({ coerce: true }).optional(),
  is_active: z.boolean().default(true),
})

type DiscountForm = z.infer<typeof discountSchema>

interface DiscountRecord extends DiscountForm {
  id: string
  usage_count?: number
}

export function AdminDiscountActions({
  mode,
  discount,
}: {
  mode: 'create' | 'edit'
  discount: DiscountRecord | null
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DiscountForm>({
    resolver: zodResolver(discountSchema),
    defaultValues: discount
      ? { ...discount, expires_at: discount.expires_at ? new Date(discount.expires_at).toISOString().split('T')[0] : '' }
      : { type: 'percentage', value: 10, is_active: true },
  })

  const onSubmit = async (data: DiscountForm) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        code: data.code.toUpperCase(),
        expires_at: data.expires_at || null,
        usage_limit: data.usage_limit || null,
        min_order_pence: data.min_order_pence || null,
      }

      if (mode === 'edit' && discount) {
        const { error } = await supabase.from('discount_codes').update(payload).eq('id', discount.id)
        if (error) throw error
        toast.success('Discount code updated')
      } else {
        const { error } = await supabase.from('discount_codes').insert({ ...payload, usage_count: 0 })
        if (error) throw error
        toast.success('Discount code created')
      }

      setOpen(false)
      reset()
      router.refresh()
    } catch (err) {
      toast.error('Failed to save', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const deleteDiscount = async () => {
    if (!discount || !confirm('Delete this discount code?')) return
    const { error } = await supabase.from('discount_codes').delete().eq('id', discount.id)
    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Discount code deleted')
      router.refresh()
    }
  }

  const fieldClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <>
      {mode === 'create' ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Code
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          Edit
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                {mode === 'create' ? 'Create Discount Code' : 'Edit Discount Code'}
              </h2>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className={labelClass}>Code</label>
                <input {...register('code')} className={`${fieldClass} uppercase`} placeholder="SAVE10" />
                {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Type</label>
                  <select {...register('type')} className={fieldClass}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed_amount">Fixed Amount (£)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Value</label>
                  <input {...register('value')} type="number" min="0" step="0.01" className={fieldClass} placeholder="10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Usage Limit (optional)</label>
                  <input {...register('usage_limit')} type="number" min="1" className={fieldClass} placeholder="∞" />
                </div>
                <div>
                  <label className={labelClass}>Expires (optional)</label>
                  <input {...register('expires_at')} type="date" className={fieldClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Min Order (pence, optional)</label>
                <input {...register('min_order_pence')} type="number" min="0" className={fieldClass} placeholder="2000 = £20" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('is_active')} type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
                {mode === 'edit' && (
                  <button type="button" onClick={deleteDiscount} className="text-sm text-red-600 hover:text-red-800">
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
