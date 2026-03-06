export interface ShippingCartItem {
  product_id: string
  variant_id?: string
  quantity: number
  price_pence: number
  weight_grams?: number
}

export interface ShippingOption {
  rate_id: string
  zone_id: string
  name: string
  description?: string
  price_pence: number
  estimated_days_min?: number
  estimated_days_max?: number
}

export interface ShippingCalculationResult {
  options: ShippingOption[]
  error?: string
}

export async function calculateShipping(
  postcode: string,
  cart_items: ShippingCartItem[],
  subtotal_pence: number
): Promise<ShippingOption[]> {
  void postcode
  void cart_items
  void subtotal_pence
  return []
}

export async function findMatchingZone(postcode: string): Promise<string | null> {
  void postcode
  return null
}

export async function getActiveRates(zone_id: string): Promise<unknown[]> {
  void zone_id
  return []
}

export function calculateTieredWeight(
  weight_grams: number,
  tiers: Array<{ max_weight_grams: number; price_pence: number }>
): number {
  for (const tier of tiers) {
    if (weight_grams <= tier.max_weight_grams) {
      return tier.price_pence
    }
  }
  return tiers[tiers.length - 1]?.price_pence ?? 0
}
