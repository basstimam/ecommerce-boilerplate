# E-Commerce Boilerplate — Full Specification

**Tech Stack:** Bun · TypeScript · Next.js (App Router) · Supabase · Stripe  
**Model:** Single-company storefront (not a marketplace)  
**Market:** UK only  
**Shipping:** Self-managed (not third-party couriers like Royal Mail / DPD API)  
**Currency:** GBP (£)  
**Tax:** UK VAT 20% (standard rate)

---

## 1. Architecture & Project Structure

### 1.1 Folder Structure

```
src/
├── app/
│   ├── (storefront)/          # Public storefront (layout: navbar + footer)
│   │   ├── page.tsx                # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx            # Product listing + filter + search
│   │   │   └── [slug]/page.tsx     # Product detail
│   │   ├── cart/page.tsx           # Cart page
│   │   ├── checkout/page.tsx       # Checkout (address + shipping + payment)
│   │   ├── checkout/success/page.tsx
│   │   ├── orders/                 # Customer order history
│   │   │   ├── page.tsx            # List orders
│   │   │   └── [id]/page.tsx       # Order detail + tracking
│   │   ├── account/
│   │   │   ├── page.tsx            # Profile overview
│   │   │   ├── addresses/page.tsx  # Address management
│   │   │   └── settings/page.tsx   # Email, password, preferences
│   │   ├── wishlist/page.tsx
│   │   ├── contact/page.tsx
│   │   └── pages/[slug]/page.tsx   # CMS static pages (about, FAQ, terms, privacy, returns)
│   │
│   ├── (auth)/                # Auth pages (layout: centred, minimal)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx      # From email link
│   │   ├── verify-email/page.tsx        # Email confirmation landing
│   │   └── auth/callback/route.ts       # Supabase OAuth callback
│   │
│   ├── admin/                 # Admin dashboard (layout: sidebar + topbar)
│   │   ├── page.tsx                     # Dashboard overview
│   │   ├── orders/
│   │   │   ├── page.tsx                 # Order list + filter + search
│   │   │   └── [id]/page.tsx            # Order detail + update status
│   │   ├── products/
│   │   │   ├── page.tsx                 # Product list
│   │   │   ├── new/page.tsx             # Create product
│   │   │   └── [id]/edit/page.tsx       # Edit product
│   │   ├── categories/page.tsx
│   │   ├── customers/
│   │   │   ├── page.tsx                 # Customer list
│   │   │   └── [id]/page.tsx            # Customer detail + order history
│   │   ├── shipping/
│   │   │   ├── zones/page.tsx           # Shipping zone management
│   │   │   └── rates/page.tsx           # Rate configuration
│   │   ├── discounts/
│   │   │   ├── page.tsx                 # Discount/coupon list
│   │   │   └── new/page.tsx             # Create discount
│   │   ├── pages/page.tsx               # CMS pages editor
│   │   ├── settings/
│   │   │   ├── general/page.tsx         # Store name, logo, VAT, timezone
│   │   │   ├── payment/page.tsx         # Stripe keys
│   │   │   ├── email/page.tsx           # Email template config
│   │   │   ├── legal/page.tsx           # GDPR, cookie, returns policy config
│   │   │   ├── newsletter/page.tsx      # Subscriber list, export CSV
│   │   │   └── shipping/page.tsx        # Default shipping rules
│   │   ├── audit-log/page.tsx           # Admin audit log
│   │   └── analytics/page.tsx           # Sales & traffic overview
│   │
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts          # Stripe webhook handler
│   │   ├── shipping/
│   │   │   └── calculate/route.ts       # Shipping cost calculation
│   │   ├── invoices/
│   │   │   └── [id]/download/route.ts   # Invoice PDF download
│   │   └── cron/
│   │       ├── cleanup/route.ts         # Abandoned cart cleanup, etc
│   │       └── audit-retention/route.ts # Prune old audit logs
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── storefront/            # Storefront-specific components
│   ├── admin/                 # Admin-specific components
│   └── shared/                # Shared (address-form, image-upload, cookie-banner,
│                              #   newsletter-form, invoice-template, etc)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client (cookies)
│   │   ├── admin.ts           # Service role client
│   │   └── middleware.ts      # Auth session refresh
│   ├── stripe/
│   │   ├── client.ts          # Stripe instance
│   │   └── webhooks.ts        # Webhook signature verification
│   ├── shipping/
│   │   └── calculator.ts      # Shipping cost logic
│   ├── email/
│   │   └── templates.ts       # Email template helpers
│   ├── vat/
│   │   └── calculator.ts      # VAT calculation helpers
│   ├── invoice/
│   │   └── generator.ts       # PDF invoice generation
│   ├── audit/
│   │   ├── logger.ts          # Audit log helper
│   │   └── diff.ts            # Change diff generator
│   └── utils/
│       ├── currency.ts        # Format GBP (£)
│       ├── slug.ts            # Slugify helper
│       ├── postcode.ts        # UK postcode validation & parsing
│       └── validation.ts      # Zod schemas
│
├── hooks/                     # Custom React hooks
│   ├── use-cart.ts
│   ├── use-auth.ts
│   ├── use-cookie-consent.ts
│   └── use-debounce.ts
│
├── stores/                    # Zustand stores
│   └── cart-store.ts
│
├── types/
│   ├── database.types.ts      # Supabase generated types
│   ├── order.ts
│   ├── product.ts
│   └── shipping.ts
│
└── middleware.ts               # Next.js middleware (auth guard + role check)
```

### 1.2 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STORE_NAME="My Store"
NEXT_PUBLIC_CURRENCY=GBP
NEXT_PUBLIC_VAT_RATE=20
NEXT_PUBLIC_COUNTRY=GB
```

---

## 2. Database Schema (Supabase / PostgreSQL)

### 2.1 Core Tables

```sql
-- ========================================
-- PROFILES (extends Supabase auth.users)
-- ========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,                            -- UK format: +44 or 07xxx
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,     -- GDPR: explicit opt-in
  marketing_consent_at TIMESTAMPTZ,            -- When they opted in
  cookie_preferences JSONB DEFAULT '{"essential": true, "analytics": false, "marketing": false}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- ADDRESSES (UK format)
-- ========================================
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',           -- "Home", "Work", custom
  recipient_name TEXT NOT NULL,                 -- Can differ from account holder
  phone TEXT NOT NULL,                          -- UK mobile/landline
  address_line_1 TEXT NOT NULL,                 -- House number + street
  address_line_2 TEXT,                          -- Flat/apartment/building
  city TEXT NOT NULL,                           -- Town / city
  county TEXT,                                  -- County (optional in UK, but useful)
  postcode TEXT NOT NULL,                       -- UK postcode (e.g. SW1A 1AA)
  country TEXT NOT NULL DEFAULT 'GB',           -- Always GB for UK-only
  is_default BOOLEAN DEFAULT FALSE,
  delivery_instructions TEXT,                   -- "Leave with neighbour", "Side gate", etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enforce single default per user
CREATE UNIQUE INDEX idx_addresses_default
  ON public.addresses (user_id)
  WHERE is_default = TRUE;

-- ========================================
-- CATEGORIES
-- ========================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- PRODUCTS
-- ========================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,               -- For card/listing preview
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,

  -- Pricing (all in PENCE, not pounds — consistent with Stripe)
  price_pence BIGINT NOT NULL,          -- e.g. 2999 = £29.99
  compare_at_price_pence BIGINT,        -- Strikethrough price
  cost_price_pence BIGINT,              -- Cost of goods (admin only)
  vat_rate NUMERIC(5,2) DEFAULT 20.00,  -- Standard 20%, reduced 5%, zero 0%
  price_includes_vat BOOLEAN DEFAULT TRUE,
  -- TRUE  → price_pence already includes VAT (£29.99 is what customer pays)
  -- FALSE → price_pence is ex-VAT, VAT added on top (£29.99 + 20% = £35.99)

  sku TEXT UNIQUE,
  barcode TEXT,
  track_inventory BOOLEAN DEFAULT TRUE,
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,

  -- Shipping dimensions
  weight_grams INT NOT NULL DEFAULT 0,  -- Weight for shipping calculation
  length_cm NUMERIC(8,2),               -- For volumetric weight
  width_cm NUMERIC(8,2),
  height_cm NUMERIC(8,2),

  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[],

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = TRUE;

-- ========================================
-- PRODUCT IMAGES
-- ========================================
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,                     -- Supabase Storage URL
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- PRODUCT VARIANTS (optional — size/colour)
-- ========================================
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- "Red - XL"
  sku TEXT UNIQUE,
  price_pence BIGINT,                   -- NULL = inherit parent
  stock_quantity INT DEFAULT 0,
  weight_grams INT,                     -- NULL = inherit parent
  options JSONB NOT NULL DEFAULT '{}',  -- {"colour": "Red", "size": "XL"}
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- ORDERS
-- ========================================
CREATE TYPE order_status AS ENUM (
  'pending_payment',   -- Awaiting payment
  'paid',              -- Payment received, not yet processed
  'processing',        -- Being packed
  'shipped',           -- Dispatched
  'in_transit',        -- In transit
  'out_for_delivery',  -- Out for delivery
  'delivered',         -- Delivered
  'completed',         -- Finalised (after customer confirmation / auto)
  'cancelled',         -- Cancelled
  'refunded'           -- Refunded
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,      -- Format: ORD-20250306-XXXX
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,                    -- Snapshot — persists if user deleted

  -- Address snapshot (not FK — address can change after order placed)
  shipping_address JSONB NOT NULL,
  -- {recipient_name, phone, address_line_1, address_line_2,
  --  city, county, postcode, country, delivery_instructions}

  billing_address JSONB,                  -- If different from shipping

  status order_status NOT NULL DEFAULT 'pending_payment',
  status_history JSONB DEFAULT '[]',      -- [{status, timestamp, note, updated_by}]

  -- Pricing (all in pence)
  subtotal_pence BIGINT NOT NULL,         -- Sum of line items (ex VAT)
  vat_amount_pence BIGINT NOT NULL,       -- Total VAT
  shipping_cost_pence BIGINT NOT NULL DEFAULT 0,
  discount_amount_pence BIGINT DEFAULT 0,
  total_pence BIGINT NOT NULL,            -- Grand total (inc VAT + shipping - discount)

  -- Shipping
  shipping_method TEXT,                   -- "standard", "express", "next_day"
  estimated_delivery_date DATE,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,

  -- Payment (Stripe)
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  payment_method_summary TEXT,            -- "Visa ending 4242"
  paid_at TIMESTAMPTZ,

  -- Discount
  discount_code TEXT,
  discount_id UUID,

  -- Notes
  customer_notes TEXT,                    -- "Please leave at back door"
  admin_notes TEXT,                       -- Internal notes
  cancelled_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_number ON public.orders(order_number);

-- ========================================
-- ORDER ITEMS
-- ========================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,

  -- Snapshot (price & name at time of purchase)
  product_name TEXT NOT NULL,
  variant_name TEXT,
  sku TEXT,
  image_url TEXT,
  unit_price_pence BIGINT NOT NULL,       -- Always stored as PRICE INC VAT (normalised at checkout)
  vat_rate NUMERIC(5,2) NOT NULL DEFAULT 20.00,
  price_includes_vat BOOLEAN NOT NULL DEFAULT TRUE,  -- Snapshot of product setting at purchase time
  quantity INT NOT NULL,
  total_price_pence BIGINT NOT NULL,      -- unit_price × quantity (inc VAT)
  vat_amount_pence BIGINT NOT NULL,       -- VAT portion of total_price
  weight_grams INT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- SHIPPING ZONES (UK regions)
-- ========================================
CREATE TABLE public.shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                     -- "London", "Mainland UK", "Scottish Highlands", etc.
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- SHIPPING ZONE REGIONS
-- ========================================
CREATE TABLE public.shipping_zone_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN (
    'postcode_prefix',   -- "SW", "EC", "E", "W" (London), "AB" (Aberdeen)
    'postcode_area',     -- Full outward code: "SW1A", "M1", "EH1"
    'country'            -- "GB" (catch-all)
  )),
  match_value TEXT NOT NULL              -- "SW", "EC1", "GB"
);

CREATE INDEX idx_zone_regions_match ON public.shipping_zone_regions(match_type, match_value);

-- ========================================
-- SHIPPING RATES
-- ========================================
CREATE TABLE public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  method TEXT NOT NULL,                   -- "standard", "express", "next_day", "same_day"
  label TEXT NOT NULL,                    -- "Standard (3-5 working days)", "Next Day"
  description TEXT,

  -- Pricing model
  calculation_type TEXT NOT NULL CHECK (calculation_type IN (
    'flat',              -- Flat rate per order
    'per_weight',        -- Per kg
    'tiered_weight',     -- Tiered by weight bands
    'free_above'         -- Free above spend threshold
  )),

  base_rate_pence BIGINT NOT NULL DEFAULT 0,    -- Base cost
  per_kg_rate_pence BIGINT DEFAULT 0,           -- Per kg (if per_weight)
  free_shipping_threshold_pence BIGINT,         -- Min spend for free shipping
  max_weight_grams INT,                         -- Max weight accepted
  min_delivery_days INT,
  max_delivery_days INT,

  -- Tiered weight config (if calculation_type = 'tiered_weight')
  weight_tiers JSONB,
  -- [{"min_grams": 0, "max_grams": 1000, "rate_pence": 399},
  --  {"min_grams": 1001, "max_grams": 5000, "rate_pence": 599}]

  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- SHIPMENT TRACKING
-- ========================================
CREATE TABLE public.shipment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,                   -- "dispatched", "in_transit", "out_for_delivery", "delivered"
  location TEXT,                          -- "London depot", "Manchester hub"
  description TEXT NOT NULL,              -- "Parcel dispatched from warehouse"
  tracked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX idx_tracking_order ON public.shipment_tracking(order_id, tracked_at DESC);

-- ========================================
-- DISCOUNTS / COUPONS
-- ========================================
CREATE TABLE public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,              -- "WELCOME10", "FREESHIP"
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_shipping')),
  value BIGINT NOT NULL,                  -- 10 (= 10%) or 500 (= £5.00)
  min_order_amount_pence BIGINT,          -- Minimum spend
  max_discount_amount_pence BIGINT,       -- Cap for percentage discounts
  usage_limit INT,                        -- Total uses allowed
  usage_per_user INT DEFAULT 1,           -- Max per customer
  usage_count INT DEFAULT 0,
  applicable_to TEXT DEFAULT 'all' CHECK (applicable_to IN ('all', 'specific_products', 'specific_categories')),
  applicable_ids UUID[],                  -- Product/category IDs if specific
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- DISCOUNT USAGE
-- ========================================
CREATE TABLE public.discount_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID NOT NULL REFERENCES public.discounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_discount_usage_unique
  ON public.discount_usage(discount_id, user_id, order_id);

-- ========================================
-- WISHLIST
-- ========================================
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ========================================
-- REVIEWS
-- ========================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),    -- Verified purchase check
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,              -- Admin moderation
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, user_id, order_id)           -- 1 review per order per product
);

-- ========================================
-- CMS PAGES
-- ========================================
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,                  -- Rich text / HTML
  is_published BOOLEAN DEFAULT FALSE,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- STORE SETTINGS (key-value)
-- ========================================
CREATE TABLE public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pre-populate UK defaults
INSERT INTO store_settings (key, value) VALUES
  ('store_name', '"My Store"'),
  ('store_logo', '""'),
  ('currency', '"GBP"'),
  ('timezone', '"Europe/London"'),
  ('vat_rate', '20'),
  ('default_price_includes_vat', 'true'),  -- Default for new products (can be overridden per product)
  ('vat_number', '""'),
  ('company_registration_number', '""'),
  ('contact_email', '""'),
  ('contact_phone', '""'),
  ('store_address', '""'),
  ('social_links', '{"instagram": "", "facebook": "", "tiktok": ""}'),
  ('checkout_require_account', 'true'),
  ('auto_complete_days', '14'),
  ('low_stock_email_alert', 'true'),
  ('returns_policy_days', '30'),
  ('cookie_banner_enabled', 'true'),
  ('gdpr_data_retention_days', '730');

-- ========================================
-- GDPR: DATA DELETION REQUESTS
-- ========================================
CREATE TABLE public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_notes TEXT
);

-- ========================================
-- NEWSLETTER SUBSCRIBERS
-- ========================================
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- Link if registered user
  source TEXT DEFAULT 'website',          -- "website", "checkout", "footer"
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_newsletter_active ON public.newsletter_subscribers(is_active) WHERE is_active = TRUE;

-- ========================================
-- INVOICES
-- ========================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,    -- Format: INV-20250306-0001
  pdf_url TEXT,                           -- Supabase Storage URL after generation
  subtotal_ex_vat_pence BIGINT NOT NULL,
  vat_amount_pence BIGINT NOT NULL,
  total_inc_vat_pence BIGINT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_order ON public.invoices(order_id);

-- ========================================
-- ADMIN AUDIT LOG
-- ========================================
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  admin_email TEXT NOT NULL,              -- Snapshot (survives if admin deleted)
  action TEXT NOT NULL,                   -- "order.status_updated", "product.created", etc.
  entity_type TEXT NOT NULL,              -- "order", "product", "category", "discount", "page", "settings"
  entity_id UUID,                         -- ID of affected record
  summary TEXT NOT NULL,                  -- Human-readable: "Changed order ORD-20250306-0001 status from paid to shipped"
  changes JSONB,                          -- { field: { old: "paid", new: "shipped" } }
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_admin ON public.admin_audit_log(admin_id);
CREATE INDEX idx_audit_entity ON public.admin_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action ON public.admin_audit_log(action);
CREATE INDEX idx_audit_date ON public.admin_audit_log(created_at DESC);
```

### 2.2 Database Functions & Triggers

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;

  NEW.order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Decrement stock when order paid
CREATE OR REPLACE FUNCTION decrement_stock_on_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status = 'pending_payment' THEN
    UPDATE products p
    SET stock_quantity = p.stock_quantity - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id = p.id
      AND p.track_inventory = TRUE;

    UPDATE product_variants pv
    SET stock_quantity = pv.stock_quantity - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.variant_id = pv.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_decrement_stock
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION decrement_stock_on_paid();

-- Restore stock on cancel/refund
CREATE OR REPLACE FUNCTION restore_stock_on_cancel()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('cancelled', 'refunded')
     AND OLD.status NOT IN ('cancelled', 'refunded', 'pending_payment') THEN
    UPDATE products p
    SET stock_quantity = p.stock_quantity + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id = p.id
      AND p.track_inventory = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_restore_stock
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION restore_stock_on_cancel();

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq
  FROM invoices
  WHERE DATE(created_at) = CURRENT_DATE;

  NEW.invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- Auto-create invoice when order is paid
CREATE OR REPLACE FUNCTION create_invoice_on_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status = 'pending_payment' THEN
    INSERT INTO invoices (order_id, subtotal_ex_vat_pence, vat_amount_pence, total_inc_vat_pence)
    VALUES (
      NEW.id,
      NEW.subtotal_pence,
      NEW.vat_amount_pence,
      NEW.total_pence
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_invoice
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION create_invoice_on_paid();

-- Helper: insert audit log (called from application code via supabase.rpc)
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_summary TEXT,
  p_changes JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
  admin_email_val TEXT;
BEGIN
  SELECT email INTO admin_email_val FROM profiles WHERE id = p_admin_id;

  INSERT INTO admin_audit_log (admin_id, admin_email, action, entity_type, entity_id, summary, changes, ip_address, user_agent)
  VALUES (p_admin_id, admin_email_val, p_action, p_entity_type, p_entity_id, p_summary, p_changes, p_ip_address, p_user_agent)
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2.3 Row Level Security (RLS)

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles: users read/edit own, admins read all
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Addresses: users manage their own only
CREATE POLICY "Users manage own addresses"
  ON addresses FOR ALL USING (auth.uid() = user_id);

-- Orders: users see own, admins see all
CREATE POLICY "Users read own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all orders"
  ON orders FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Wishlists: users only
CREATE POLICY "Users manage own wishlist"
  ON wishlists FOR ALL USING (auth.uid() = user_id);

-- Reviews: public read approved, users write own
CREATE POLICY "Public read approved reviews"
  ON reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Users manage own reviews"
  ON reviews FOR ALL USING (auth.uid() = user_id);

-- Data deletion requests: users see own
CREATE POLICY "Users manage own deletion requests"
  ON data_deletion_requests FOR ALL USING (auth.uid() = user_id);

-- Newsletter: admin-only read (subscribers inserted via service role)
CREATE POLICY "Admins read newsletter subscribers"
  ON newsletter_subscribers FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Invoices: users see own orders' invoices, admins see all
CREATE POLICY "Users read own invoices"
  ON invoices FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = invoices.order_id AND orders.user_id = auth.uid())
  );
CREATE POLICY "Admins manage all invoices"
  ON invoices FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Audit log: admins only
CREATE POLICY "Admins read audit log"
  ON admin_audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
```

---

## 3. Authentication Flow (Supabase Auth)

### 3.1 Registration

```
[User] → Fill form (email, password, full_name)
  │
  ├─ Client: supabase.auth.signUp({ email, password, options: {
  │    data: { full_name },
  │    emailRedirectTo: `${APP_URL}/auth/callback`
  │  }})
  │
  ├─ Supabase: Sends confirmation email
  │    └─ Email contains link: /verify-email?token_hash=xxx&type=signup
  │
  ├─ DB Trigger: handle_new_user() → insert profiles row
  │
  ├─ Client: Redirect to "Check your email" page
  │
  └─ [User] Clicks email link
       │
       ├─ GET /auth/callback → exchange code for session
       ├─ Update profiles.email_verified = TRUE
       └─ Redirect to homepage / account
```

**UX Details:**
- Real-time form validation (email format, password min 8 chars with uppercase + number)
- Password strength indicator
- Disable submit button during loading, show spinner
- If email already registered: clear message + link to login
- "Check your email" page has "Resend Email" button (rate limited, 60s cooldown)
- Marketing consent checkbox: "I'd like to receive offers and updates" (unchecked by default — GDPR)
- Link to Privacy Policy on the form

### 3.2 Login

```
[User] → Enter email + password
  │
  ├─ Client: supabase.auth.signInWithPassword({ email, password })
  │
  ├─ On success:
  │    ├─ Check role from profiles
  │    ├─ If admin → redirect /admin
  │    └─ If customer → redirect to previous page or /
  │
  ├─ If email not verified:
  │    └─ Show message + resend verification button
  │
  └─ On failure:
       └─ "Incorrect email or password" (never reveal which one)
```

**Rate limiting:** Max 5 failed attempts per email per 15 min → show cooldown timer.

### 3.3 Forgot Password

```
[User] → Enter email on /forgot-password
  │
  ├─ Client: supabase.auth.resetPasswordForEmail(email, {
  │    redirectTo: `${APP_URL}/reset-password`
  │  })
  │
  ├─ ALWAYS show "If that email is registered, we've sent a reset link"
  │   (never reveal whether the email exists)
  │
  └─ [User] Clicks email link
       │
       ├─ Redirect to /reset-password (with access_token in URL)
       │
       ├─ /auth/callback route: exchange code → set session
       │
       ├─ Form: new password + confirm password
       │    ├─ Validation: min 8 chars, uppercase, number
       │    └─ Real-time password match indicator
       │
       ├─ Client: supabase.auth.updateUser({ password: newPassword })
       │
       └─ Success → "Password updated successfully" → redirect to login
```

**Edge cases:**
- Link expired (default 1hr): show message + "Resend link" button
- Token already used: show "This link has already been used"
- User already logged in when accessing reset: still allow reset

### 3.4 OAuth (Google) — Optional

```
[User] → Click "Sign in with Google"
  │
  ├─ Client: supabase.auth.signInWithOAuth({
  │    provider: 'google',
  │    options: { redirectTo: `${APP_URL}/auth/callback` }
  │  })
  │
  ├─ /auth/callback:
  │    ├─ Exchange code → session
  │    ├─ Trigger handle_new_user() if new user
  │    └─ Redirect to homepage
  │
  └─ Edge case: Google email already registered via email/password
       └─ Supabase auto-links accounts (if email matches & confirmed)
```

### 3.5 Middleware Auth Guard

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { supabase, response } = createServerClient(request);
  const { data: { session } } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;

  // Protected routes
  if (path.startsWith('/account') || path.startsWith('/orders') || path.startsWith('/checkout')) {
    if (!session) {
      return redirect('/login?redirect=' + encodeURIComponent(path));
    }
  }

  // Admin routes
  if (path.startsWith('/admin')) {
    if (!session) return redirect('/login');
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return redirect('/');
    }
  }

  // Auth pages → redirect if already logged in
  if ((path.startsWith('/login') || path.startsWith('/register')) && session) {
    return redirect('/');
  }

  return response;
}
```

### 3.6 Session & Token Management

- **Access token:** auto-refresh by Supabase client (default 1hr)
- **Refresh token:** httpOnly cookie via `@supabase/ssr`
- **Logout:** `supabase.auth.signOut()` → clear session → redirect to homepage
- **Multi-tab:** Supabase broadcast channel syncs session across tabs

---

## 4. Address Management (UK Format)

### 4.1 UK Address Format

UK addresses follow a specific structure. The form should respect this:

```
Recipient Name          → "John Smith"
Address Line 1          → "42 Acacia Avenue"        (house/building number + street)
Address Line 2          → "Flat 3B"                  (optional — flat, floor, building name)
Town / City             → "Manchester"
County                  → "Greater Manchester"       (optional — not required by Royal Mail)
Postcode                → "M1 4BT"                  (required, validated)
Country                 → "United Kingdom"           (fixed: GB)
Delivery Instructions   → "Leave with neighbour at No. 44"
```

### 4.2 Postcode Validation & Lookup

```typescript
// lib/utils/postcode.ts

// UK postcode regex (covers all valid formats)
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

// Outward code extraction (for shipping zone matching)
function getOutwardCode(postcode: string): string {
  // "SW1A 1AA" → "SW1A", "M1 4BT" → "M1", "EC2A 4BT" → "EC2A"
  const cleaned = postcode.replace(/\s/g, '').toUpperCase();
  return cleaned.slice(0, -3);
}

// Postcode area (first 1-2 letters)
function getPostcodeArea(postcode: string): string {
  // "SW1A 1AA" → "SW", "M1 4BT" → "M", "EC2A 4BT" → "EC"
  return postcode.match(/^[A-Z]+/i)?.[0]?.toUpperCase() || '';
}

// Format postcode with space
function formatPostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s/g, '').toUpperCase();
  return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3);
}
```

**Optional Postcode Lookup Integration:**

For better UX, you can integrate a postcode lookup API (like `getaddress.io` or `ideal-postcodes.co.uk`) so users type their postcode and get address suggestions auto-filled. This is a common pattern in UK e-commerce:

```
[User types postcode] → "SW1A 1AA"
  │
  ├─ API call to postcode lookup service
  │
  ├─ Dropdown: Select your address
  │    ├─ "10 Downing Street, London"
  │    ├─ "11 Downing Street, London"
  │    └─ "Can't find my address? Enter manually"
  │
  └─ Auto-fills: address_line_1, city, county
```

### 4.3 User Address Flow

```
[Account > My Addresses]
  │
  ├─ Display list of address cards
  │    Each card: label, recipient, full address, badge "Default"
  │    Actions: Edit | Delete | Make Default
  │
  ├─ Button "+ Add New Address"
  │    ├─ Form fields:
  │    │   ├─ Label (dropdown: Home / Work / Other + custom input)
  │    │   ├─ Recipient Name * (pre-fill from profile full_name)
  │    │   ├─ Phone * (UK format validation: +44 or 07xxx)
  │    │   ├─ Postcode * → "Find Address" button (postcode lookup)
  │    │   ├─ Address Line 1 * (auto-filled or manual)
  │    │   ├─ Address Line 2 (optional)
  │    │   ├─ Town / City * (auto-filled or manual)
  │    │   ├─ County (auto-filled or manual, optional)
  │    │   ├─ Delivery Instructions (textarea)
  │    │   │    Placeholder: "e.g. Leave at side gate, ring doorbell twice"
  │    │   └─ ☑ Make this my default address
  │    │
  │    └─ Validation:
  │         ├─ Phone: UK format (+44/07xxx, 10-11 digits)
  │         ├─ Postcode: UK regex + format with space
  │         └─ Required fields check
  │
  ├─ Max 10 addresses per user
  │
  └─ Delete confirmation: "Delete this address?" (prevent if used in active order)
```

### 4.4 Checkout Address Selection

```
[Checkout Page]
  │
  ├─ If user has addresses:
  │    ├─ Show default address (pre-selected)
  │    ├─ Dropdown/modal "Choose a different address"
  │    │    └─ List all addresses + radio select
  │    ├─ "Add new address" link → inline form / modal
  │    └─ After selecting address → auto recalculate shipping rates
  │
  └─ If no addresses saved:
       └─ Show full address form (auto-save to address book)
```

---

## 5. Shipping (Self-Managed, UK Zones)

### 5.1 UK Shipping Zones Concept

Zones based on UK geography, matched via postcode prefix:

```
Zone                   | Postcode Matches             | Methods Available
───────────────────────────────────────────────────────────────────────────
London                 | EC, WC, E, N, NW, SE, SW,    | Same Day £9.99
                       | W                             | Next Day £5.99
                       |                               | Standard 2-3 days FREE > £50
───────────────────────────────────────────────────────────────────────────
Mainland UK            | All other England, Wales,     | Next Day £6.99
                       | Scotland (excl. Highlands)    | Standard 3-5 days £3.99
                       |                               | FREE > £75
───────────────────────────────────────────────────────────────────────────
Scottish Highlands &   | AB, IV, KW, PA, PH, FK,      | Standard 5-7 days £7.99
Islands                | HS, ZE, KA (partial),         | Express 3-4 days £12.99
                       | BT (Northern Ireland)         |
───────────────────────────────────────────────────────────────────────────
Northern Ireland       | BT                            | Standard 5-7 days £6.99
                       |                               | Express 3-4 days £11.99
───────────────────────────────────────────────────────────────────────────
Channel Islands /      | JE, GY, IM                    | Standard 7-10 days £12.99
Isle of Man            |                               |
───────────────────────────────────────────────────────────────────────────
```

**Why postcode-based:** UK postcodes reliably indicate geographic region. The outward code (first half) maps cleanly to delivery zones. This avoids the ambiguity of city/county matching.

### 5.2 Shipping Cost Calculation

```typescript
// lib/shipping/calculator.ts

interface ShippingOption {
  method: string;
  label: string;
  cost_pence: number;
  estimated_days: { min: number; max: number };
  is_free_shipping: boolean;
}

async function calculateShipping(
  postcode: string,
  cart_items: CartItem[],
  subtotal_pence: number
): Promise<ShippingOption[]> {

  // 1. Calculate total weight
  const total_weight_grams = cart_items.reduce(
    (sum, item) => sum + (item.weight_grams * item.quantity), 0
  );

  // 2. Determine zone from postcode
  //    Match priority: postcode_area → postcode_prefix → country (fallback)
  const postcode_area = getPostcodeArea(postcode);   // "SW", "M", "EC"
  const outward_code = getOutwardCode(postcode);       // "SW1A", "M1"

  const zone = await findMatchingZone(outward_code, postcode_area);

  // 3. Get active rates for zone
  const rates = await getActiveRates(zone.id);

  // 4. Calculate per method
  return rates
    .filter(rate => !rate.max_weight_grams || total_weight_grams <= rate.max_weight_grams)
    .map(rate => {
      let cost = 0;

      switch (rate.calculation_type) {
        case 'flat':
          cost = rate.base_rate_pence;
          break;
        case 'per_weight':
          const weight_kg = Math.ceil(total_weight_grams / 1000);
          cost = rate.base_rate_pence + (weight_kg * rate.per_kg_rate_pence);
          break;
        case 'tiered_weight':
          cost = calculateTieredWeight(total_weight_grams, rate.weight_tiers);
          break;
        case 'free_above':
          cost = subtotal_pence >= rate.free_shipping_threshold_pence
            ? 0 : rate.base_rate_pence;
          break;
      }

      const is_free = rate.free_shipping_threshold_pence
        && subtotal_pence >= rate.free_shipping_threshold_pence;

      return {
        method: rate.method,
        label: rate.label,
        cost_pence: is_free ? 0 : cost,
        estimated_days: { min: rate.min_delivery_days, max: rate.max_delivery_days },
        is_free_shipping: is_free
      };
    });
}
```

### 5.3 Shipping Tracking Flow (Self-Managed)

```
[Admin] Updates order status
  │
  ├─ Status: "processing" → Admin packing the order
  │    └─ Admin can add note: "Order being packed"
  │
  ├─ Status: "shipped" → Admin enters:
  │    ├─ Tracking number (auto-generated or manual)
  │    ├─ Courier / method
  │    └─ Insert shipment_tracking: "Parcel dispatched from warehouse"
  │
  ├─ Status: "in_transit" → Admin/driver updates:
  │    ├─ Insert tracking: "Parcel at [City] sorting hub"
  │    └─ Can have multiple timeline entries
  │
  ├─ Status: "out_for_delivery"
  │    └─ Insert tracking: "Parcel out for delivery"
  │
  ├─ Status: "delivered"
  │    ├─ Insert tracking: "Delivered — signed by [name]"
  │    ├─ Update orders.delivered_at = now()
  │    └─ Send delivery confirmation email to customer
  │
  └─ Status: "completed" (auto after N days, or customer confirmation)
       └─ Trigger: send email "How was your order? Leave a review"
```

**Customer Tracking View:**

```
[Order Detail Page]
  │
  ├─ Order #ORD-20250306-0001
  ├─ Status badge: "In Transit"
  ├─ Tracking: TRK-xxxxxxxx
  ├─ "Download Invoice" button (PDF)
  │
  └─ Timeline (newest first):
       ✓  06 Mar, 2:30pm — Out for delivery
       ✓  06 Mar, 8:00am — Arrived at Manchester depot
       ✓  05 Mar, 10:15pm — Left London sorting centre
       ✓  05 Mar, 4:00pm — Parcel dispatched from warehouse
       ✓  05 Mar, 10:00am — Order packed
       ✓  05 Mar, 9:12am — Payment confirmed
```

---

## 6. Checkout & Payment Flow (Stripe)

### 6.1 Full Checkout Flow

```
[Cart Page] → Click "Checkout"
  │
  ├─ Guard: must be logged in (redirect to /login?redirect=/checkout)
  │
  ├─ Step 1: DELIVERY ADDRESS
  │    ├─ Select from address book OR enter new
  │    ├─ Validate postcode format + completeness
  │    └─ → Next
  │
  ├─ Step 2: DELIVERY METHOD
  │    ├─ API call: POST /api/shipping/calculate
  │    │    Body: { postcode, cart_items, subtotal_pence }
  │    │    Response: [{ method, label, cost_pence, estimated_days }]
  │    │
  │    ├─ Display options as radio buttons:
  │    │    ☑ Standard Delivery (3-5 working days) — FREE
  │    │    ○ Next Day Delivery — £5.99
  │    │    ○ Same Day (London only) — £9.99
  │    │
  │    ├─ Show estimated delivery date: "Estimated: Mon 10 – Wed 12 Mar"
  │    ├─ Update order summary in sidebar
  │    └─ → Next
  │
  ├─ Step 3: DISCOUNT CODE (optional)
  │    ├─ Input field + "Apply" button
  │    ├─ Validation:
  │    │    ├─ Code valid & active?
  │    │    ├─ Not expired?
  │    │    ├─ Under usage limit?
  │    │    ├─ User hasn't exceeded per-user limit?
  │    │    ├─ Min spend met?
  │    │    └─ Applicable to products in cart?
  │    ├─ If valid: show discount in summary
  │    └─ If invalid: show specific error message
  │
  ├─ Step 4: REVIEW & PAYMENT
  │    ├─ Full summary:
  │    │    ├─ Line items (image, name, qty, price inc VAT)
  │    │    ├─ Delivery address
  │    │    ├─ Delivery method + estimated date
  │    │    ├─ Subtotal (ex VAT) — calculated via calculateCartVat()
  │    │    │    Handles mixed cart: some items inc VAT, some ex VAT
  │    │    ├─ VAT (itemised if multiple rates: 20%, 5%, 0%)
  │    │    ├─ Delivery
  │    │    ├─ Discount (if applied)
  │    │    └─ TOTAL (inc VAT)
  │    │
  │    ├─ Order notes (textarea, optional)
  │    │    Placeholder: "Any special requests for your order?"
  │    │
  │    ├─ Stripe Payment Element
  │    │    ├─ Server: create PaymentIntent
  │    │    │    stripe.paymentIntents.create({
  │    │    │      amount: total_pence,
  │    │    │      currency: 'gbp',
  │    │    │      metadata: { order_id, user_id }
  │    │    │    })
  │    │    │
  │    │    ├─ Client: mount <PaymentElement />
  │    │    │    (card, Apple Pay, Google Pay — Stripe handles available methods)
  │    │    │
  │    │    └─ User fills payment → Click "Place Order — £XX.XX"
  │    │
  │    └─ Submit flow:
  │         ├─ Disable button + spinner
  │         ├─ Final stock check (server-side)
  │         │    └─ If out of stock → show error, don't charge
  │         ├─ Create order record (status: pending_payment)
  │         ├─ stripe.confirmPayment({
  │         │    elements,
  │         │    confirmParams: { return_url: `${APP_URL}/checkout/success?order_id=xxx` }
  │         │  })
  │         └─ Redirect to Stripe (3DS if needed) → return to success page
  │
  └─ [Checkout Success Page]
       ├─ "Thank you! Your order has been placed"
       ├─ Order number + summary
       ├─ Estimated delivery date
       ├─ Link "View Order Details"
       └─ Confirmation email sent automatically
```

### 6.2 VAT Handling

```typescript
// lib/vat/calculator.ts

interface VatBreakdown {
  price_ex_vat_pence: number;
  vat_amount_pence: number;
  price_inc_vat_pence: number;
}

/**
 * Calculate VAT for a single product.
 * Handles both price-inclusive and price-exclusive products.
 *
 * @param price_pence       - The stored price (could be inc or ex VAT)
 * @param price_includes_vat - Whether price_pence already includes VAT
 * @param vat_rate           - VAT percentage (20, 5, or 0)
 */
function calculateVat(
  price_pence: number,
  price_includes_vat: boolean,
  vat_rate: number = 20
): VatBreakdown {

  if (price_includes_vat) {
    // Price INCLUDES VAT → reverse-calculate
    // £29.99 inc VAT → ex-VAT = 2999 / 1.20 = 2499, VAT = 500
    const ex_vat = Math.round(price_pence / (1 + vat_rate / 100));
    const vat = price_pence - ex_vat;
    return {
      price_ex_vat_pence: ex_vat,
      vat_amount_pence: vat,
      price_inc_vat_pence: price_pence
    };
  } else {
    // Price EXCLUDES VAT → add VAT on top
    // £29.99 ex VAT → VAT = 2999 * 0.20 = 600, inc VAT = 3599
    const vat = Math.round(price_pence * (vat_rate / 100));
    return {
      price_ex_vat_pence: price_pence,
      vat_amount_pence: vat,
      price_inc_vat_pence: price_pence + vat
    };
  }
}

/**
 * Get the customer-facing display price (always inc VAT).
 * Use this everywhere: product cards, detail pages, cart, checkout.
 */
function getDisplayPrice(product: {
  price_pence: number;
  price_includes_vat: boolean;
  vat_rate: number;
}): number {
  const { price_inc_vat_pence } = calculateVat(
    product.price_pence,
    product.price_includes_vat,
    product.vat_rate
  );
  return price_inc_vat_pence;
}

/**
 * Calculate VAT breakdown for an entire cart.
 * Each item can independently be inc or ex VAT.
 */
function calculateCartVat(items: Array<{
  price_pence: number;
  price_includes_vat: boolean;
  vat_rate: number;
  quantity: number;
}>): {
  subtotal_ex_vat_pence: number;
  total_vat_pence: number;
  total_inc_vat_pence: number;
} {
  let subtotal_ex_vat = 0;
  let total_vat = 0;

  for (const item of items) {
    const breakdown = calculateVat(item.price_pence, item.price_includes_vat, item.vat_rate);
    subtotal_ex_vat += breakdown.price_ex_vat_pence * item.quantity;
    total_vat += breakdown.vat_amount_pence * item.quantity;
  }

  return {
    subtotal_ex_vat_pence: subtotal_ex_vat,
    total_vat_pence: total_vat,
    total_inc_vat_pence: subtotal_ex_vat + total_vat
  };
}

// VAT rates reference:
// Standard rate: 20% (most goods)
// Reduced rate:   5% (domestic fuel, children's car seats, sanitary products)
// Zero rate:      0% (children's clothing, books, most food)
```

**Order summary display (checkout + invoice):**

```
Item                   Qty    Price        VAT
─────────────────────────────────────────────────
T-Shirt (inc VAT)       1    £29.99    (20% inc)
Camera Lens (ex VAT)    1    £399.99   (20% +£80.00)

Subtotal (ex. VAT)                    £424.99
VAT                                    £85.00
Delivery                                £5.99
Discount (WELCOME10)                  -£10.00
                                      ───────
Total                                 £505.98
```

**Display rules:**
- Product cards, listing, detail page → ALWAYS show price inc VAT (use `getDisplayPrice()`)
- If `price_includes_vat = true` → show price as-is
- If `price_includes_vat = false` → calculate inc-VAT price and show that
- Small label beneath: "Inc. VAT" (always, regardless of how price is stored)
- Checkout summary → break down into ex-VAT subtotal + VAT line
- Invoice → show per-item VAT breakdown (legal requirement for VAT invoices)

### 6.3 Stripe Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response('Webhook signature failed', { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      // 1. Update order status → 'paid'
      // 2. Update paid_at, stripe_charge_id
      // 3. Trigger: decrement stock (via DB trigger)
      // 4. Send order confirmation email to customer
      // 5. Send new order notification to admin
      break;

    case 'payment_intent.payment_failed':
      // 1. Keep order as 'pending_payment'
      // 2. Send "Payment failed" email with retry link
      // 3. Set expiry timer (24hr → auto cancel)
      break;

    case 'charge.refunded':
      // 1. Update order status → 'refunded'
      // 2. Restore stock
      // 3. Send refund confirmation email
      break;

    case 'charge.dispute.created':
      // 1. Flag order
      // 2. Immediate admin notification
      break;
  }

  return new Response('OK', { status: 200 });
}
```

### 6.4 Payment Failure & Retry

```
[Payment fails]
  │
  ├─ Order stays "pending_payment"
  ├─ Show user-friendly message:
  │    "Payment unsuccessful. Please try again or use a different payment method."
  ├─ "Try Again" button → return to payment step (data preserved)
  │
  ├─ If user leaves page → order still exists
  │    ├─ Accessible from /orders → "Complete Payment"
  │    ├─ Reminder email after 1hr
  │    └─ Auto-cancel after 24hr + release stock reservation
  │
  └─ Edge cases:
       ├─ 3DS authentication failed → return to checkout with error
       ├─ Browser crash during payment → webhook still fires, order updates
       └─ Double submit → idempotency key in PaymentIntent
```

---

## 7. Cart System

### 7.1 Cart Architecture

```
Cart Storage:
  │
  ├─ Guest: Zustand store + localStorage sync
  │    └─ Data: [{productId, variantId, quantity}]
  │
  ├─ Logged in: Still client-side (Zustand)
  │    └─ Rationale: faster, fewer DB calls
  │    └─ Syncs to server only at checkout
  │
  └─ Merge on login:
       ├─ Guest had items in cart → logs in
       ├─ If duplicate items: take highest quantity
       └─ Show notification "Your basket has been updated"
```

### 7.2 Cart Validation (Pre-Checkout)

```
Before entering checkout, validate:
  │
  ├─ Each item still exists & is active?
  │    └─ If not: remove + show "X has been removed from your basket"
  │
  ├─ Prices still the same?
  │    └─ If changed: update + show "The price of X has been updated"
  │
  ├─ Sufficient stock?
  │    └─ If not: adjust quantity + show "Only Y of X remaining"
  │
  └─ Minimum order met? (if applicable)
       └─ If not: show "Minimum order is £X"
```

---

## 8. Admin Dashboard

### 8.1 Dashboard Overview

```
[Admin Dashboard — /admin]
  │
  ├─ Metric Cards (today / 7 days / 30 days toggle):
  │    ├─ Total Revenue (£)
  │    ├─ Total Orders
  │    ├─ Average Order Value
  │    └─ New Customers
  │
  ├─ Sales Chart (line chart, last 30 days)
  │
  ├─ Recent Orders (5 latest with quick action buttons)
  │
  ├─ Low Stock Alerts
  │    └─ Products where stock_quantity <= low_stock_threshold
  │
  ├─ Pending Reviews (awaiting moderation)
  │
  ├─ Newsletter: X active subscribers (link to /admin/settings/newsletter)
  │
  └─ Recent Activity (last 5 audit log entries, link to /admin/audit-log)
```

### 8.2 Order Management

```
[Admin > Orders]
  │
  ├─ Table:
  │    Order# | Customer | Total | Status | Date | Actions
  │
  ├─ Filters: status, date range, search (order#, customer name, email)
  │
  ├─ Bulk actions:
  │    ├─ Mark as Processing (for "paid" orders)
  │    ├─ Print Packing Slips (batch)
  │    └─ Export CSV
  │
  └─ [Order Detail — /admin/orders/[id]]
       │
       ├─ Header: Order #, Status Badge, Date
       │
       ├─ Status Update:
       │    ├─ Status dropdown + "Update" button
       │    ├─ Add tracking note (when shipped/in_transit)
       │    ├─ Enter tracking number (when shipped)
       │    └─ Each update → insert to status_history + shipment_tracking
       │
       ├─ Customer Info: name, email, phone (link to customer detail)
       │
       ├─ Delivery Address (from snapshot in order)
       │
       ├─ Order Items: product table with images
       │
       ├─ Payment Info:
       │    ├─ Stripe Payment Intent ID (link to Stripe dashboard)
       │    ├─ Payment method summary
       │    ├─ Refund button (partial/full)
       │    └─ Payment timeline
       │
       ├─ Shipping Tracking Timeline (editable, can add entries)
       │
       ├─ Admin Notes (internal, not visible to customer)
       │
       └─ Actions:
            ├─ Cancel Order (with reason)
            ├─ Refund (via Stripe API)
            ├─ Resend Confirmation Email
            ├─ Download Invoice (PDF)
            ├─ Regenerate Invoice
            └─ Print Invoice
       │
       └─ Activity Log tab:
            └─ All audit log entries for this order (filtered from admin_audit_log)
```

### 8.3 Product Management

```
[Admin > Products > Create/Edit]
  │
  ├─ Basic Info:
  │    ├─ Product name → auto-generate slug
  │    ├─ Short description (for cards)
  │    ├─ Full description (rich text editor — Tiptap / Editor.js)
  │    └─ Category (dropdown with search)
  │
  ├─ Media:
  │    ├─ Drag & drop image upload (Supabase Storage)
  │    ├─ Reorder images (drag)
  │    ├─ Set primary image
  │    ├─ Alt text per image
  │    └─ Max 10 images, auto-resize/compress client-side
  │
  ├─ Pricing:
  │    ├─ Price (required) — e.g. £29.99
  │    ├─ ☑ Price includes VAT (toggle, default ON)
  │    │    ├─ ON:  "£29.99 is what the customer pays (VAT included)"
  │    │    │       Preview: "Customer sees: £29.99 inc. VAT"
  │    │    └─ OFF: "£29.99 + VAT will be added at checkout"
  │    │            Preview: "Customer sees: £35.99 inc. VAT (£29.99 + £6.00 VAT)"
  │    ├─ VAT rate: Standard 20% / Reduced 5% / Zero 0% (dropdown)
  │    ├─ Compare at price (optional, strikethrough — follows same inc/ex VAT setting)
  │    └─ Cost price (optional, admin only — always ex-VAT, for margin calc)
  │
  ├─ Inventory:
  │    ├─ SKU
  │    ├─ Barcode
  │    ├─ Track inventory (toggle)
  │    ├─ Stock quantity
  │    └─ Low stock threshold
  │
  ├─ Shipping:
  │    ├─ Weight (grams) — REQUIRED for shipping calculation
  │    └─ Dimensions (L × W × H cm) — optional, for volumetric
  │
  ├─ Variants (optional):
  │    ├─ Add option group (Colour, Size, etc.)
  │    ├─ Auto-generate variant combinations
  │    ├─ Per-variant: SKU, price override, stock
  │    └─ Bulk edit variant prices/stock
  │
  ├─ SEO:
  │    ├─ Meta title (auto-fill from name)
  │    ├─ Meta description (auto-fill from short desc)
  │    └─ Google preview snippet
  │
  ├─ Tags (chip input)
  │
  ├─ Status:
  │    ├─ Active / Draft toggle
  │    └─ Featured toggle
  │
  └─ Save: Draft | Publish
```

### 8.4 Shipping Zone Management (Admin)

```
[Admin > Shipping > Zones]
  │
  ├─ List:
  │    Zone Name | Regions | Methods | Status | Actions
  │
  └─ [Create/Edit Zone]
       │
       ├─ Zone name: "London"
       │
       ├─ Regions (multi-select):
       │    ├─ Type: Postcode Prefix / Postcode Area / Country
       │    ├─ Value: select from suggestions (e.g. "EC", "SW", "N")
       │    └─ Multiple regions per zone allowed
       │
       ├─ Shipping Rates (per zone):
       │    ├─ + Add Rate
       │    │    ├─ Method: standard / express / next_day / same_day
       │    │    ├─ Label: "Standard Delivery (3-5 working days)"
       │    │    ├─ Calculation: Flat / Per Weight / Tiered / Free Above
       │    │    ├─ Base rate: £3.99
       │    │    ├─ Per kg rate: (if per_weight)
       │    │    ├─ Free delivery threshold: £50
       │    │    ├─ Max weight: 30kg
       │    │    └─ Delivery estimate: 3-5 working days
       │    └─ Reorder rates (sort_order)
       │
       └─ Test calculator:
            Enter postcode → see which rates appear
```

---

## 9. Email Notifications (Supabase Email / Resend)

### 9.1 Transactional Emails

```
Trigger                            | Recipient | Email Content
────────────────────────────────────────────────────────────────────────
Auth: Signup                       | Customer  | Verify email link
Auth: Password reset               | Customer  | Reset password link
Auth: Password changed             | Customer  | Confirmation of change
Auth: Email changed                | Customer  | Verify new email
────────────────────────────────────────────────────────────────────────
Order: Confirmed (paid)            | Customer  | Order summary + items + VAT breakdown
                                      |           |   + PDF invoice attached
Order: New order                   | Admin     | New order notification
Order: Dispatched                  | Customer  | Tracking number + estimated delivery
Order: Delivered                   | Customer  | Delivery confirmation + review link
Order: Cancelled                   | Customer  | Cancellation details + refund info
Order: Refunded                    | Customer  | Refund confirmation + amount
────────────────────────────────────────────────────────────────────────
Reminder: Abandoned basket (1hr)   | Customer  | "You left items in your basket"
Reminder: Payment pending (6hr)    | Customer  | "Complete your payment"
Reminder: Review request           | Customer  | "How was your order?" (7 days
           (7d after delivered)    |           |  after delivery)
────────────────────────────────────────────────────────────────────────
Alert: Low stock                   | Admin     | Product X has Y remaining
Alert: New dispute                 | Admin     | Stripe dispute alert
────────────────────────────────────────────────────────────────────────
GDPR: Data deletion request        | Admin     | Customer requested data deletion
GDPR: Data deletion complete       | Customer  | Confirmation of data removal
```

### 9.2 Email Template Structure

Every email uses a consistent HTML template:
- Header: store logo
- Body: dynamic content
- Footer: company address, VAT number, unsubscribe (for marketing), social links
- Responsive (mobile-friendly)
- Dark mode compatible
- Company registration number in footer (UK legal requirement for limited companies)

---

## 10. UK Legal & GDPR Compliance

### 10.1 Cookie Consent Banner

```
[Cookie Banner — bottom of page, appears on first visit]
  │
  ├─ "We use cookies to improve your experience."
  │    Link: "Read our Cookie Policy"
  │
  ├─ Buttons:
  │    ├─ "Accept All" → set all categories TRUE
  │    ├─ "Reject Non-Essential" → only essential TRUE
  │    └─ "Manage Preferences" → expandable panel:
  │         ├─ ☑ Essential (always on, can't toggle off)
  │         ├─ ☐ Analytics (Google Analytics, Vercel Analytics)
  │         └─ ☐ Marketing (retargeting pixels, etc.)
  │
  └─ Saves to profiles.cookie_preferences (if logged in)
     or localStorage cookie_consent (if guest)
```

### 10.2 GDPR Requirements Built Into Boilerplate

```
Requirement                           | Implementation
──────────────────────────────────────────────────────────────────────
Explicit consent for marketing emails | Unchecked checkbox at registration
Right to access personal data         | Account > Settings > "Download My Data" (JSON export)
Right to erasure ("right to be        | Account > Settings > "Delete My Account"
 forgotten")                          |   → Creates data_deletion_request
                                      |   → Admin reviews & processes
                                      |   → Anonymise orders (keep for accounting)
                                      |   → Delete: profile, addresses, wishlist, reviews
Data portability                      | "Download My Data" exports: profile, orders,
                                      |   addresses, reviews as JSON
Consent records                       | marketing_consent + marketing_consent_at timestamps
Cookie consent                        | Cookie banner with granular controls
Privacy Policy page                   | CMS page (required, pre-created)
Data retention policy                 | Auto-delete inactive accounts after N days
                                      |   (configurable in store_settings)
```

### 10.3 UK Consumer Rights (Distance Selling)

```
Built into the boilerplate:
  │
  ├─ 14-day cooling-off period
  │    └─ Returns policy page (CMS, pre-created with template text)
  │    └─ "Request Return" button visible on orders within 14 days of delivery
  │
  ├─ Clear pricing: all prices shown INCLUDE VAT
  │    └─ VAT breakdown visible at checkout + on invoice
  │
  ├─ Delivery information before purchase
  │    └─ Estimated delivery dates shown at checkout
  │
  ├─ Order confirmation email (legal requirement)
  │    └─ Auto-sent on payment success
  │
  ├─ Company info in footer (for limited companies):
  │    ├─ Registered company name
  │    ├─ Company registration number
  │    ├─ Registered address
  │    └─ VAT number (if VAT registered)
  │
  └─ Pre-created CMS pages (templates):
       ├─ Terms & Conditions
       ├─ Privacy Policy
       ├─ Returns & Refunds Policy
       ├─ Cookie Policy
       └─ Delivery Information
```

---

## 11. Storefront Pages Detail

### 11.1 Homepage

```
[Homepage]
  ├─ Hero Banner (configurable from admin)
  ├─ Featured Categories (grid)
  ├─ Featured Products (carousel/grid)
  ├─ New Arrivals
  ├─ Sale / Promo section (if active discounts)
  ├─ Testimonials / Reviews highlight
  └─ Newsletter signup (email input + subscribe button, GDPR consent via action)
```

### 11.2 Product Listing

```
[/products]
  ├─ Sidebar / Top filters:
  │    ├─ Category (checkbox tree)
  │    ├─ Price range (slider, £)
  │    ├─ Tags
  │    ├─ Minimum rating
  │    └─ In stock only (toggle)
  │
  ├─ Sort: Newest, Price ↑↓, Best Selling, Rating
  │
  ├─ Product grid (responsive: 4-col desktop, 2-col mobile)
  │    Each card: image, name, price inc VAT (via getDisplayPrice()), compare_at_price, rating, badge (New/Sale)
  │
  ├─ Pagination or infinite scroll
  │
  └─ URL-based filters: /products?category=shoes&sort=price_asc&min=2000
       (for shareability + SEO)
```

### 11.3 Product Detail

```
[/products/[slug]]
  ├─ Image gallery (thumbnails + zoom + lightbox)
  ├─ Name, rating summary (stars + count)
  ├─ Price inc. VAT (calculated via getDisplayPrice() — always shows final customer price)
  │    Format: "£35.99" with small "Inc. VAT" label
  │    If compare_at_price: strikethrough "£45.99" next to current price
  ├─ Short description
  ├─ Variant selector (colour swatches, size buttons)
  ├─ Stock status ("In Stock" / "Out of Stock" / "Only 3 left")
  ├─ Quantity selector
  ├─ "Add to Basket" (disabled if OOS)
  ├─ "♡ Wishlist" toggle
  ├─ Delivery estimate: "Free delivery over £50" / "Estimated delivery: 3-5 working days"
  ├─ Tabs: Description | Specifications | Reviews
  ├─ Related products carousel
  └─ Recently viewed
```

---

## 12. Security Checklist

```
☐ RLS enabled on ALL public tables
☐ Service role key ONLY on server-side (never exposed to client)
☐ Stripe webhook signature verification
☐ CSRF protection (Next.js built-in)
☐ Rate limiting on auth endpoints
☐ Input sanitisation (Zod validation everywhere)
☐ XSS prevention (React auto-escape + DOMPurify for rich text)
☐ SQL injection prevention (Supabase parameterised queries)
☐ File upload validation (type, size, dimensions)
☐ Admin routes protected in middleware + RLS
☐ Sensitive data NOT on client (cost_price, service role key)
☐ HTTPS only
☐ Secure headers (CSP, HSTS, X-Frame-Options)
☐ Stripe PCI compliance (never touch raw card data)
☐ Password policy enforced (min 8, complexity)
☐ Session timeout configuration
☐ GDPR cookie consent before non-essential cookies
☐ Marketing emails only with explicit opt-in
☐ Data deletion pipeline functional
☐ Audit log for admin actions (optional but recommended)
```

---

## 13. Deployment & DevOps

```
Environment            | Purpose
──────────────────────────────────
Local (Bun + Supabase  | Development, Mailpit for email testing
  local)               |
──────────────────────────────────
Staging (Vercel        | Testing before production
  Preview + Supabase   |
  staging project)     |
──────────────────────────────────
Production (Vercel +   | Live
  Supabase production  |
  + Stripe live keys)  |
──────────────────────────────────

CI/CD:
  ├─ GitHub Actions / Vercel auto-deploy
  ├─ Run: bun test + bun lint before deploy
  ├─ Supabase migrations via CLI (supabase db push)
  └─ Environment variables per branch in Vercel
```

---

## 14. Dependencies Summary

```json
{
  "dependencies": {
    "next": "^15.x",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "stripe": "^17.x",
    "@stripe/stripe-js": "^4.x",
    "@stripe/react-stripe-js": "^3.x",
    "zustand": "^5.x",
    "zod": "^3.x",
    "@tanstack/react-query": "^5.x",
    "@tanstack/react-table": "^8.x",
    "tailwindcss": "^4.x",
    "motion": "latest",
    "lucide-react": "latest",
    "sonner": "latest",
    "tiptap": "latest",
    "@react-pdf/renderer": "latest"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "supabase": "latest"
  }
}
```

---

## 15. PDF Invoice Generation

### 15.1 Invoice Flow

```
[Order payment succeeds (webhook: payment_intent.succeeded)]
  │
  ├─ DB Trigger: create_invoice_on_paid()
  │    └─ Creates invoice record with auto-generated number: INV-20250306-0001
  │
  ├─ Server action: generateInvoicePDF(invoice_id)
  │    ├─ Fetch order + order_items + store_settings
  │    ├─ Render PDF (using @react-pdf/renderer or jsPDF)
  │    ├─ Upload to Supabase Storage: invoices/{order_id}/INV-20250306-0001.pdf
  │    └─ Update invoices.pdf_url with storage URL
  │
  ├─ Attach PDF to order confirmation email
  │
  └─ Available for download:
       ├─ Customer: /orders/[id] → "Download Invoice" button
       └─ Admin: /admin/orders/[id] → "Download Invoice" / "Regenerate Invoice"
```

### 15.2 Invoice PDF Content

```
┌─────────────────────────────────────────────────────────┐
│  [STORE LOGO]                                           │
│  Store Name Ltd                                         │
│  123 Business Street, London, SW1A 1AA                  │
│  VAT No: GB 123 4567 89                                 │
│  Company No: 12345678                                   │
│                                                         │
│  ─────────────────────────────────────────────────────── │
│                                                         │
│  INVOICE                        Invoice #: INV-20250306-0001
│                                 Date: 06 March 2025     │
│                                 Order #: ORD-20250306-0001
│                                                         │
│  Bill To:                       Deliver To:             │
│  John Smith                     John Smith              │
│  john@example.com               42 Acacia Avenue        │
│                                 Manchester, M1 4BT      │
│                                                         │
│  ─────────────────────────────────────────────────────── │
│                                                         │
│  Item              Qty   Unit Price   VAT Rate   Total  │
│  ─────────────────────────────────────────────────────── │
│  Classic T-Shirt    2     £24.99      20%       £49.98  │
│  (White, Size M)                                        │
│  Leather Wallet     1     £39.99      20%       £39.99  │
│                                                         │
│  ─────────────────────────────────────────────────────── │
│                                                         │
│                           Subtotal (ex. VAT):   £74.98  │
│                           VAT (20%):            £14.99  │
│                           Delivery:              £5.99  │
│                           Discount (WELCOME10): -£7.50  │
│                           ───────────────────────────── │
│                           Total (inc. VAT):     £88.46  │
│                                                         │
│  ─────────────────────────────────────────────────────── │
│                                                         │
│  Payment: Visa ending 4242                              │
│  Paid: 06 March 2025, 9:12am                            │
│                                                         │
│  Delivery: Standard (3-5 working days)                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**UK legal requirements for VAT invoices:**
- Seller company name, address, VAT number
- Invoice number (unique, sequential)
- Invoice date
- Customer name & address
- Description of goods
- Per-item: quantity, unit price, VAT rate
- Total ex-VAT, VAT amount, total inc-VAT
- Payment method & date

### 15.3 Invoice Implementation

```typescript
// lib/invoice/generator.ts

import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceDocument } from '@/components/shared/invoice-template';

async function generateInvoicePDF(invoiceId: string): Promise<string> {
  const supabase = createAdminClient();

  // 1. Fetch invoice + order + items + store settings
  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      order:orders(
        *, order_items(*),
        user:profiles(full_name, email)
      )
    `)
    .eq('id', invoiceId)
    .single();

  const { data: settings } = await supabase
    .from('store_settings')
    .select('*');

  // 2. Render PDF
  const pdfBuffer = await renderToBuffer(
    InvoiceDocument({ invoice, settings })
  );

  // 3. Upload to Supabase Storage
  const filePath = `invoices/${invoice.order_id}/${invoice.invoice_number}.pdf`;
  const { data } = await supabase.storage
    .from('documents')
    .upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true  // allow regeneration
    });

  // 4. Get public URL & update invoice record
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  await supabase
    .from('invoices')
    .update({ pdf_url: publicUrl })
    .eq('id', invoiceId);

  return publicUrl;
}
```

### 15.4 Admin: Regenerate Invoice

```
[Admin > Orders > [id]]
  │
  ├─ "Download Invoice" → direct download from pdf_url
  │
  └─ "Regenerate Invoice" → useful if:
       ├─ Store settings changed (new logo, address)
       ├─ Order was partially refunded (updated totals)
       └─ Generates new PDF, overwrites old one (same invoice number)
```

---

## 16. Newsletter Signup (Display Only)

### 16.1 Concept

Simple email collection — no campaign/blast system built in. The subscriber list can be exported as CSV and imported into any external tool (Mailchimp, Brevo, etc.) when the client is ready.

### 16.2 Signup Locations

```
[Storefront]
  │
  ├─ Footer (every page):
  │    ├─ "Stay in the loop" / "Get updates & offers"
  │    ├─ Email input + "Subscribe" button (single row, minimal)
  │    ├─ Small text: "We respect your privacy. Unsubscribe anytime."
  │    │   Link to Privacy Policy
  │    └─ GDPR: submission = consent (no separate checkbox needed
  │       because it's a clear affirmative action, but the purpose
  │       must be stated — "updates & offers")
  │
  └─ Checkout Success Page (optional):
       ├─ "Want to hear about new products and offers?"
       ├─ ☐ Checkbox (unchecked by default)
       └─ If checked → subscribe with order email
```

### 16.3 Signup Flow

```
[User enters email → clicks Subscribe]
  │
  ├─ Client validation: email format
  │
  ├─ Server action:
  │    ├─ Check if email already in newsletter_subscribers
  │    │    ├─ If active: show "You're already subscribed!"
  │    │    ├─ If unsubscribed: reactivate, update subscribed_at
  │    │    └─ If new: insert record
  │    │
  │    ├─ If user is logged in: link user_id to subscriber record
  │    └─ Set source: "footer" | "checkout" | "website"
  │
  └─ Show confirmation: "Thanks for subscribing!" (inline, replaces form)
     No confirmation email sent (no email system)
```

### 16.4 Admin: Subscriber Management

```
[Admin > Settings > Newsletter]  (or a lightweight page)
  │
  ├─ Stats:
  │    ├─ Total active subscribers
  │    ├─ Subscribers this month
  │    └─ Unsubscribed this month
  │
  ├─ Subscriber table:
  │    Email | Name | Source | Subscribed Date | Status
  │    (searchable, sortable)
  │
  ├─ Export CSV button
  │    └─ Downloads: email, full_name, subscribed_at, source
  │       (for import into Mailchimp / Brevo / etc.)
  │
  └─ No send/campaign functionality — out of scope
```

### 16.5 Unsubscribe

```
[Account > Settings] (for logged-in users)
  │
  └─ "Email Preferences"
       ├─ ☐ Receive newsletter and offers
       └─ Toggle updates newsletter_subscribers.is_active

[Unsubscribe link] (for future use when email tool is connected)
  │
  └─ /unsubscribe?email=xxx&token=xxx
       ├─ Sets is_active = FALSE, unsubscribed_at = now()
       └─ "You've been unsubscribed. Sorry to see you go."
```

---

## 17. Admin Audit Log

### 17.1 What Gets Logged

```
Entity Type   | Actions Logged
───────────────────────────────────────────────────────
order         | status_updated, refunded, cancelled, notes_updated,
              | tracking_added, invoice_regenerated
───────────────────────────────────────────────────────
product       | created, updated, deleted, stock_adjusted,
              | published, unpublished
───────────────────────────────────────────────────────
category      | created, updated, deleted
───────────────────────────────────────────────────────
discount      | created, updated, deleted, deactivated
───────────────────────────────────────────────────────
customer      | role_changed, data_deletion_processed
───────────────────────────────────────────────────────
page          | created, updated, published, unpublished, deleted
───────────────────────────────────────────────────────
shipping      | zone_created, zone_updated, rate_created, rate_updated
───────────────────────────────────────────────────────
settings      | updated (any store setting change)
───────────────────────────────────────────────────────
```

### 17.2 Logging Implementation

```typescript
// lib/audit/logger.ts

interface AuditLogParams {
  adminId: string;
  action: string;           // "order.status_updated"
  entityType: string;       // "order"
  entityId: string;
  summary: string;          // "Changed order ORD-20250306-0001 from paid to shipped"
  changes?: Record<string, { old: unknown; new: unknown }>;
}

async function logAdminAction(params: AuditLogParams, request?: Request) {
  const supabase = createAdminClient();

  await supabase.rpc('log_admin_action', {
    p_admin_id: params.adminId,
    p_action: params.action,
    p_entity_type: params.entityType,
    p_entity_id: params.entityId,
    p_summary: params.summary,
    p_changes: params.changes ?? null,
    p_ip_address: request?.headers.get('x-forwarded-for') ?? null,
    p_user_agent: request?.headers.get('user-agent') ?? null,
  });
}

// Usage example in a server action:
async function updateOrderStatus(orderId: string, newStatus: string, adminId: string) {
  const { data: order } = await supabase
    .from('orders')
    .select('order_number, status')
    .eq('id', orderId)
    .single();

  const oldStatus = order.status;

  await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  await logAdminAction({
    adminId,
    action: 'order.status_updated',
    entityType: 'order',
    entityId: orderId,
    summary: `Changed order ${order.order_number} status from ${oldStatus} to ${newStatus}`,
    changes: { status: { old: oldStatus, new: newStatus } }
  });
}
```

### 17.3 Audit Log Diff for Complex Changes

```typescript
// lib/audit/diff.ts

// Auto-generate changes object by comparing old and new records
function generateChanges(
  oldRecord: Record<string, unknown>,
  newRecord: Record<string, unknown>,
  fieldsToTrack: string[]
): Record<string, { old: unknown; new: unknown }> | null {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  for (const field of fieldsToTrack) {
    if (JSON.stringify(oldRecord[field]) !== JSON.stringify(newRecord[field])) {
      changes[field] = { old: oldRecord[field], new: newRecord[field] };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}

// Usage: when editing a product
const changes = generateChanges(oldProduct, newProduct, [
  'name', 'price_pence', 'stock_quantity', 'is_active', 'vat_rate', 'price_includes_vat'
]);

if (changes) {
  await logAdminAction({
    adminId,
    action: 'product.updated',
    entityType: 'product',
    entityId: product.id,
    summary: `Updated product "${product.name}" — changed: ${Object.keys(changes).join(', ')}`,
    changes
  });
}
```

### 17.4 Admin UI: Audit Log Page

```
[Admin > Audit Log]  (/admin/audit-log)
  │
  ├─ Filters:
  │    ├─ Date range (date picker)
  │    ├─ Admin (dropdown — filter by who)
  │    ├─ Entity type (dropdown: order, product, settings, etc.)
  │    └─ Search (free text — searches summary field)
  │
  ├─ Table:
  │    Date/Time | Admin | Action | Summary | Details
  │    ──────────────────────────────────────────────────
  │    06 Mar 14:32 | admin@store.com | order.status_updated |
  │      "Changed order ORD-20250306-0001 from paid to shipped" | [View]
  │    ──────────────────────────────────────────────────
  │    06 Mar 14:10 | admin@store.com | product.updated |
  │      "Updated product 'Classic T-Shirt' — changed: price_pence, stock_quantity" | [View]
  │
  ├─ [View] expands to show:
  │    ├─ Full changes diff:
  │    │    price_pence: 2499 → 2999
  │    │    stock_quantity: 50 → 45
  │    ├─ IP address
  │    └─ User agent
  │
  ├─ Pagination (50 per page)
  │
  └─ Export CSV (filtered)

[Also visible per-entity]:
  │
  ├─ /admin/orders/[id] → "Activity Log" tab
  │    Shows all audit entries for that specific order
  │
  └─ /admin/products/[id]/edit → "Change History" tab
       Shows all audit entries for that specific product
```

### 17.5 Data Retention

```
Audit logs are retained based on store_settings:
  │
  ├─ Default: 2 years (730 days)
  ├─ Configurable in Admin > Settings > General
  └─ Cron job: DELETE FROM admin_audit_log
       WHERE created_at < now() - INTERVAL 'N days'
```

---

## 18. Out of Scope (Not Included)

To keep the boilerplate focused:

- Multi-vendor / marketplace (this is single company)
- Multi-currency / multi-language
- International shipping / customs
- Subscription / recurring payments
- Digital product delivery
- Real-time chat / customer support widget
- Push notifications (mobile)
- Affiliate / referral system
- Complex VAT rules for cross-border EU sales (UK-only)
- A/B testing framework
- Email campaign / blast system (newsletter collects emails only)

These can be added as separate modules per client need.
