# AGENTS.md — UK E-Commerce Boilerplate

Production-ready e-commerce boilerplate untuk pasar UK. Single-company storefront (bukan marketplace).

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + `@supabase/ssr` |
| Payment | Stripe (Payment Element, webhooks) |
| Email | Resend |
| State | Zustand (cart), TanStack Query (server state) |
| Forms | React Hook Form + Zod v4 |
| UI | shadcn/ui + Tailwind v4 + Radix UI |
| Rich Text | Tiptap |
| PDF | @react-pdf/renderer |
| Animation | Motion |

---

## Domain Context

- **Market**: UK only — GBP (£) exclusively
- **VAT**: UK VAT — standard 20%, reduced 5%, zero 0%
- **Currency storage**: ALL prices stored in **PENCE** (integer), never pounds
  - `2999` = £29.99, `500` = £5.00
  - Consistent dengan Stripe amount format
- **Prices displayed**: SELALU inc. VAT (`getDisplayPrice()` dari `lib/vat/calculator.ts`)
- **Shipping**: Self-managed (bukan third-party courier API)
- **Postcode**: UK format validation — `lib/utils/postcode.ts`

---

## Project Structure

```
src/
├── app/
│   ├── (storefront)/          # Public storefront — layout: navbar + footer
│   │   ├── page.tsx           # Homepage
│   │   ├── products/          # Listing + [slug] detail
│   │   ├── cart/              # Cart page
│   │   ├── checkout/          # Multi-step checkout + success
│   │   ├── orders/            # Customer order history + [id] detail
│   │   ├── account/           # Profile, addresses, settings
│   │   ├── wishlist/
│   │   ├── contact/
│   │   └── pages/[slug]/      # CMS static pages
│   │
│   ├── (auth)/                # Auth pages — layout: centred minimal
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── verify-email/
│   │   └── auth/callback/     # Supabase OAuth callback
│   │
│   ├── admin/                 # Admin dashboard — layout: sidebar + topbar
│   │   ├── page.tsx           # Dashboard + metrics
│   │   ├── orders/            # Order management
│   │   ├── products/          # Product CRUD
│   │   ├── categories/
│   │   ├── customers/
│   │   ├── shipping/          # Zones + rates
│   │   ├── discounts/
│   │   ├── pages/             # CMS editor
│   │   ├── settings/          # General, payment, email, legal, newsletter
│   │   ├── audit-log/
│   │   └── analytics/
│   │
│   └── api/
│       ├── webhooks/stripe/   # Stripe webhook handler
│       ├── shipping/calculate/ # Shipping cost calculation
│       ├── invoices/[id]/download/
│       └── cron/              # cleanup + audit-retention
│
├── components/
│   ├── ui/                    # shadcn/ui primitives (JANGAN edit langsung)
│   ├── storefront/            # Storefront-specific components
│   ├── admin/                 # Admin-specific components
│   └── shared/                # address-form, image-upload, cookie-banner,
│                              # newsletter-form, invoice-template
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client (cookies)
│   │   ├── admin.ts           # Service role client — SERVER ONLY
│   │   └── middleware.ts      # Auth session refresh
│   ├── stripe/
│   │   ├── client.ts          # Stripe instance
│   │   └── webhooks.ts        # Signature verification
│   ├── shipping/calculator.ts # Shipping cost logic
│   ├── email/templates.ts     # Email template helpers (Resend)
│   ├── vat/calculator.ts      # VAT calculation (WAJIB pakai ini)
│   ├── invoice/generator.ts   # PDF invoice generation
│   ├── audit/
│   │   ├── logger.ts          # logAdminAction() helper
│   │   └── diff.ts            # generateChanges() untuk audit diff
│   └── utils/
│       ├── currency.ts        # formatGBP() — format £ display
│       ├── slug.ts            # slugify helper
│       ├── postcode.ts        # UK postcode validation & parsing
│       └── validation.ts      # Zod schemas
│
├── hooks/
│   ├── use-cart.ts
│   ├── use-auth.ts
│   ├── use-cookie-consent.ts
│   └── use-debounce.ts
│
├── stores/cart-store.ts       # Zustand cart store
│
├── types/
│   ├── database.types.ts      # Supabase generated types (jangan edit manual)
│   ├── order.ts
│   ├── product.ts
│   └── shipping.ts
│
└── middleware.ts               # Auth guard + admin role check
```

---

## Critical Patterns

### 1. Harga & VAT — WAJIB IKUTI

```typescript
// SELALU pakai lib/vat/calculator.ts untuk semua kalkulasi harga
import { getDisplayPrice, calculateVat, calculateCartVat } from '@/lib/vat/calculator'

// Tampil ke customer → selalu inc. VAT
const displayPrice = getDisplayPrice(product) // Returns pence inc. VAT

// Format untuk display → selalu formatGBP
import { formatGBP } from '@/lib/utils/currency'
formatGBP(2999) // → "£29.99"
formatGBP(0)    // → "£0.00"

// JANGAN pernah:
// - Hardcode harga dalam pounds (pakai pence)
// - Tampil harga tanpa melewati getDisplayPrice()
// - Hitung VAT manual tanpa pakai calculateVat()
```

### 2. Supabase Client — Server vs Client

```typescript
// Di Server Component / Route Handler / Server Action
import { createServerClient } from '@/lib/supabase/server'

// Di Client Component
import { createBrowserClient } from '@/lib/supabase/client'

// Di webhooks / cron / operasi admin (bypass RLS)
import { createAdminClient } from '@/lib/supabase/admin'
// PERINGATAN: createAdminClient() HANYA boleh di server-side

// JANGAN pernah expose SUPABASE_SERVICE_ROLE_KEY ke client
```

### 3. Postcode — UK Validation

```typescript
// Selalu validasi postcode UK sebelum simpan atau kalkulasi shipping
import { validateUKPostcode, formatPostcode, getPostcodeArea, getOutwardCode } from '@/lib/utils/postcode'

// Regex: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i
// Format: "SW1A 1AA" (dengan spasi), bukan "SW1A1AA"
```

### 4. Order Status Flow

```
pending_payment → paid → processing → shipped → in_transit → out_for_delivery → delivered → completed
                                    ↘ cancelled
                                    ↘ refunded
```

Stock berkurang OTOMATIS via DB trigger saat status berubah `pending_payment → paid`.
Stock di-restore via DB trigger saat status berubah ke `cancelled` atau `refunded`.

### 5. Admin Audit Log — WAJIB untuk semua admin actions

```typescript
import { logAdminAction } from '@/lib/audit/logger'
import { generateChanges } from '@/lib/audit/diff'

// Setiap perubahan data admin WAJIB di-log:
await logAdminAction({
  adminId,
  action: 'order.status_updated',   // format: entity.action
  entityType: 'order',
  entityId: orderId,
  summary: 'Human-readable description',
  changes: { status: { old: 'paid', new: 'shipped' } }
})
```

### 6. Shipping Calculation

```typescript
// JANGAN hitung shipping manual — selalu lewat:
import { calculateShipping } from '@/lib/shipping/calculator'

// atau via API endpoint:
POST /api/shipping/calculate
{ postcode, cart_items, subtotal_pence }
```

---

## Database Key Rules

- **Semua harga dalam PENCE** (BIGINT) — bukan pounds/decimal
- **Alamat di orders**: snapshot JSONB, bukan FK ke `addresses` table
  - Karena alamat bisa berubah setelah order dibuat
- **Order number format**: `ORD-YYYYMMDD-XXXX` (generated via DB trigger)
- **Invoice number format**: `INV-YYYYMMDD-XXXX` (generated via DB trigger)
- **RLS**: Semua tabel user-data wajib enable RLS
  - `createAdminClient()` untuk bypass RLS di server-side
  - Jangan pernah bypass RLS di client-side
- `database.types.ts` di-generate via Supabase CLI — jangan edit manual

---

## Auth & Roles

| Role | Akses |
|---|---|
| `customer` | Storefront, order history sendiri, account |
| `admin` | Semua `/admin/*` + customer data |
| `super_admin` | Semua admin + settings sensitif |

**Middleware** (`src/middleware.ts`) menjaga semua route:
- `/account`, `/orders`, `/checkout` → require login
- `/admin` → require login + role admin/super_admin

---

## Checkout Flow (Multi-Step)

```
Step 1: Delivery Address (select saved / enter new)
Step 2: Delivery Method (calculated via /api/shipping/calculate)
Step 3: Discount Code (optional)
Step 4: Review + Payment (Stripe Payment Element)
→ Stripe redirect → /checkout/success
```

**Penting**:
- Cart disimpan di Zustand + localStorage (client-side)
- Stock check final di server sebelum charge
- PaymentIntent dibuat di server (jangan di client)
- Webhook `/api/webhooks/stripe` yang update order ke `paid`

---

## Email (Nodemailer + Mailpit)

Dev: pakai Mailpit sebagai SMTP catcher lokal. Email tidak keluar ke internet.

```bash
# Jalankan Mailpit sebelum dev (binary ada di ~/mailpit/mailpit.exe)
~/mailpit/mailpit.exe
# SMTP: localhost:1025
# UI:   http://localhost:8025
```

```typescript
import { sendEmail } from '@/lib/email/mailer'

await sendEmail({
  to: 'customer@example.com',
  subject: 'Order Confirmed',
  html: '<p>...</p>',
})

// Template siap pakai (di lib/email/resend.ts — nama file lama, isinya sudah Nodemailer):
import { sendOrderConfirmationEmail, sendShippingConfirmationEmail } from '@/lib/email/resend'
```

Env vars yang dibutuhkan:
```env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@mystore.co.uk
```

Prod: ganti `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` ke provider SMTP pilihan (Resend SMTP, SendGrid, dsb.).

---

## Security Rules

- `SUPABASE_SERVICE_ROLE_KEY` — SERVER ONLY, jangan pernah ke client
- `STRIPE_SECRET_KEY` — SERVER ONLY
- `STRIPE_WEBHOOK_SECRET` — validasi SETIAP webhook request
- Input sanitization: Zod validation di semua form + API routes
- Rich text dari Tiptap: sanitasi dengan DOMPurify sebelum render
- File upload: validasi type (image only) + size + dimensions
- Admin routes: double protection (middleware + RLS)
- Cost price (`cost_price_pence`) — JANGAN expose ke client/storefront

---

## UK Legal Compliance

- **VAT**: Semua harga tampil inc. VAT. Invoice harus breakdown per-item VAT.
- **GDPR**: 
  - Marketing consent: unchecked by default
  - Right to erasure: via data_deletion_requests table
  - Cookie consent: granular (essential / analytics / marketing)
- **Consumer Rights**: 14-day cooling-off period
- **Company info di footer**: company name, registration number, VAT number, registered address

---

## Component Guidelines

```typescript
// shadcn/ui components — import dari @/components/ui/
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Jangan rebuild primitives yang sudah ada di shadcn/ui
// Jangan edit langsung file di components/ui/ — pakai shadcn CLI:
// bunx shadcn@latest add [component]

// Storefront components → components/storefront/
// Admin components → components/admin/
// Shared (auth + both) → components/shared/
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # SERVER ONLY

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=                 # SERVER ONLY
STRIPE_WEBHOOK_SECRET=             # SERVER ONLY

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STORE_NAME="My Store"
NEXT_PUBLIC_CURRENCY=GBP
NEXT_PUBLIC_VAT_RATE=20
NEXT_PUBLIC_COUNTRY=GB

# Email (Resend)
RESEND_API_KEY=                    # SERVER ONLY
```

---

## Common Mistakes to Avoid

1. **Harga dalam pounds** — selalu pakai pence
2. **Tampil harga tanpa getDisplayPrice()** — bisa salah VAT handling
3. **createAdminClient() di client component** — security issue
4. **Edit `database.types.ts` manual** — regenerate via `supabase gen types`
5. **Simpan alamat sebagai FK di order** — harus JSONB snapshot
6. **Kalkulasi shipping manual** — pakai `lib/shipping/calculator.ts`
7. **Admin action tanpa audit log** — selalu `logAdminAction()`
8. **Postcode tanpa validasi** — pakai `lib/utils/postcode.ts`
9. **Markup harga langsung di JSX** — selalu lewat `formatGBP()`

---

## Running the Project

```bash
bun install
cp .env.local.example .env.local
# isi .env.local dengan credentials

bun dev          # development dengan Turbopack
bun build        # production build
bun lint         # ESLint
```

---

## Supabase Migrations

```bash
supabase start               # local Supabase
supabase db push             # push migrations ke remote
supabase gen types typescript --local > src/types/database.types.ts
```
