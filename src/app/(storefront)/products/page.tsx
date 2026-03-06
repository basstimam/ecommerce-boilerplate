import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductsContent } from './products-content'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our full range of products with free UK delivery over £50.',
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsContent />
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
