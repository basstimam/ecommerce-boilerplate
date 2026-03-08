'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/slug'
import { Loader2, Trash2 } from 'lucide-react'
import { auditCategoryAction } from '../actions'

const categorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug: lowercase, numbers, hyphens only'),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  sort_order: z.number().min(0).default(0),
  is_active: z.boolean().default(true),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryRecord {
  id: string
  name: string
  slug: string
  description?: string | null
  parent_id?: string | null
  sort_order: number
  is_active: boolean
}

interface ParentOption {
  id: string
  name: string
}

export function CategoryForm({
  category,
  parentOptions,
}: {
  category: CategoryRecord | null
  parentOptions: ParentOption[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const availableParents = category
    ? parentOptions.filter((p) => p.id !== category.id)
    : parentOptions

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as unknown as Resolver<CategoryFormData>,
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description ?? '',
          parent_id: category.parent_id ?? '',
          sort_order: category.sort_order,
          is_active: category.is_active,
        }
      : { is_active: true, sort_order: 0 },
  })

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        parent_id: data.parent_id || null,
        sort_order: data.sort_order,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      }

      if (category) {
        const { error } = await supabase.from('categories').update(payload).eq('id', category.id)
        if (error) throw error

        await auditCategoryAction({
          admin_id: user.id,
          admin_email: user.email ?? '',
          action: 'category.updated',
          entity_type: 'category',
          entity_id: category.id,
          changes: {
            name: { old: category.name, new: data.name },
            slug: { old: category.slug, new: data.slug },
            is_active: { old: category.is_active, new: data.is_active },
          },
        })

        toast.success('Category updated')
      } else {
        const { data: inserted, error } = await supabase
          .from('categories')
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select('id')
          .single()
        if (error) throw error

        await auditCategoryAction({
          admin_id: user.id,
          admin_email: user.email ?? '',
          action: 'category.created',
          entity_type: 'category',
          entity_id: inserted.id,
          changes: null,
        })

        toast.success('Category created')
        router.push('/admin/categories')
      }
      router.refresh()
    } catch (err) {
      toast.error('Failed to save category', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async () => {
    if (!category || !confirm('Delete this category? This cannot be undone.')) return
    setDeleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', category.id)

      if ((count ?? 0) > 0) {
        toast.error('Cannot delete category with associated products')
        setDeleting(false)
        return
      }

      const { error } = await supabase.from('categories').delete().eq('id', category.id)
      if (error) throw error

      await auditCategoryAction({
        admin_id: user.id,
        admin_email: user.email ?? '',
        action: 'category.deleted',
        entity_type: 'category',
        entity_id: category.id,
        changes: null,
      })

      toast.success('Category deleted')
      router.push('/admin/categories')
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
          <label className={labelClass}>Category Name</label>
          <input
            {...register('name')}
            className={fieldClass}
            placeholder="e.g. Electronics"
            onChange={(e) => {
              register('name').onChange(e)
              if (!category) setValue('slug', slugify(e.target.value))
            }}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Slug (URL)</label>
          <input {...register('slug')} className={fieldClass} placeholder="electronics" />
          {errors.slug && <p className={errorClass}>{errors.slug.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className={`${fieldClass} resize-none`}
            placeholder="Category description..."
          />
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Organisation</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Parent Category</label>
            <select {...register('parent_id')} className={fieldClass}>
              <option value="">None (top-level)</option>
              {availableParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Sort Order</label>
            <input
              {...register('sort_order', { valueAsNumber: true })}
              type="number"
              min="0"
              className={fieldClass}
              placeholder="0"
            />
            {errors.sort_order && <p className={errorClass}>{errors.sort_order.message}</p>}
          </div>
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
            {category ? 'Save Changes' : 'Create Category'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        {category && (
          <button
            type="button"
            onClick={deleteCategory}
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
