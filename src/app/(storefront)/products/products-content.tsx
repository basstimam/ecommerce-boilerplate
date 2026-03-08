'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SlidersHorizontal, X, Search } from 'lucide-react'
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

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

interface ProductData {
  id: string
  name: string
  slug: string
  price_pence: number
  compare_at_price_pence: number | null
  images: string[]
  stock_quantity: number
  is_featured: boolean
  created_at: string
  category_id: string | null
}

interface CategoryOption {
  label: string
  value: string
}

interface ActiveFilters {
  category: string
  sort: string
  minPrice: string
  maxPrice: string
  inStock: boolean
  q: string
}

interface ProductsContentProps {
  products: ProductData[]
  categories: CategoryOption[]
  totalCount: number
  currentPage: number
  totalPages: number
  activeFilters: ActiveFilters
}

export function ProductsContent({
  products,
  categories,
  totalCount,
  currentPage,
  totalPages,
  activeFilters,
}: ProductsContentProps) {
  const router = useRouter()
  const { category, sort, minPrice, maxPrice, inStock, q } = activeFilters

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(q)

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams()

      const currentFilters: Record<string, string> = {}
      if (category) currentFilters.category = category
      if (sort && sort !== 'featured') currentFilters.sort = sort
      if (minPrice) currentFilters.min_price = minPrice
      if (maxPrice) currentFilters.max_price = maxPrice
      if (inStock) currentFilters.in_stock = 'true'
      if (q) currentFilters.q = q

      Object.entries(currentFilters).forEach(([k, v]) => params.set(k, v))

      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }

      if (key !== 'page') params.delete('page')

      const qs = params.toString()
      router.push(qs ? `/products?${qs}` : '/products')
    },
    [category, sort, minPrice, maxPrice, inStock, q, router]
  )

  const clearFilters = useCallback(() => {
    router.push('/products')
  }, [router])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      updateParam('q', searchValue || null)
    },
    [searchValue, updateParam]
  )

  const hasActiveFilters = category || minPrice || maxPrice || inStock || q

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
          {categories.map((cat) => (
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
          Price Range (&pound;)
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            min={0}
            onBlur={(e) => updateParam('min_price', e.target.value || null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParam('min_price', e.currentTarget.value || null)
            }}
            className="h-8 w-20 text-sm"
          />
          <span className="text-muted-foreground">&ndash;</span>
          <Input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            min={0}
            onBlur={(e) => updateParam('max_price', e.target.value || null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParam('max_price', e.currentTarget.value || null)
            }}
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Products</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'product' : 'products'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-9 w-48 pl-8 text-sm"
            />
          </form>

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
          {q && (
            <Badge variant="secondary" className="gap-1">
              Search: &ldquo;{q}&rdquo;
              <button onClick={() => { setSearchValue(''); updateParam('q', null) }} aria-label="Remove search filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="gap-1">
              {categories.find((c) => c.value === category)?.label ?? category}
              <button onClick={() => updateParam('category', null)} aria-label="Remove category filter">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(minPrice || maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              &pound;{minPrice || '0'} &ndash; &pound;{maxPrice || '\u221E'}
              <button
                onClick={() => {
                  updateParam('min_price', null)
                  setTimeout(() => updateParam('max_price', null), 0)
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
          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={(p) => updateParam('page', String(p))} />
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
    images: string[]
    stock_quantity: number
    is_featured?: boolean
  }
}

function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock_quantity === 0
  const imageUrl = product.images?.[0] ?? null
  const discountPercent = product.compare_at_price_pence
    ? Math.round(((product.compare_at_price_pence - product.price_pence) / product.compare_at_price_pence) * 100)
    : null

  return (
    <Card className={`group overflow-hidden border transition-all hover:shadow-md ${outOfStock ? 'opacity-70' : ''}`}>
      <Link href={`/products/${product.slug}`}>
         <div className="relative aspect-square overflow-hidden bg-muted">
           {imageUrl ? (
             <Image
               src={imageUrl}
               alt={product.name}
               width={400}
               height={400}
               className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
               unoptimized
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
          inc. VAT
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
