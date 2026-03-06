export interface ShippingZone {
  id: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ShippingZoneRegion {
  id: string
  zone_id: string
  match_type: 'postcode_prefix' | 'postcode_area' | 'country'
  match_value: string
  created_at: string
}

export interface ShippingRate {
  id: string
  zone_id: string
  name: string
  description: string | null
  calculation_type: 'flat_rate' | 'per_kg' | 'tiered_weight' | 'free'
  price_pence: number
  min_order_pence: number | null
  max_order_pence: number | null
  min_weight_grams: number | null
  max_weight_grams: number | null
  weight_tiers: Array<{ max_weight_grams: number; price_pence: number }> | null
  is_active: boolean
  estimated_days_min: number | null
  estimated_days_max: number | null
  created_at: string
  updated_at: string
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
