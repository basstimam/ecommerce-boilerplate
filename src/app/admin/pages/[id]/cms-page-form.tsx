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

const pageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Lowercase, numbers, hyphens only'),
  content: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().max(160, 'Keep under 160 chars for SEO').optional(),
  is_published: z.boolean().default(true),
})

type PageForm = z.infer<typeof pageSchema>

interface CmsPage {
  id: string
  title: string
  slug: string
  content?: string | null
  meta_title?: string | null
  meta_description?: string | null
  is_published: boolean
}

export function CmsPageForm({ page }: { page: CmsPage | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PageForm>({
    resolver: zodResolver(pageSchema) as unknown as Resolver<PageForm>,
    defaultValues: page
      ? {
          title: page.title,
          slug: page.slug,
          content: page.content ?? '',
          meta_title: page.meta_title ?? '',
          meta_description: page.meta_description ?? '',
          is_published: page.is_published,
        }
      : { is_published: true },
  })

  const onSubmit = async (data: PageForm) => {
    setLoading(true)
    try {
      const payload = { ...data, updated_at: new Date().toISOString() }

      if (page) {
        const { error } = await supabase.from('cms_pages').update(payload).eq('id', page.id)
        if (error) throw error
        toast.success('Page updated')
      } else {
        const { error } = await supabase.from('cms_pages').insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
        toast.success('Page created')
        router.push('/admin/pages')
      }
      router.refresh()
    } catch (err) {
      toast.error('Failed to save', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const deletePage = async () => {
    if (!page || !confirm('Delete this page?')) return
    setDeleting(true)
    const { error } = await supabase.from('cms_pages').delete().eq('id', page.id)
    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Page deleted')
      router.push('/admin/pages')
    }
    setDeleting(false)
  }

  const fieldClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className={labelClass}>Page Title</label>
          <input
            {...register('title')}
            className={fieldClass}
            placeholder="About Us"
            onChange={(e) => {
              register('title').onChange(e)
              if (!page) setValue('slug', slugify(e.target.value))
            }}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className={labelClass}>URL Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">/pages/</span>
            <input {...register('slug')} className={`${fieldClass} flex-1`} placeholder="about-us" />
          </div>
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <label className={labelClass}>Content (HTML)</label>
        <p className="text-xs text-gray-400 mb-2">Write HTML content. To integrate a rich text editor (TipTap, Quill), replace this textarea.</p>
        <textarea
          {...register('content')}
          rows={18}
          className={`${fieldClass} font-mono text-xs resize-y`}
          placeholder="<h2>Title</h2><p>Your content here...</p>"
        />
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">SEO</h2>
        <div>
          <label className={labelClass}>Meta Title (optional)</label>
          <input {...register('meta_title')} className={fieldClass} placeholder="Defaults to page title" />
        </div>
        <div>
          <label className={labelClass}>Meta Description (optional, max 160 chars)</label>
          <textarea {...register('meta_description')} rows={3} className={`${fieldClass} resize-none`} placeholder="Brief description for search engines..." />
          {errors.meta_description && <p className="mt-1 text-xs text-red-600">{errors.meta_description.message}</p>}
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input {...register('is_published')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-gray-900" />
          <span className="text-sm text-gray-700">Published (visible on storefront)</span>
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
            {page ? 'Save Changes' : 'Create Page'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
        {page && (
          <button
            type="button"
            onClick={deletePage}
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
