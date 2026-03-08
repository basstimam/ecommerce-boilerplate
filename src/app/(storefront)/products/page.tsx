import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ProductsContent } from './products-content'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our full range of products with free UK delivery over £50.',
}

const PAGE_SIZE = 12

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    sort?: string
    min_price?: string
    max_price?: string
    in_stock?: string
    page?: string
    q?: string
  }>
}

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams

  const category = searchParams.category ?? ''
  const sort = searchParams.sort ?? 'featured'
  const minPrice = searchParams.min_price ?? ''
  const maxPrice = searchParams.max_price ?? ''
  const inStock = searchParams.in_stock === 'true'
  const q = searchParams.q ?? ''
  const page = Math.max(1, Number(searchParams.page ?? '1'))

  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order')

  let query = supabase
    .from('products')
    .select(
      'id, name, slug, price_pence, compare_at_price_pence, images, stock_quantity, is_featured, created_at, category_id',
      { count: 'exact' }
    )
    .eq('is_active', true)

  if (category) {
    const matchedCategory = (categories ?? []).find((c) => c.slug === category)
    if (matchedCategory) {
      query = query.eq('category_id', matchedCategory.id)
    }
  }

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  // Price stored as pence, user enters pounds — convert before filtering
  if (minPrice) {
    const minPence = Math.round(Number(minPrice) * 100)
    if (!isNaN(minPence)) {
      query = query.gte('price_pence', minPence)
    }
  }
  if (maxPrice) {
    const maxPence = Math.round(Number(maxPrice) * 100)
    if (!isNaN(maxPence)) {
      query = query.lte('price_pence', maxPence)
    }
  }

  if (inStock) {
    query = query.gt('stock_quantity', 0)
  }

  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'price_asc':
      query = query.order('price_pence', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price_pence', { ascending: false })
      break
    case 'featured':
    default:
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
      break
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  query = query.range(from, to)

  const { data: products, count } = await query

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsContent
        products={products ?? []}
        categories={(categories ?? []).map((c) => ({ label: c.name, value: c.slug }))}
        totalCount={totalCount}
        currentPage={page}
        totalPages={totalPages}
        activeFilters={{ category, sort, minPrice, maxPrice, inStock, q }}
      />
    </Suspense>
  )
}

function ProductsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
