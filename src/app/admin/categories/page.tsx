import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Search, Plus, FolderTree } from 'lucide-react'

export const metadata = { title: 'Admin Categories' }

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>
}) {
  const { q, page, status } = await searchParams
  const supabase = await createClient()

  const pageNum = Math.max(1, parseInt(page ?? '1'))
  const pageSize = 20
  const from = (pageNum - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('categories')
    .select('id, name, slug, parent_id, sort_order, is_active, created_at', { count: 'exact' })
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
    .range(from, to)

  if (q) query = query.ilike('name', `%${q}%`)
  if (status === 'active') query = query.eq('is_active', true)
  if (status === 'inactive') query = query.eq('is_active', false)

  const { data: categories, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  const { data: allCategories } = await supabase
    .from('categories')
    .select('id, name')

  const parentMap = new Map((allCategories ?? []).map((c) => [c.id, c.name]))

  const { data: productCounts } = await supabase
    .from('products')
    .select('category_id')

  const countMap = new Map<string, number>()
  for (const p of productCounts ?? []) {
    if (p.category_id) {
      countMap.set(p.category_id, (countMap.get(p.category_id) ?? 0) + 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">{count ?? 0} categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <form>
            <input
              name="q"
              defaultValue={q}
              type="search"
              placeholder="Search categories..."
              className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            {status && <input type="hidden" name="status" value={status} />}
          </form>
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ].map(({ value, label }) => (
            <Link
              key={value}
              href={`?status=${value}${q ? `&q=${q}` : ''}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                (status ?? 'all') === value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(categories ?? []).map((category) => {
              const parentName = category.parent_id ? parentMap.get(category.parent_id) : null
              const productCount = countMap.get(category.id) ?? 0
              return (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FolderTree className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">
                          {parentName && (
                            <span className="text-gray-400 font-normal">{parentName} / </span>
                          )}
                          {category.name}
                        </p>
                        <p className="text-xs text-gray-400">Order: {category.sort_order}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{category.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-gray-900">{productCount}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="text-xs font-medium text-gray-600 hover:text-gray-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
            {(categories ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">Page {pageNum} of {totalPages}</p>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link
                href={`?page=${pageNum - 1}${status ? `&status=${status}` : ''}${q ? `&q=${q}` : ''}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {pageNum < totalPages && (
              <Link
                href={`?page=${pageNum + 1}${status ? `&status=${status}` : ''}${q ? `&q=${q}` : ''}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
