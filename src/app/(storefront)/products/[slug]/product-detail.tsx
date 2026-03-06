'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Minus, Plus, Truck, RefreshCw, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useCartStore } from '@/stores/cart'
import { formatGBPFromPence } from '@/lib/utils/currency'
import type { ProductWithVariants, ProductImage } from '@/types/product'

const PLACEHOLDER_PRODUCT: ProductWithVariants & {
  product_images: ProductImage[]
  category_name?: string
} = {
  id: '1',
  name: 'Classic White Tee',
  slug: 'classic-white-tee',
  description:
    'A timeless classic crafted from 100% organic cotton. Soft, breathable, and built to last. Perfect for everyday wear.',
  short_description: '100% organic cotton, ethically sourced',
  price_pence: 2499,
  compare_at_price_pence: 3499,
  cost_price_pence: null,
  price_includes_vat: true,
  vat_rate: 0.2,
  category_id: 'clothing',
  category_name: 'Clothing',
  sku: 'CWT-001',
  barcode: null,
  stock_quantity: 15,
  track_inventory: true,
  allow_backorder: false,
  weight_grams: 200,
  dimensions: null,
  is_active: true,
  is_featured: true,
  tags: ['organic', 'cotton', 'basics'],
  meta_title: null,
  meta_description: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  product_images: [],
  product_variants: [
    { id: 'v1', product_id: '1', sku: 'CWT-001-S', options: { Size: 'S' }, price_pence: null, stock_quantity: 5, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'v2', product_id: '1', sku: 'CWT-001-M', options: { Size: 'M' }, price_pence: null, stock_quantity: 8, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'v3', product_id: '1', sku: 'CWT-001-L', options: { Size: 'L' }, price_pence: null, stock_quantity: 0, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'v4', product_id: '1', sku: 'CWT-001-XL', options: { Size: 'XL' }, price_pence: null, stock_quantity: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
}

const PLACEHOLDER_REVIEWS = [
  { id: '1', author: 'Sarah M.', rating: 5, date: '2025-11-12', body: 'Absolutely love this! The quality is outstanding and it fits perfectly.' },
  { id: '2', author: 'James T.', rating: 4, date: '2025-10-30', body: 'Great product, very comfortable. Delivery was fast too.' },
  { id: '3', author: 'Emma K.', rating: 5, date: '2025-10-18', body: 'Bought two of these — they wash well and keep their shape.' },
]

interface Props {
  slug: string
}

export function ProductDetail({ slug: _slug }: Props) {
  const product = PLACEHOLDER_PRODUCT
  const addItem = useCartStore((s) => s.addItem)

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)

  const variantOptionKeys = Array.from(
    new Set(product.product_variants.flatMap((v) => Object.keys(v.options)))
  )

  const selectedVariant = product.product_variants.find((v) =>
    Object.entries(selectedVariants).every(([k, val]) => v.options[k] === val)
  ) ?? null

  const effectivePrice = selectedVariant?.price_pence ?? product.price_pence
  const outOfStock = selectedVariant
    ? selectedVariant.stock_quantity === 0
    : product.stock_quantity === 0

  const discountPercent = product.compare_at_price_pence
    ? Math.round(((product.compare_at_price_pence - effectivePrice) / product.compare_at_price_pence) * 100)
    : null

  const allVariantsSelected = variantOptionKeys.every((key) => selectedVariants[key])

  function handleAddToCart() {
    if (variantOptionKeys.length > 0 && !allVariantsSelected) {
      toast.error('Please select all options')
      return
    }

    addItem({
      product_id: product.id,
      variant_id: selectedVariant?.id,
      product_name: product.name,
      variant_options: selectedVariant?.options,
      sku: selectedVariant?.sku ?? product.sku,
      price_pence: effectivePrice,
      quantity,
      vat_rate: product.vat_rate,
      price_includes_vat: product.price_includes_vat,
      image_url: product.product_images[0]?.url,
      slug: product.slug,
    })

    toast.success('Added to cart', { description: `${product.name} × ${quantity}` })
  }

  const images = product.product_images.length > 0
    ? product.product_images
    : [{ id: 'placeholder', url: null, alt_text: product.name, sort_order: 0, is_primary: true, product_id: product.id, created_at: '' }]

  const avgRating = PLACEHOLDER_REVIEWS.reduce((s, r) => s + r.rating, 0) / PLACEHOLDER_REVIEWS.length

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">Products</Link>
        {product.category_name && (
          <>
            <span>/</span>
            <Link href={`/products?category=${product.category_id}`} className="hover:text-foreground">
              {product.category_name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ImageGallery
          images={images as { id: string; url: string | null; alt_text: string | null }[]}
          productName={product.name}
          currentIndex={selectedImageIndex}
          onIndexChange={setSelectedImageIndex}
        />

        <div className="flex flex-col gap-5">
          <div>
            {product.tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>

            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} ({PLACEHOLDER_REVIEWS.length} reviews)
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatGBPFromPence(effectivePrice)}</span>
              {product.compare_at_price_pence && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatGBPFromPence(product.compare_at_price_pence)}
                </span>
              )}
              {discountPercent && (
                <Badge className="bg-green-600 hover:bg-green-600">Save {discountPercent}%</Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {product.price_includes_vat
                ? `Price includes VAT (${(product.vat_rate * 100).toFixed(0)}%)`
                : `+ VAT (${(product.vat_rate * 100).toFixed(0)}%)`}
            </p>
          </div>

          {product.short_description && (
            <p className="text-muted-foreground">{product.short_description}</p>
          )}

          {variantOptionKeys.map((optionKey) => {
            const values = Array.from(
              new Set(product.product_variants.map((v) => v.options[optionKey]).filter(Boolean))
            )
            return (
              <div key={optionKey}>
                <p className="mb-2 text-sm font-semibold">
                  {optionKey}:{' '}
                  <span className="font-normal text-muted-foreground">
                    {selectedVariants[optionKey] ?? 'Select'}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {values.map((val) => {
                    const matchingVariant = product.product_variants.find((v) => v.options[optionKey] === val)
                    const isOutOfStock = matchingVariant?.stock_quantity === 0
                    const isSelected = selectedVariants[optionKey] === val

                    return (
                      <Button
                        key={val}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        disabled={isOutOfStock}
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [optionKey]: val }))}
                        className={isOutOfStock ? 'opacity-40 line-through' : ''}
                      >
                        {val}
                        {isOutOfStock && ' (OOS)'}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div>
            <p className="mb-2 text-sm font-semibold">Quantity</p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={outOfStock}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setWishlisted((w) => !w)}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          {outOfStock && (
            <p className="text-sm text-destructive">
              This item is currently out of stock.
            </p>
          )}

          <Separator />

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col items-center gap-1">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <p className="text-xs font-medium">Free over £50</p>
              <p className="text-xs text-muted-foreground">UK delivery</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              <p className="text-xs font-medium">30-day returns</p>
              <p className="text-xs text-muted-foreground">Hassle-free</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <p className="text-xs font-medium">Secure payment</p>
              <p className="text-xs text-muted-foreground">Via Stripe</p>
            </div>
          </div>

          {product.sku && (
            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
          )}
        </div>
      </div>

      <div className="mt-16">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({PLACEHOLDER_REVIEWS.length})</TabsTrigger>
            <TabsTrigger value="delivery">Delivery & Returns</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6 prose max-w-none text-sm leading-relaxed text-muted-foreground">
            <p>{product.description}</p>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="flex flex-col gap-6">
              {PLACEHOLDER_REVIEWS.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-sm">{review.author}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-6 text-sm text-muted-foreground">
            <div className="flex flex-col gap-4 max-w-xl">
              <div>
                <h3 className="font-semibold text-foreground mb-1">UK Delivery</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Standard (3–5 working days): £3.99</li>
                  <li>Express (1–2 working days): £6.99</li>
                  <li>Free standard delivery on orders over £50</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Returns</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>30-day hassle-free returns</li>
                  <li>Items must be unused and in original packaging</li>
                  <li>Free returns for faulty items</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface ImageGalleryProps {
  images: { id: string; url: string | null; alt_text: string | null }[]
  productName: string
  currentIndex: number
  onIndexChange: (i: number) => void
}

function ImageGallery({ images, productName, currentIndex, onIndexChange }: ImageGalleryProps) {
  const current = images[currentIndex]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {current?.url ? (
          <img
            src={current.url}
            alt={current.alt_text ?? productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-8xl text-muted-foreground/20">
            🛍️
          </div>
        )}

        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80"
              onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80"
              onClick={() => onIndexChange((currentIndex + 1) % images.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => onIndexChange(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${i === currentIndex ? 'border-primary' : 'border-transparent'}`}
            >
              {img.url ? (
                <img src={img.url} alt={img.alt_text ?? productName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xl">🛍️</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
