'use client'

import Link from 'next/link'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useWishlistStore } from '@/stores/wishlist'
import { useCartStore } from '@/stores/cart'
import { formatGBPFromPence } from '@/lib/utils/currency'

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const addToCart = useCartStore((s) => s.addItem)

  function handleMoveToCart(item: (typeof items)[number]) {
    addToCart({
      product_id: item.product_id,
      product_name: item.product_name,
      sku: item.sku,
      price_pence: item.price_pence,
      quantity: 1,
      vat_rate: item.vat_rate,
      price_includes_vat: item.price_includes_vat,
      image_url: item.image_url,
      slug: item.slug,
    })
    removeItem(item.product_id)
    toast.success('Moved to cart', { description: item.product_name })
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center px-4 py-24 text-center">
        <Heart className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-bold">Your wishlist is empty</h1>
        <p className="mt-2 text-muted-foreground">Save items you love here and shop them later.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Wishlist ({items.length})</h1>
        <Button variant="ghost" size="sm" onClick={clearWishlist} className="text-muted-foreground">
          Clear all
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <Card key={item.product_id} className="group overflow-hidden">
            <Link href={`/products/${item.slug}`}>
              <div className="relative aspect-square overflow-hidden bg-muted">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl text-muted-foreground/20">
                    🛍️
                  </div>
                )}
              </div>
            </Link>

            <CardContent className="p-4">
              <Link href={`/products/${item.slug}`}>
                <h3 className="line-clamp-2 font-medium transition-colors hover:text-primary">
                  {item.product_name}
                </h3>
              </Link>
              <p className="mt-1 font-bold">{formatGBPFromPence(item.price_pence)}</p>
              <p className="text-xs text-muted-foreground">
                {item.price_includes_vat ? 'inc. VAT' : 'exc. VAT'}
              </p>

              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleMoveToCart(item)}
                >
                  <ShoppingCart className="mr-1 h-3 w-3" />
                  Add to Cart
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeItem(item.product_id)}
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
