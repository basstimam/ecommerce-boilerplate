import type { ShippingOption, ShippingRate, ShippingZone } from '@/types/shipping'

export interface ShippingCartItem {
  product_id: string
  variant_id?: string
  quantity: number
  price_pence: number
  weight_grams?: number
}

export type { ShippingOption }

const ZONES: (ShippingZone & { prefixes: string[] })[] = [
  {
    id: 'northern-ireland',
    name: 'Northern Ireland',
    description: 'BT postcodes',
    sort_order: 1,
    is_active: true,
    prefixes: ['BT'],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'highlands-islands',
    name: 'Scottish Highlands & Islands',
    description: 'Remote areas of Scotland',
    sort_order: 2,
    is_active: true,
    prefixes: [
      'HS', 'ZE', 'KW', 'IV', 'PH17', 'PH18', 'PH19', 'PH20', 'PH21', 'PH22', 'PH23',
      'PH24', 'PH25', 'PH26', 'PH30', 'PH31', 'PH32', 'PH33', 'PH34', 'PH35', 'PH36',
      'PH37', 'PH38', 'PH39', 'PH40', 'PH41', 'PH42', 'PH43', 'PH44', 'PH49', 'PH50',
      'AB36', 'AB37', 'AB38', 'AB41', 'AB42', 'AB43', 'AB44', 'AB45', 'AB51', 'AB52',
      'AB53', 'AB54', 'AB55', 'AB56', 'DD8', 'DD9', 'PA20', 'PA21', 'PA22', 'PA23',
      'PA24', 'PA25', 'PA26', 'PA27', 'PA28', 'PA29', 'PA30', 'PA31', 'PA32', 'PA33',
      'PA34', 'PA35', 'PA36', 'PA37', 'PA38', 'PA41', 'PA42', 'PA43', 'PA44', 'PA45',
      'PA46', 'PA47', 'PA48', 'PA60', 'PA61', 'PA62', 'PA63', 'PA64', 'PA65', 'PA66',
      'PA67', 'PA68', 'PA69', 'PA70', 'PA71', 'PA72', 'PA73', 'PA74', 'PA75', 'PA76',
      'PA77', 'PA78', 'KA27', 'KA28',
    ],
    created_at: '',
    updated_at: '',
  },
  {
    id: 'mainland-uk',
    name: 'Mainland UK',
    description: 'England, Scotland (mainland), Wales',
    sort_order: 3,
    is_active: true,
    prefixes: [],
    created_at: '',
    updated_at: '',
  },
]

const RATES: Record<string, ShippingRate[]> = {
  'mainland-uk': [
    {
      id: 'mainland-free',
      zone_id: 'mainland-uk',
      name: 'Free Standard Delivery',
      description: 'On orders over £50',
      calculation_type: 'free',
      price_pence: 0,
      min_order_pence: 5000,
      max_order_pence: null,
      min_weight_grams: null,
      max_weight_grams: null,
      weight_tiers: null,
      is_active: true,
      estimated_days_min: 3,
      estimated_days_max: 5,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'mainland-standard',
      zone_id: 'mainland-uk',
      name: 'Standard Delivery',
      description: '3–5 working days',
      calculation_type: 'flat_rate',
      price_pence: 399,
      min_order_pence: null,
      max_order_pence: null,
      min_weight_grams: null,
      max_weight_grams: null,
      weight_tiers: null,
      is_active: true,
      estimated_days_min: 3,
      estimated_days_max: 5,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'mainland-express',
      zone_id: 'mainland-uk',
      name: 'Express Delivery',
      description: '1–2 working days',
      calculation_type: 'flat_rate',
      price_pence: 699,
      min_order_pence: null,
      max_order_pence: null,
      min_weight_grams: null,
      max_weight_grams: null,
      weight_tiers: null,
      is_active: true,
      estimated_days_min: 1,
      estimated_days_max: 2,
      created_at: '',
      updated_at: '',
    },
  ],
  'northern-ireland': [
    {
      id: 'ni-standard',
      zone_id: 'northern-ireland',
      name: 'Standard Delivery',
      description: '5–7 working days',
      calculation_type: 'flat_rate',
      price_pence: 899,
      min_order_pence: null,
      max_order_pence: null,
      min_weight_grams: null,
      max_weight_grams: null,
      weight_tiers: null,
      is_active: true,
      estimated_days_min: 5,
      estimated_days_max: 7,
      created_at: '',
      updated_at: '',
    },
  ],
  'highlands-islands': [
    {
      id: 'hi-standard',
      zone_id: 'highlands-islands',
      name: 'Standard Delivery',
      description: '5–7 working days',
      calculation_type: 'flat_rate',
      price_pence: 899,
      min_order_pence: null,
      max_order_pence: null,
      min_weight_grams: null,
      max_weight_grams: null,
      weight_tiers: null,
      is_active: true,
      estimated_days_min: 5,
      estimated_days_max: 7,
      created_at: '',
      updated_at: '',
    },
  ],
}

export function findMatchingZoneSync(postcode: string): string {
  const normalized = postcode.toUpperCase().replace(/\s+/g, '').trim()
  const area = normalized.match(/^[A-Z]{1,2}/)?.[0] ?? ''
  const district = normalized.match(/^[A-Z]{1,2}\d{1,2}/)?.[0] ?? ''

  for (const zone of ZONES) {
    if (zone.id === 'mainland-uk') continue
    if (zone.prefixes.some((p) => district.startsWith(p) || area === p)) {
      return zone.id
    }
  }
  return 'mainland-uk'
}

export async function findMatchingZone(postcode: string): Promise<string | null> {
  return findMatchingZoneSync(postcode)
}

export async function calculateShipping(
  postcode: string,
  _cart_items: ShippingCartItem[],
  subtotal_pence: number
): Promise<ShippingOption[]> {
  const zone_id = findMatchingZoneSync(postcode)
  const rates = RATES[zone_id] ?? []

  return rates
    .filter((rate) => {
      if (rate.min_order_pence !== null && subtotal_pence < rate.min_order_pence) return false
      if (rate.max_order_pence !== null && subtotal_pence > rate.max_order_pence) return false
      return true
    })
    .map((rate) => ({
      rate_id: rate.id,
      zone_id: rate.zone_id,
      name: rate.name,
      description: rate.description ?? undefined,
      price_pence: rate.price_pence,
      estimated_days_min: rate.estimated_days_min ?? undefined,
      estimated_days_max: rate.estimated_days_max ?? undefined,
    }))
}

export async function getActiveRates(zone_id: string): Promise<ShippingRate[]> {
  return RATES[zone_id] ?? []
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
