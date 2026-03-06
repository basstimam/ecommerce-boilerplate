export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price_pence: number
  compare_at_price_pence: number | null
  cost_price_pence: number | null
  price_includes_vat: boolean
  vat_rate: number
  category_id: string | null
  sku: string | null
  barcode: string | null
  stock_quantity: number
  track_inventory: boolean
  allow_backorder: boolean
  weight_grams: number | null
  dimensions: Record<string, number> | null
  is_active: boolean
  is_featured: boolean
  tags: string[]
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  sku: string | null
  options: Record<string, string>
  price_pence: number | null
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductWithImages extends Product {
  product_images: ProductImage[]
}

export interface ProductWithVariants extends Product {
  product_images: ProductImage[]
  product_variants: ProductVariant[]
}

export interface CartItem {
  product_id: string
  variant_id?: string
  product_name: string
  variant_options?: Record<string, string>
  sku: string | null
  price_pence: number
  quantity: number
  vat_rate: number
  price_includes_vat: boolean
  image_url?: string
  slug: string
}
