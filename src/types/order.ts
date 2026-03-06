import type { OrderStatus } from './database.types'

export type { OrderStatus }

export interface StatusHistoryEntry {
  status: OrderStatus
  timestamp: string
  note?: string
}

export interface OrderShippingAddress {
  full_name: string
  line1: string
  line2?: string | null
  city: string
  county?: string | null
  postcode: string
  country: string
  phone?: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  variant_options: Record<string, string> | null
  sku: string | null
  price_pence: number
  quantity: number
  vat_rate: number
  vat_amount_pence: number
  total_pence: number
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  status: OrderStatus
  shipping_address: OrderShippingAddress
  billing_address: OrderShippingAddress | null
  subtotal_pence: number
  shipping_pence: number
  discount_pence: number
  vat_pence: number
  total_pence: number
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  discount_id: string | null
  discount_code: string | null
  notes: string | null
  status_history: StatusHistoryEntry[]
  created_at: string
  updated_at: string
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}
