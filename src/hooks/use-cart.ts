'use client'

import { useCartStore } from '@/stores/cart'
import { formatGBP } from '@/lib/utils/currency'
import { calculateCartVat } from '@/lib/vat/calculator'

export function useCart() {
  const store = useCartStore()
  const vat = calculateCartVat(store.items)

  return {
    items: store.items,
    isHydrated: store._hasHydrated,
    totalItems: store.getTotalItems(),
    subtotalPence: vat.subtotal_ex_vat_pence,
    vatPence: vat.total_vat_pence,
    totalPence: vat.total_inc_vat_pence,
    subtotalFormatted: formatGBP(vat.subtotal_ex_vat_pence),
    vatFormatted: formatGBP(vat.total_vat_pence),
    totalFormatted: formatGBP(vat.total_inc_vat_pence),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    isEmpty: store.items.length === 0,
  }
}
