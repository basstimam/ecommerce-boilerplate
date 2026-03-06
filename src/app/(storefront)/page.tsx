import Link from 'next/link'
import { ArrowRight, Shield, Truck, RefreshCw, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { NewsletterForm } from '@/components/shared/newsletter-form'
import { formatGBPFromPence } from '@/lib/utils/currency'

const FEATURED_CATEGORIES = [
  { name: 'Clothing', slug: 'clothing', description: 'Fashion for every occasion', emoji: '👕' },
  { name: 'Electronics', slug: 'electronics', description: 'Gadgets & tech essentials', emoji: '💻' },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Make your space shine', emoji: '🏡' },
  { name: 'Sports', slug: 'sports', description: 'Gear up and get active', emoji: '⚽' },
]

const FEATURED_PRODUCTS = [
  {
    id: '1',
    name: 'Classic White Tee',
    slug: 'classic-white-tee',
    price_pence: 2499,
    compare_at_price_pence: 3499,
    price_includes_vat: true,
    is_featured: true,
    image_url: null as string | null,
    badge: 'Bestseller',
  },
  {
    id: '2',
    name: 'Wireless Earbuds Pro',
    slug: 'wireless-earbuds-pro',
    price_pence: 7999,
    compare_at_price_pence: null,
    price_includes_vat: true,
    is_featured: true,
    image_url: null as string | null,
    badge: 'New',
  },
  {
    id: '3',
    name: 'Ceramic Mug Set',
    slug: 'ceramic-mug-set',
    price_pence: 1999,
    compare_at_price_pence: null,
    price_includes_vat: true,
    is_featured: true,
    image_url: null as string | null,
    badge: null,
  },
  {
    id: '4',
    name: 'Running Trainers',
    slug: 'running-trainers',
    price_pence: 8999,
    compare_at_price_pence: 11999,
    price_includes_vat: true,
    is_featured: true,
    image_url: null as string | null,
    badge: 'Sale',
  },
]

const TRUST_BADGES = [
  {
    icon: Truck,
    title: 'Free UK Delivery',
    description: 'On orders over £50',
  },
  {
    icon: RefreshCw,
    title: '30-Day Returns',
    description: 'Hassle-free returns policy',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Protected by Stripe',
  },
  {
    icon: Star,
    title: 'Quality Guarantee',
    description: 'Curated UK products',
  },
]

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <TrustBadges />
      <FeaturedCategories />
      <FeaturedProducts />
      <NewsletterSection />
    </main>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 0)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="container relative mx-auto px-4 py-24 md:py-36">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4 bg-white/10 text-white hover:bg-white/10">
            🇬🇧 Free delivery on orders over £50
          </Badge>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Shop the{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              best of Britain
            </span>
          </h1>

          <p className="mb-8 text-lg text-gray-300 md:text-xl">
            Discover thousands of quality products. Secure checkout, fast UK delivery, and
            hassle-free returns — all in one place.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="bg-white text-gray-900 hover:bg-gray-100">
              <Link href="/products">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/pages/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustBadges() {
  return (
    <section className="border-b bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <badge.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedCategories() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
          <p className="mt-2 text-muted-foreground">Explore our wide range of product categories</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {FEATURED_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="mb-3 text-4xl">{category.emoji}</div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
              <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedProducts() {
  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
            <p className="mt-2 text-muted-foreground">Hand-picked favourites just for you</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href="/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
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
    badge: string | null
  }
}

function ProductCard({ product }: ProductCardProps) {
  const discountPercent =
    product.compare_at_price_pence
      ? Math.round(
          ((product.compare_at_price_pence - product.price_pence) /
            product.compare_at_price_pence) *
            100
        )
      : null

  return (
    <Card className="group overflow-hidden border transition-all hover:shadow-md">
      {/* Image placeholder */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl text-muted-foreground/30">
              🛍️
            </div>
          )}

          {product.badge && (
            <Badge
              className="absolute left-2 top-2"
              variant={product.badge === 'Sale' ? 'destructive' : 'default'}
            >
              {product.badge}
            </Badge>
          )}

          {discountPercent && (
            <Badge className="absolute right-2 top-2 bg-green-600 hover:bg-green-600">
              -{discountPercent}%
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium leading-tight transition-colors group-hover:text-primary line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold">{formatGBPFromPence(product.price_pence)}</span>
          {product.compare_at_price_pence && (
            <span className="text-sm text-muted-foreground line-through">
              {formatGBPFromPence(product.compare_at_price_pence)}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {product.price_includes_vat ? 'inc. VAT' : 'exc. VAT'}
        </p>
      </CardContent>
    </Card>
  )
}

function NewsletterSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Stay in the loop</h2>
          <p className="mt-3 text-muted-foreground">
            Get exclusive deals, new arrivals, and UK-only offers delivered to your inbox. Unsubscribe
            any time.
          </p>
          <div className="mt-6">
            <NewsletterForm source="homepage" className="mx-auto max-w-sm" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            By subscribing, you agree to our{' '}
            <Link href="/pages/privacy-policy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            . No spam, ever.
          </p>
        </div>
      </div>
    </section>
  )
}
