'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Minus, Plus, Truck, RefreshCw, Shield, BadgeCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useCartStore } from '@/stores/cart'
import { formatGBPFromPence } from '@/lib/utils/currency'
import type { ProductWithVariants } from '@/types/product'

export interface ReviewData {
  id: string
  rating: number
  title: string | null
  body: string | null
  is_verified: boolean
  created_at: string
  reviewer_name: string
}

type ProductDetailData = ProductWithVariants & { category_name?: string | null; category_slug?: string | null }

interface Props {
  product: ProductDetailData
  reviews: ReviewData[]
}

export function ProductDetail({ product, reviews }: Props) {
  const addItem = useCartStore((s) => s.addItem)

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

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

    toast.success('Added to cart', { description: `${product.name} \u00d7 ${quantity}` })
  }

  const images = product.product_images.length > 0
    ? product.product_images
    : [{ id: 'placeholder', url: null, alt_text: product.name, sort_order: 0, is_primary: true, product_id: product.id, created_at: '' }]

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
        {product.category_name && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${product.category_slug ?? product.category_id}`}
              className="hover:text-foreground transition-colors"
            >
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
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {reviews.length > 0 ? `${avgRating.toFixed(1)} (${reviews.length} review${reviews.length !== 1 ? 's' : ''})` : 'No reviews yet'}
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
              {discountPercent && discountPercent > 0 && (
                <Badge className="bg-green-600 hover:bg-green-600">Save {discountPercent}%</Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Price includes VAT ({Number(product.vat_rate).toFixed(0)}%)
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
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium tabular-nums">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
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
              <Heart className={`h-5 w-5 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
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
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="delivery">Delivery &amp; Returns</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6 prose max-w-none text-sm leading-relaxed text-muted-foreground">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p className="italic">No description available.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  {reviews.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {avgRating.toFixed(1)} out of 5 &middot; {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewForm((v) => !v)}
                >
                  {showReviewForm ? 'Cancel' : 'Write a Review'}
                </Button>
              </div>

              {showReviewForm && (
                <ReviewForm
                  productId={product.id}
                  onSuccess={() => setShowReviewForm(false)}
                />
              )}

              {reviews.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                reviews.map((review) => (
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
                          <span className="text-sm font-medium">{review.reviewer_name}</span>
                          {review.is_verified && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <BadgeCheck className="h-3 w-3" />
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatReviewDate(review.created_at)}
                        </span>
                      </div>
                      {review.title && (
                        <p className="mt-2 text-sm font-semibold">{review.title}</p>
                      )}
                      {review.body && (
                        <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-6 text-sm text-muted-foreground">
            <div className="flex flex-col gap-4 max-w-xl">
              <div>
                <h3 className="font-semibold text-foreground mb-1">UK Delivery</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Standard (3&ndash;5 working days): £3.99</li>
                  <li>Express (1&ndash;2 working days): £6.99</li>
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

function formatReviewDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface ReviewFormProps {
  productId: string
  onSuccess: () => void
}

function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          rating,
          ...(title.trim() && { title: title.trim() }),
          ...(body.trim() && { body: body.trim() }),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to submit review')
        return
      }

      toast.success('Review submitted for approval')
      setRating(0)
      setTitle('')
      setBody('')
      onSuccess()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-2 block text-sm font-medium">Rating</Label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5"
                  aria-label={`Rate ${i + 1} star${i > 0 ? 's' : ''}`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      i < (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="review-title" className="mb-2 block text-sm font-medium">
              Title <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarise your experience"
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="review-body" className="mb-2 block text-sm font-medium">
              Review <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell others what you thought of this product..."
              maxLength={2000}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button type="submit" disabled={submitting || rating === 0} className="self-start">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>
        </form>
      </CardContent>
    </Card>
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
          <Image
            src={current.url}
            alt={current.alt_text ?? productName}
            width={600}
            height={600}
            className="h-full w-full object-cover"
            unoptimized
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
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100 transition-opacity"
              onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100 transition-opacity"
              onClick={() => onIndexChange((currentIndex + 1) % images.length)}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => onIndexChange(i)}
              aria-label={`View image ${i + 1}`}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === currentIndex
                  ? 'border-primary'
                  : 'border-transparent hover:border-muted-foreground/30'
              }`}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={img.alt_text ?? productName}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xl">
                  🛍️
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
