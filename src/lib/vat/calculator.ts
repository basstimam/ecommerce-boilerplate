export interface VatBreakdown {
  price_ex_vat_pence: number
  vat_amount_pence: number
  price_inc_vat_pence: number
}

export function calculateVat(
  price_pence: number,
  price_includes_vat: boolean,
  vat_rate: number
): VatBreakdown {
  if (vat_rate === 0) {
    return {
      price_ex_vat_pence: price_pence,
      vat_amount_pence: 0,
      price_inc_vat_pence: price_pence,
    }
  }

  if (price_includes_vat) {
    const price_ex_vat_pence = Math.round(price_pence / (1 + vat_rate / 100))
    const vat_amount_pence = price_pence - price_ex_vat_pence
    return {
      price_ex_vat_pence,
      vat_amount_pence,
      price_inc_vat_pence: price_pence,
    }
  } else {
    const vat_amount_pence = Math.round(price_pence * (vat_rate / 100))
    return {
      price_ex_vat_pence: price_pence,
      vat_amount_pence,
      price_inc_vat_pence: price_pence + vat_amount_pence,
    }
  }
}

export interface ProductForDisplay {
  price_pence: number
  price_includes_vat: boolean
  vat_rate: number
}

export function getDisplayPrice(product: ProductForDisplay): number {
  return calculateVat(product.price_pence, product.price_includes_vat, product.vat_rate)
    .price_inc_vat_pence
}

export interface CartItemForVat {
  price_pence: number
  price_includes_vat: boolean
  vat_rate: number
  quantity: number
}

export interface CartVatSummary {
  subtotal_ex_vat_pence: number
  total_vat_pence: number
  total_inc_vat_pence: number
}

export function calculateCartVat(items: CartItemForVat[]): CartVatSummary {
  let subtotal_ex_vat_pence = 0
  let total_vat_pence = 0
  let total_inc_vat_pence = 0

  for (const item of items) {
    const breakdown = calculateVat(item.price_pence, item.price_includes_vat, item.vat_rate)
    subtotal_ex_vat_pence += breakdown.price_ex_vat_pence * item.quantity
    total_vat_pence += breakdown.vat_amount_pence * item.quantity
    total_inc_vat_pence += breakdown.price_inc_vat_pence * item.quantity
  }

  return { subtotal_ex_vat_pence, total_vat_pence, total_inc_vat_pence }
}
