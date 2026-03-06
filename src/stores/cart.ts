import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types/product'

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  getTotalItems: () => number
  getSubtotalPence: () => number
}

function itemKey(productId: string, variantId?: string) {
  return variantId ? `${productId}__${variantId}` : productId
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const key = itemKey(item.product_id, item.variant_id ?? undefined)
          const existing = state.items.find(
            (i) => itemKey(i.product_id, i.variant_id ?? undefined) === key
          )

          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.product_id, i.variant_id ?? undefined) === key
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }

          return { items: [...state.items, item] }
        })
      },

      removeItem: (productId, variantId) => {
        const key = itemKey(productId, variantId)
        set((state) => ({
          items: state.items.filter(
            (i) => itemKey(i.product_id, i.variant_id ?? undefined) !== key
          ),
        }))
      },

      updateQuantity: (productId, quantity, variantId) => {
        const key = itemKey(productId, variantId)
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.product_id, i.variant_id ?? undefined) === key ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotalPence: () =>
        get().items.reduce((sum, i) => sum + i.price_pence * i.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
)
