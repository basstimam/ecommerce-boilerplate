import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { CmsPageForm } from './cms-page-form'

export const metadata = { title: 'Edit Page' }

export default async function AdminCmsPageEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (id === 'new') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Pages
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">New Page</h1>
        <CmsPageForm page={null} />
      </div>
    )
  }

  const supabase = await createClient()
  const { data: page } = await supabase.from('cms_pages').select('*').eq('id', id).single()
  if (!page) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/pages" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Pages
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Edit: {page.title}</h1>
      <CmsPageForm page={page} />
    </div>
  )
}
