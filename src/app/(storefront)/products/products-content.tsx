'use client'

import { useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatGBPFromPence } from '@/lib/utils/currency'

const CATEGORIES = [
  { label: 'Clothing', value: 'clothing' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Home & Garden', value: 'home-garden' },
  { label: 'Sports', value: 'sports' },
  { label: 'Books', value: 'books' },
  { label: 'Toys', value: 'toys' },
]

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

const PLACEHOLDER_PRODUCTS = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  name: `Product ${i + 1}`,
  slug: `product-${i + 1}`,
  price_pence: 999 + i * 500,
  compare_at_price_pence: i % 3 === 0 ? 1999 + i * 500 : null,
  price_includes_vat: true,
  image_url: null as string | null,
  is_active: true,
  stock_quantity: i % 5 === 0 ? 0 : 10,
}))

const PAGE_SIZE = 12

export function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const category = searchParams.get('category') ?? ''
  const sort = searchParams.get('sort') ?? 'featured'
  const minPrice = searchParams.get('min_price') ?? ''
  const maxPrice = searchParams.get('max_price') ?? ''
  const inStock = searchParams.get('in_stock') === 'true'
  const page = Number(searchParams.get('page') ?? '1')

  const [filtersOpen, setFiltersOpen] = useState(false)

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      if (key !== 'page') params.delete('page')
      router.push(`/products?${params.toString()}`)
    },
    [searchParams, router]
  )

  const clearFilters = useCallback(() => {
    router.push('/products')
  }, [router])

  const hasActiveFilters = category || minPrice || maxPrice || inStock

  const filtered = PLACEHOLDER_PRODUCTS
    .filter((p) => !inStock || p.stock_quantity > 0)
    .filter((p) => !minPrice || p.price_pence >= Number(minPrice) * 100)
    .filter((p) => !maxPrice || p.price_pence <= Number(maxPrice) * 100)

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const FiltersPanel = (
    <div className="flex flex-col gap-6">
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="justify-start px-0 text-destructive">
          <X className="mr-1 h-3 w-3" />
          Clear all filters
        </Button>
      )}

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Category
        </p>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.value} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.value}`}
                checked={category === cat.value}
                onCheckedChange={(checked) =>
                  updateParam('category', checked ? cat.value : null)
                }
              />
              <Label htmlFor={`cat-${cat.value}`} className="cursor-pointer text-sm font-normal">
                {cat.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Price Range (£)
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            min={0}
            onChange={(e) => updateParam('min_price', e.target.value)}
            className="h-8 w-20 text-sm"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            min={0}
            onChange={(e) => updateParam('max_price', e.target.value)}
            className="h-8 w-20 text-sm"
          />
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        <Checkbox
          id="in-stock"
          checked={inStock}
          onCheckedChange={(checked) => updateParam('in_stock', checked ? 'true' : null)}
        />
        <Label htmlFor="in-stock" className="cursor-pointer text-sm font-normal">
          In stock only
        </Label>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Products</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} products</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => updateParam('sort', v)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-1 h-4 w-4 rounded-full p-0 text-[10px]">!</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">{FiltersPanel}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {category && (
            <Badge variant="secondary" className="gap-1">
              {CATEGORIES.find((c) => c.value === category)?.label ?? category}
              <button onClick={() => updateParam('category', null)} aria-label="Remove category filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(minPrice || maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              £{minPrice || '0'} – £{maxPrice || '∞'}
              <button
                onClick={() => {
                  updateParam('min_price', null)
                  updateParam('max_price', null)
                }}
                aria-label="Remove price filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {inStock && (
            <Badge variant="secondary" className="gap-1">
              In stock
              <button onClick={() => updateParam('in_stock', null)} aria-label="Remove stock filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <aside className="hidden lg:block">{FiltersPanel}</aside>

        <div className="lg:col-span-3">
          {paginated.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={(p) => updateParam('page', String(p))} />
          )}
        </div>
      </div>
    </div>
  )
}

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price_pence: number
    compare_at_price_pence: number | null
    price_includes_vat: boolean
    image_url: string | null
    stock_quantity: number
  }
}

function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock_quantity === 0
  const discountPercent = product.compare_at_price_pence
    ? Math.round(((product.compare_at_price_pence - product.price_pence) / product.compare_at_price_pence) * 100)
    : null

  return (
    <Card className={`group overflow-hidden border transition-all hover:shadow-md ${outOfStock ? 'opacity-70' : ''}`}>
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground/30">
              🛍️
            </div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}

          {discountPercent && !outOfStock && (
            <Badge className="absolute right-2 top-2 bg-green-600 hover:bg-green-600">
              -{discountPercent}%
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-tight transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-bold">{formatGBPFromPence(product.price_pence)}</span>
          {product.compare_at_price_pence && (
            <span className="text-xs text-muted-foreground line-through">
              {formatGBPFromPence(product.compare_at_price_pence)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {product.price_includes_vat ? 'inc. VAT' : 'exc. VAT'}
        </p>
      </CardContent>
    </Card>
  )
}

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
