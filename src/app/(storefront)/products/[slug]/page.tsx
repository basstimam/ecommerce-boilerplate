import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductDetail } from './product-detail'
import type { ProductVariant } from '@/types/product'
import type { ReviewData } from './product-detail'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: product } = await supabase
    .from('products')
    .select('name, short_description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.name,
    description: product.short_description ?? 'View product details and add to cart.',
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  if (!slug) notFound()

  const supabase = createAdminClient()

  const { data: productRaw } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!productRaw) notFound()

  const imageUrls: string[] = productRaw.images ?? []
  const productImages = imageUrls.map((url, i) => ({
    id: `img-${i}`,
    product_id: productRaw.id,
    url,
    alt_text: productRaw.name,
    sort_order: i,
    is_primary: i === 0,
    created_at: productRaw.created_at,
  }))

  const [{ data: productVariants }, { data: categoryData }, { data: rawReviews }] =
    await Promise.all([
      supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productRaw.id)
        .eq('is_active', true)
        .order('created_at'),
      productRaw.category_id
        ? supabase
            .from('categories')
            .select('name, slug')
            .eq('id', productRaw.category_id)
            .single()
        : Promise.resolve({ data: null as { name: string; slug: string } | null, error: null }),
      supabase
        .from('product_reviews')
        .select('id, rating, title, body, is_verified, created_at, user_id')
        .eq('product_id', productRaw.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false }),
    ])

  let reviews: ReviewData[] = []
  if (rawReviews && rawReviews.length > 0) {
    const userIds = [...new Set(rawReviews.map((r) => r.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)

    const profileMap = (profiles ?? []).reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = p.full_name ?? 'Anonymous'
      return acc
    }, {})

    reviews = rawReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      is_verified: r.is_verified,
      created_at: r.created_at,
      reviewer_name: profileMap[r.user_id] ?? 'Anonymous',
    }))
  }

  const product = {
    ...productRaw,
    product_images: productImages,
    product_variants: (productVariants ?? []) as ProductVariant[],
    category_name: categoryData?.name ?? null,
    category_slug: categoryData?.slug ?? null,
  }

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetail product={product} reviews={reviews} />
    </Suspense>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-xl bg-muted" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded bg-muted" />
          <div className="h-12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
