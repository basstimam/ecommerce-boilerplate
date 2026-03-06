import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  product_id: string
  product_name: string
  slug: string
  sku: string | null
  price_pence: number
  vat_rate: number
  price_includes_vat: boolean
  image_url?: string
}

interface WishlistState {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  toggleItem: (item: WishlistItem) => void
  hasItem: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (get().hasItem(item.product_id)) return
        set((state) => ({ items: [...state.items, item] }))
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.product_id !== productId) }))
      },

      toggleItem: (item) => {
        if (get().hasItem(item.product_id)) {
          get().removeItem(item.product_id)
        } else {
          get().addItem(item)
        }
      },

      hasItem: (productId) => get().items.some((i) => i.product_id === productId),

      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'wishlist-storage' }
  )
)
