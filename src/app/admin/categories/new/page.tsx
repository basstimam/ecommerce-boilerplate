import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { CategoryForm } from '../[id]/category-form'

export const metadata = { title: 'New Category' }

export default async function AdminCategoryNewPage() {
  const supabase = await createClient()

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
        <h1 className="text-2xl font-bold text-gray-900">Add Category</h1>
      </div>
      <CategoryForm category={null} parentOptions={allCategories ?? []} />
    </div>
  )
}
