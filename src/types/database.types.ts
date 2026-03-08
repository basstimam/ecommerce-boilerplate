export type UserRole = 'customer' | 'admin' | 'super_admin'
export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'
export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping'
export type DiscountApplicableTo = 'all' | 'categories' | 'products'
export type ShippingMatchType = 'postcode_prefix' | 'postcode_area' | 'country'
export type ShippingCalculationType = 'flat_rate' | 'per_kg' | 'tiered_weight' | 'free'
export type DeletionRequestStatus = 'pending' | 'processing' | 'completed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: UserRole
          phone: string | null
          marketing_consent: boolean
          marketing_consent_at: string | null
          email_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: UserRole
          phone?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: UserRole
          phone?: string | null
          marketing_consent?: boolean
          marketing_consent_at?: string | null
          email_verified?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          full_name: string
          line1: string
          line2: string | null
          city: string
          county: string | null
          postcode: string
          country: string
          phone: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string
          full_name: string
          line1: string
          line2?: string | null
          city: string
          county?: string | null
          postcode: string
          country?: string
          phone?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          label?: string
          full_name?: string
          line1?: string
          line2?: string | null
          city?: string
          county?: string | null
          postcode?: string
          country?: string
          phone?: string | null
          is_default?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
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
          images: string[]
          is_featured: boolean
          tags: string[]
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          price_pence: number
          compare_at_price_pence?: number | null
          cost_price_pence?: number | null
          price_includes_vat?: boolean
          vat_rate?: number
          category_id?: string | null
          sku?: string | null
          barcode?: string | null
          stock_quantity?: number
          track_inventory?: boolean
          allow_backorder?: boolean
          weight_grams?: number | null
          dimensions?: Record<string, number> | null
          images?: string[]
          is_active?: boolean
          is_featured?: boolean
          tags?: string[]
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          price_pence?: number
          compare_at_price_pence?: number | null
          cost_price_pence?: number | null
          price_includes_vat?: boolean
          vat_rate?: number
          category_id?: string | null
          sku?: string | null
          barcode?: string | null
          stock_quantity?: number
          track_inventory?: boolean
          allow_backorder?: boolean
          weight_grams?: number | null
          dimensions?: Record<string, number> | null
          images?: string[]
          is_active?: boolean
          is_featured?: boolean
          tags?: string[]
          meta_title?: string | null
          meta_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          url?: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
        }
        Relationships: []
      }
      product_variants: {
        Row: {
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
        Insert: {
          id?: string
          product_id: string
          sku?: string | null
          options: Record<string, string>
          price_pence?: number | null
          stock_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          sku?: string | null
          options?: Record<string, string>
          price_pence?: number | null
          stock_quantity?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          body: string | null
          is_verified: boolean
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title?: string | null
          body?: string | null
          is_verified?: boolean
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          rating?: number
          title?: string | null
          body?: string | null
          is_verified?: boolean
          is_approved?: boolean
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          status: OrderStatus
          items: Array<Record<string, unknown>>
          shipping_address: Record<string, unknown>
          billing_address: Record<string, unknown> | null
          subtotal_pence: number
          shipping_pence: number
          discount_pence: number
          vat_pence: number
          total_pence: number
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          discount_id: string | null
          discount_code: string | null
          shipping_method: string | null
          notes: string | null
          status_history: Array<Record<string, unknown>>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          user_id: string
          status?: OrderStatus
          items?: Array<Record<string, unknown>>
          shipping_address: Record<string, unknown>
          billing_address?: Record<string, unknown> | null
          subtotal_pence: number
          shipping_pence?: number
          discount_pence?: number
          vat_pence: number
          total_pence: number
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          discount_id?: string | null
          discount_code?: string | null
          shipping_method?: string | null
          notes?: string | null
          status_history?: Array<Record<string, unknown>>
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: OrderStatus
          items?: Array<Record<string, unknown>>
          shipping_pence?: number
          discount_pence?: number
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          shipping_method?: string | null
          notes?: string | null
          status_history?: Array<Record<string, unknown>>
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
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
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          variant_id?: string | null
          product_name: string
          variant_options?: Record<string, string> | null
          sku?: string | null
          price_pence: number
          quantity: number
          vat_rate: number
          vat_amount_pence: number
          total_pence: number
          created_at?: string
        }
        Update: {
          quantity?: number
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          id: string
          code: string
          type: 'percentage' | 'fixed_amount' | 'free_shipping'
          value: number
          value_pence: number | null
          usage_limit: number | null
          usage_count: number
          min_order_pence: number | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          type: 'percentage' | 'fixed_amount' | 'free_shipping'
          value?: number
          value_pence?: number | null
          usage_limit?: number | null
          usage_count?: number
          min_order_pence?: number | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          code?: string
          type?: 'percentage' | 'fixed_amount' | 'free_shipping'
          value?: number
          value_pence?: number | null
          usage_limit?: number | null
          usage_count?: number
          min_order_pence?: number | null
          expires_at?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      shipping_zones: {
        Row: {
          id: string
          name: string
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          sort_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      shipping_zone_regions: {
        Row: {
          id: string
          zone_id: string
          match_type: ShippingMatchType
          match_value: string
          created_at: string
        }
        Insert: {
          id?: string
          zone_id: string
          match_type: ShippingMatchType
          match_value: string
          created_at?: string
        }
        Update: {
          match_type?: ShippingMatchType
          match_value?: string
        }
        Relationships: []
      }
      shipping_rates: {
        Row: {
          id: string
          zone_id: string
          name: string
          description: string | null
          calculation_type: ShippingCalculationType
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
        Insert: {
          id?: string
          zone_id: string
          name: string
          description?: string | null
          calculation_type: ShippingCalculationType
          price_pence: number
          min_order_pence?: number | null
          max_order_pence?: number | null
          min_weight_grams?: number | null
          max_weight_grams?: number | null
          weight_tiers?: Array<{ max_weight_grams: number; price_pence: number }> | null
          is_active?: boolean
          estimated_days_min?: number | null
          estimated_days_max?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          calculation_type?: ShippingCalculationType
          price_pence?: number
          min_order_pence?: number | null
          max_order_pence?: number | null
          is_active?: boolean
          estimated_days_min?: number | null
          estimated_days_max?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      shipment_tracking: {
        Row: {
          id: string
          order_id: string
          carrier: string | null
          tracking_number: string | null
          tracking_url: string | null
          status: string
          location: string | null
          description: string | null
          tracked_at: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          carrier?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          status: string
          location?: string | null
          description?: string | null
          tracked_at?: string
          created_at?: string
        }
        Update: {
          status?: string
          location?: string | null
          description?: string | null
          tracked_at?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          id: string
          code: string
          type: DiscountType
          value: number
          min_order_pence: number | null
          max_uses: number | null
          uses_count: number
          applicable_to: DiscountApplicableTo
          applicable_ids: string[]
          is_active: boolean
          starts_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          type: DiscountType
          value: number
          min_order_pence?: number | null
          max_uses?: number | null
          uses_count?: number
          applicable_to?: DiscountApplicableTo
          applicable_ids?: string[]
          is_active?: boolean
          starts_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          code?: string
          type?: DiscountType
          value?: number
          min_order_pence?: number | null
          max_uses?: number | null
          uses_count?: number
          applicable_to?: DiscountApplicableTo
          applicable_ids?: string[]
          is_active?: boolean
          starts_at?: string | null
          expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      discount_usage: {
        Row: {
          id: string
          discount_id: string
          user_id: string
          order_id: string
          used_at: string
        }
        Insert: {
          id?: string
          discount_id: string
          user_id: string
          order_id: string
          used_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: 1 | 2 | 3 | 4 | 5
          title: string | null
          body: string | null
          is_approved: boolean
          admin_reply: string | null
          admin_reply_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_id?: string | null
          rating: 1 | 2 | 3 | 4 | 5
          title?: string | null
          body?: string | null
          is_approved?: boolean
          admin_reply?: string | null
          admin_reply_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          rating?: 1 | 2 | 3 | 4 | 5
          title?: string | null
          body?: string | null
          is_approved?: boolean
          admin_reply?: string | null
          admin_reply_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          id: string
          title: string
          slug: string
          content: string | null
          excerpt: string | null
          is_published: boolean
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content?: string | null
          excerpt?: string | null
          is_published?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          slug?: string
          content?: string | null
          excerpt?: string | null
          is_published?: boolean
          meta_title?: string | null
          meta_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          id: string
          key: string
          value: unknown
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: unknown
          updated_at?: string
        }
        Update: {
          value?: unknown
          updated_at?: string
        }
        Relationships: []
      }
      data_deletion_requests: {
        Row: {
          id: string
          user_id: string
          email: string
          status: DeletionRequestStatus
          requested_at: string
          completed_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          status?: DeletionRequestStatus
          requested_at?: string
          completed_at?: string | null
          notes?: string | null
        }
        Update: {
          status?: DeletionRequestStatus
          completed_at?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: string | null
          meta_title: string | null
          meta_description: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content?: string | null
          meta_title?: string | null
          meta_description?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          title?: string
          content?: string | null
          meta_title?: string | null
          meta_description?: string | null
          is_published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          source: string | null
          is_active: boolean
          marketing_consent: boolean
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          source?: string | null
          is_active?: boolean
          marketing_consent?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          is_active?: boolean
          marketing_consent?: boolean
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          order_id: string
          invoice_number: string
          subtotal_pence: number
          vat_pence: number
          total_pence: number
          pdf_url: string | null
          issued_at: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          invoice_number?: string
          subtotal_pence: number
          vat_pence: number
          total_pence: number
          pdf_url?: string | null
          issued_at?: string
          created_at?: string
        }
        Update: {
          pdf_url?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          changes: Record<string, unknown> | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          changes?: Record<string, unknown> | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          action?: string
          table_name?: string
          record_id?: string | null
          changes?: Record<string, unknown> | null
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          id: string
          admin_id: string
          admin_email: string
          action: string
          entity_type: string
          entity_id: string | null
          changes: Record<string, { old: unknown; new: unknown }> | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          admin_email: string
          action: string
          entity_type: string
          entity_id?: string | null
          changes?: Record<string, { old: unknown; new: unknown }> | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          entity_id?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      log_admin_action: {
        Args: {
          p_admin_id: string
          p_admin_email: string
          p_action: string
          p_entity_type: string
          p_entity_id?: string
          p_changes?: Record<string, unknown>
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: void
      }
    }
    Enums: {
      order_status: OrderStatus
      user_role: UserRole
      discount_type: DiscountType
      shipping_match_type: ShippingMatchType
      shipping_calculation_type: ShippingCalculationType
    }
    CompositeTypes: Record<string, never>
  }
}
