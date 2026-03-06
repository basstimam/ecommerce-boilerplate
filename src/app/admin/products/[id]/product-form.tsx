'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils/slug'
import { Loader2, Trash2 } from 'lucide-react'

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug: lowercase, numbers, hyphens only'),
  description: z.string().optional(),
  price_pence: z.number({ coerce: true }).min(1, 'Price is required'),
  compare_at_price_pence: z.number({ coerce: true }).optional(),
  sku: z.string().optional(),
  stock_quantity: z.number({ coerce: true }).min(0).default(0),
  is_active: z.boolean().default(true),
  vat_rate: z.number({ coerce: true }).default(20),
  weight_grams: z.number({ coerce: true }).optional(),
  category_id: z.string().optional(),
  short_description: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductRecord {
  id: string
  name: string
  slug: string
  description?: string | null
  price_pence: number
  compare_at_price_pence?: number | null
  sku?: string | null
  stock_quantity?: number | null
  is_active: boolean
  vat_rate?: number | null
  weight_grams?: number | null
  category_id?: string | null
  short_description?: string | null
}

export function ProductForm({ product }: { product: ProductRecord | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          price_pence: product.price_pence,
          compare_at_price_pence: product.compare_at_price_pence ?? undefined,
          sku: product.sku ?? '',
          stock_quantity: product.stock_quantity ?? 0,
          is_active: product.is_active,
          vat_rate: product.vat_rate ?? 20,
          weight_grams: product.weight_grams ?? undefined,
          short_description: product.short_description ?? '',
        }
      : { is_active: true, stock_quantity: 0, vat_rate: 20 },
  })

  const nameValue = watch('name')

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const payload = {
        ...data,
        compare_at_price_pence: data.compare_at_price_pence ?? null,
        updated_at: new Date().toISOString(),
      }

      if (product) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id)
        if (error) throw error
        toast.success('Product updated')
      } else {
        const { error } = await supabase.from('products').insert({ ...payload, created_at: new Date().toISOString() })
        if (error) throw error
        toast.success('Product created')
        router.push('/admin/products')
      }
      router.refresh()
    } catch (err) {
      toast.error('Failed to save product', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async () => {
    if (!product || !confirm('Delete this product? This cannot be undone.')) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('products').delete().eq('id', product.id)
      if (error) throw error
      toast.success('Product deleted')
      router.push('/admin/products')
    } catch (err) {
      toast.error('Failed to delete', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setDeleting(false)
    }
  }

  const fieldClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
  const errorClass = 'mt-1 text-xs text-red-600'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>

        <div>
          <label className={labelClass}>Product Name</label>
          <input
            {...register('name')}
            className={fieldClass}
            placeholder="e.g. Premium Leather Wallet"
            onChange={(e) => {
              register('name').onChange(e)
              if (!product) setValue('slug', generateSlug(e.target.value))
            }}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Slug (URL)</label>
          <input {...register('slug')} className={fieldClass} placeholder="premium-leather-wallet" />
          {errors.slug && <p className={errorClass}>{errors.slug.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Short Description</label>
          <input {...register('short_description')} className={fieldClass} placeholder="Brief product summary (shown in listings)" />
        </div>

        <div>
          <label className={labelClass}>Full Description</label>
          <textarea
            {...register('description')}
            rows={5}
            className={`${fieldClass} resize-none`}
            placeholder="Detailed product description..."
          />
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Pricing & Stock</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Price (pence)</label>
            <input {...register('price_pence')} type="number" min="0" className={fieldClass} placeholder="1999 = £19.99" />
            {errors.price_pence && <p className={errorClass}>{errors.price_pence.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Compare-at Price (pence, optional)</label>
            <input {...register('compare_at_price_pence')} type="number" min="0" className={fieldClass} placeholder="2499 = £24.99" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>SKU</label>
            <input {...register('sku')} className={fieldClass} placeholder="SKU-001" />
          </div>
          <div>
            <label className={labelClass}>Stock Quantity</label>
            <input {...register('stock_quantity')} type="number" min="0" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>VAT Rate (%)</label>
            <select {...register('vat_rate')} className={fieldClass}>
              <option value={20}>20% Standard</option>
              <option value={5}>5% Reduced</option>
              <option value={0}>0% Zero-rated</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Weight (grams, optional)</label>
          <input {...register('weight_grams')} type="number" min="0" className={`${fieldClass} max-w-xs`} placeholder="250" />
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Visibility</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input {...register('is_active')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-gray-900" />
          <span className="text-sm text-gray-700">Active (visible in storefront)</span>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {product ? 'Save Changes' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        {product && (
          <button
            type="button"
            onClick={deleteProduct}
            disabled={deleting}
            className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete
          </button>
        )}
      </div>
    </form>
  )
}
