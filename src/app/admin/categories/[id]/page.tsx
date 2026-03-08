import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { CategoryForm } from './category-form'

export const metadata = { title: 'Edit Category' }

export default async function AdminCategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: category } = await supabase.from('categories').select('*').eq('id', id).single()
  if (!category) notFound()

  const { data: allCategories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Categories
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
        <p className="mt-1 text-sm text-gray-500">{category.name}</p>
      </div>
      <CategoryForm category={category} parentOptions={allCategories ?? []} />
    </div>
  )
}
