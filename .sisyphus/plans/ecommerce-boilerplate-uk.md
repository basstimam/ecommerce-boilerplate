# E-Commerce Boilerplate UK — Work Plan

## TL;DR

> **Quick Summary**: Membangun e-commerce boilerplate production-ready untuk pasar UK dari nol — single-company storefront dengan Bun + TypeScript + Next.js 15 App Router + Supabase + Stripe, mencakup storefront lengkap, admin dashboard, UK VAT/shipping, GDPR compliance, dan PDF invoice.
>
> **Deliverables**:
> - Storefront public: homepage, product listing+detail, cart, checkout multi-step, account, orders, wishlist
> - Auth system: register, login, forgot/reset password, OAuth Google, middleware guard
> - Admin dashboard: orders, products, categories, customers, shipping zones, discounts, CMS, settings, audit log, analytics
> - Database: 20+ Supabase tables dengan RLS, triggers, functions
> - Payment: Stripe Payment Element + webhook handler (idempotent)
> - UK specifics: VAT 20%/5%/0%, self-managed shipping zones by postcode, UK address format
> - PDF invoice generation (@react-pdf/renderer, UK legal compliant)
> - GDPR compliance: cookie consent, data export, right-to-erasure
> - Email transactional (Resend): order confirmed, dispatched, abandoned cart, review request
> - Cron jobs: abandoned cart cleanup, audit retention, auto-complete orders
>
> **Estimated Effort**: XL (6–10 minggu solo / 2–3 minggu tim paralel)
> **Parallel Execution**: YES — 10 waves, max 8 tasks concurrent
> **Critical Path**: T1 → T9-T13 → T14-T18 → T22 → T31-T35 → T38-T40 → F1-F4

---

## Context

### Original Request
User meminta work plan untuk spec `ecommerce-boilerplate-spec-uk.md` — spec lengkap 2513 baris e-commerce boilerplate UK-specific.

### Spec Summary
- **Stack**: Bun · TypeScript · Next.js 15 App Router · Supabase · Stripe
- **Market**: UK only, GBP (£), VAT 20% standard
- **Shipping**: Self-managed (bukan Royal Mail/DPD API), UK zones berbasis postcode
- **Checkout**: Wajib login (`checkout_require_account: true`), Stripe Payment Element
- **Admin**: Full dashboard termasuk order management, product CRUD, shipping config, audit log
- **GDPR**: Cookie consent, data export JSON, right-to-erasure, marketing consent explicit

### Metis Review Findings
**Gap diidentifikasi (sudah di-address dalam plan ini)**:
1. Validasi assumptions: B2C only (confirmed), guest checkout disabled (checkout_require_account: true), UK zones include NI + Channel Islands, regex postcode (no external lookup required), admin role: 3-tier (customer/admin/super_admin)
2. Guardrails ditambah: server-authoritative untuk semua kalkulasi harga/VAT/shipping/diskon, idempotency Stripe webhook, forward-only DB migrations
3. Missing tasks ditambahkan: rate limiting middleware, seed fixtures for QA, cron auto-complete orders, webhook replay safety, structured error logging
4. Stack gotchas di-handle: @react-pdf/renderer di nodejs runtime (bukan edge), Stripe webhook dengan `request.text()`, Tailwind v4 CSS entry point setup, Supabase SSR cookie race condition
5. Missing deps ditambahkan: `react-hook-form`, `@hookform/resolvers`, `resend`, `@tiptap/react` + extensions

---

## Work Objectives

### Core Objective
Membangun boilerplate e-commerce UK-ready yang bisa langsung di-clone dan dikustomisasi untuk client baru, dengan semua fitur esensial production-grade sudah tersedia out-of-the-box.

### Concrete Deliverables
- `src/` folder structure sesuai spec (app/, components/, lib/, hooks/, stores/, types/)
- Database migrations (semua tabel, triggers, RLS) via Supabase
- Next.js 15 App Router dengan semua routes (storefront + auth + admin + api)
- Stripe integration (Payment Element + webhook handler)
- PDF invoice (compliant UK VAT invoice format)
- Email transactional templates (Resend)
- Semua halaman storefront, account, dan admin
- GDPR features (cookie banner, data export, deletion request)

### Definition of Done
- [ ] `bun run build` sukses tanpa error TypeScript
- [ ] `bun run lint` lulus tanpa error
- [ ] Semua QA scenarios per task pass (Playwright + curl)
- [ ] Semua RLS policies aktif dan terverifikasi
- [ ] Stripe test payment berhasil (4242424242424242) end-to-end
- [ ] PDF invoice ter-generate dan ter-download
- [ ] Admin dapat update status order + tracking terbentuk
- [ ] GDPR: cookie banner muncul, data export JSON berfungsi

### Must Have
- Semua tabel DB sesuai spec dengan RLS
- Checkout multi-step dengan Stripe Payment Element
- UK postcode validation di semua form address
- VAT calculation (inc/ex VAT, 20%/5%/0%)
- UK shipping zones berbasis postcode
- PDF invoice generation (UK legal compliant)
- Admin order management dengan status update + tracking
- Cookie consent banner (GDPR UK)
- Rate limiting di auth endpoints

### Must NOT Have (Guardrails)
- TIDAK ada guest checkout (checkout_require_account: true — harus akun)
- TIDAK ada multi-currency (GBP only)
- TIDAK ada multi-vendor/marketplace
- TIDAK ada email campaign/blast (newsletter = collect-only)
- TIDAK ada international shipping (UK only, termasuk NI + Channel Islands)
- TIDAK ada subscription/recurring payments
- TIDAK ada raw card data handling (Stripe PCI compliance)
- TIDAK ada server action yang bypass RLS tanpa alasan jelas
- TIDAK ada kalkulasi harga/VAT/shipping/diskon di client-side tanpa server validation
- TIDAK ada service role key di client bundle
- TIDAK boleh pakai edge runtime untuk: @react-pdf/renderer, Stripe secret operations

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — Semua verifikasi dijalankan oleh agent. Tidak ada "manually verify" atau "user checks".

### Test Decision
- **Infrastructure exists**: NO (tidak ada test setup di spec)
- **Automated tests**: NO (tidak ada unit/integration test)
- **Agent-Executed QA**: MANDATORY untuk setiap task

### QA Policy
- **Frontend/UI**: Playwright — navigate, click, fill form, assert DOM, screenshot
- **API/Backend**: Bash (curl) — send requests, assert status + response
- **Database**: Bash (supabase cli / psql) — query tables, verify RLS
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation):
├── Task 1:  Project scaffolding + Next.js 15 + Bun + TS config + shadcn/ui + Tailwind v4 [quick]
├── Task 2:  Type definitions (database.types.ts, order.ts, product.ts, shipping.ts) [quick]
├── Task 3:  Utility libraries (currency.ts, slug.ts, postcode.ts, validation.ts Zod) [quick]
├── Task 4:  Supabase clients (browser, server, admin, middleware) [quick]
├── Task 5:  Stripe client + webhook signature util [quick]
├── Task 6:  VAT calculator + shipping calculator stub + audit logger/diff [quick]
├── Task 7:  Environment variables (.env.local.example) [quick]
└── Task 8:  Global layout + Navbar + Footer + next.config.ts (security headers) [visual-engineering]

Wave 2 (After Wave 1 — database):
├── Task 9:  DB migration 1: profiles, addresses, categories, products, images, variants [unspecified-high]
├── Task 10: DB migration 2: orders, order_items, shipping tables, shipment_tracking [unspecified-high]
├── Task 11: DB migration 3: discounts, wishlists, reviews, pages, settings, GDPR, newsletter, invoices, audit [unspecified-high]
├── Task 12: DB functions, triggers, RLS policies, indexes [unspecified-high]
└── Task 13: Supabase types regen + seed fixtures for QA (products, categories, zones, rates) [quick]

Wave 3 (After Wave 2 — auth + layout):
├── Task 14: Auth pages UI (login, register, forgot-password, reset-password, verify-email) [visual-engineering]
├── Task 15: Auth server actions + Supabase OAuth callback route [unspecified-high]
├── Task 16: Middleware auth guard (route protection + role check + session refresh) [unspecified-high]
├── Task 17: use-auth hook [quick]
└── Task 18: Admin layout (sidebar + topbar + navigation) [visual-engineering]

Wave 4 (After Wave 3 — shared components + cart):
├── Task 19: Address form component (UK format, postcode validation, lookup) [visual-engineering]
├── Task 20: Image upload component (Supabase Storage, drag-drop, compress, reorder) [visual-engineering]
├── Task 21: Cookie consent banner + use-cookie-consent hook [visual-engineering]
├── Task 22: Zustand cart store + use-cart hook + localStorage sync + guest-to-account merge [unspecified-high]
├── Task 23: Cart page UI (line items, qty controls, summary, VAT breakdown) [visual-engineering]
└── Task 24: Newsletter form component (footer + checkout signup) [quick]

Wave 5 (After Wave 4 — storefront pages):
├── Task 25: Homepage (hero, featured categories, featured products, new arrivals, newsletter) [visual-engineering]
├── Task 26: Product listing page (filters, sort, pagination, URL params, responsive grid) [visual-engineering]
├── Task 27: Product detail page (gallery+lightbox, variants, add-to-cart, wishlist, reviews, related) [visual-engineering]
├── Task 28: Wishlist page + Contact page [visual-engineering]
├── Task 29: CMS pages route (/pages/[slug]) + pre-seeded legal pages (5 pages) [unspecified-high]
└── Task 30: Rate limiting middleware (auth, newsletter, shipping calc API) [unspecified-high]

Wave 6 (After Wave 5 — checkout + payment):
├── Task 31: Shipping calculator complete (UK zones, all calc types, postcode edge cases) [unspecified-high]
├── Task 32: Shipping API route (POST /api/shipping/calculate, server-authoritative) [unspecified-high]
├── Task 33: Checkout multi-step (address → shipping → discount → review+payment) [visual-engineering]
├── Task 34: Checkout success page + post-checkout newsletter opt-in [visual-engineering]
└── Task 35: Stripe webhook handler (idempotent, all events, stock decrement, invoice trigger) [unspecified-high]

Wave 7 (After Wave 6 — account + orders + invoice):
├── Task 36: Account pages (profile, addresses mgmt, settings + GDPR: data export + deletion) [visual-engineering]
├── Task 37: Customer order list + order detail + tracking timeline + invoice download [visual-engineering]
├── Task 38: PDF invoice generator (lib/invoice/generator.ts + InvoiceDocument component) [unspecified-high]
├── Task 39: Invoice download API route (/api/invoices/[id]/download) [quick]
└── Task 40: Email templates + Resend helper (semua transactional emails, HTML template) [unspecified-high]

Wave 8 (After Wave 7 — admin product + order + customer):
├── Task 41: Admin products CRUD (list, create, edit: Tiptap, variants, images, VAT config, SEO) [visual-engineering]
├── Task 42: Admin categories management (list, create, edit, hierarchy) [visual-engineering]
├── Task 43: Admin orders management (list+filter, detail, status update, tracking, refund) [visual-engineering]
└── Task 44: Admin customers management (list, detail + order history, GDPR deletion) [visual-engineering]

Wave 9 (After Wave 8 — admin advanced):
├── Task 45: Admin shipping zones + rates management (zone editor, rate config, test calculator) [visual-engineering]
├── Task 46: Admin discounts/coupons management (list, create, deactivate, usage tracking) [visual-engineering]
├── Task 47: Admin CMS pages editor (Tiptap, publish/draft, SEO preview) [visual-engineering]
└── Task 48: Admin settings (6 halaman: general, payment, email, legal, newsletter subscribers + CSV export, shipping defaults) [visual-engineering]

Wave 10 (After Wave 9 — audit + analytics + cron):
├── Task 49: Audit log system (logger.ts, diff.ts, admin audit log page + per-entity tabs) [unspecified-high]
├── Task 50: Admin dashboard overview (metrics + time toggle, chart, alerts, recent orders) [visual-engineering]
├── Task 51: Admin analytics page (sales overview, revenue chart) [visual-engineering]
└── Task 52: Cron jobs (abandoned cart, audit retention, auto-complete orders, cancel pending) [unspecified-high]

Wave FINAL (After All — 4 parallel review agents):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review (tsc + lint + best practices) [unspecified-high]
├── Task F3: Real QA end-to-end (Playwright full flow) [unspecified-high]
└── Task F4: Scope fidelity check [deep]

Critical Path: T1 → T4 → T9 → T12 → T15 → T22 → T31 → T35 → T38 → T49 → F1-F4
Parallel Speedup: ~75% faster than sequential
Max Concurrent: 8 (Wave 1)
```

### Agent Dispatch Summary

| Wave | Tasks | Count | Categories |
|------|-------|-------|-----------|
| 1 | T1-T8 | 8 | quick (x7), visual-engineering (x1) |
| 2 | T9-T13 | 5 | unspecified-high (x4), quick (x1) |
| 3 | T14-T18 | 5 | visual-engineering (x2), unspecified-high (x2), quick (x1) |
| 4 | T19-T24 | 6 | visual-engineering (x4), unspecified-high (x1), quick (x1) |
| 5 | T25-T30 | 6 | visual-engineering (x4), unspecified-high (x2) |
| 6 | T31-T35 | 5 | unspecified-high (x3), visual-engineering (x2) |
| 7 | T36-T40 | 5 | visual-engineering (x2), unspecified-high (x2), quick (x1) |
| 8 | T41-T44 | 4 | visual-engineering (x4) |
| 9 | T45-T48 | 4 | visual-engineering (x4) |
| 10 | T49-T52 | 4 | unspecified-high (x2), visual-engineering (x2) |
| FINAL | F1-F4 | 4 | oracle, unspecified-high (x2), deep |

---

## TODOs

- [ ] 1. Project Scaffolding + Next.js 15 + Bun + TypeScript + shadcn/ui + Tailwind v4

  **What to do**:
  - Init project: `bun create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (Next.js 15)
  - Setup Bun sebagai runtime: verifikasi `bun.lockb`, pastikan `package.json` pakai `"runtime": "bun"` jika needed
  - Install semua dependencies: `bun add @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js @stripe/react-stripe-js zustand zod @tanstack/react-query @tanstack/react-table motion lucide-react sonner @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @react-pdf/renderer react-hook-form @hookform/resolvers resend`
  - Install shadcn/ui: `bunx shadcn@latest init` — pilih: New York style, Zinc color, CSS variables ON
  - Install komponen shadcn yang dibutuhkan: `bunx shadcn@latest add button input label form select textarea badge card dialog sheet dropdown-menu table tabs toast separator skeleton avatar popover command checkbox radio-group slider switch`
  - Konfigurasi Tailwind v4: update `app/globals.css` dengan proper CSS entry point (`@import "tailwindcss"`) — BUKAN `@tailwind base/components/utilities` (itu Tailwind v3)
  - Konfigurasi TypeScript: `tsconfig.json` strict mode ON, path alias `@/*` ke `./src/*`
  - Setup ESLint + Prettier: `.eslintrc.json` dengan next/core-web-vitals, prettier plugin

  **Must NOT do**:
  - JANGAN pakai `@tailwind base` / `@tailwind components` (itu syntax Tailwind v3)
  - JANGAN install `framer-motion` (sudah ada `motion`)
  - JANGAN setup test infrastructure (tidak ada di scope)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Scaffolding + install dependencies adalah task yang well-defined dan cepat
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (dengan T2-T8)
  - **Blocks**: Semua task berikutnya
  - **Blocked By**: None (start immediately)

  **References**:
  - Spec section 1.1 (folder structure) dan section 14 (dependencies)
  - Tailwind v4 docs: https://tailwindcss.com/docs/v4-beta (setup berbeda dari v3!)
  - shadcn/ui: https://ui.shadcn.com/docs/installation/next
  - Next.js 15 + Bun: pastikan `bun.lockb` ada, jalankan dengan `bun run dev`

  **Acceptance Criteria**:
  - [ ] `bun run dev` berjalan tanpa error di localhost:3000
  - [ ] `bun run build` sukses (0 errors)
  - [ ] shadcn/ui Button component bisa diimport dan dirender
  - [ ] Tailwind class `bg-primary text-primary-foreground` bekerja

  **QA Scenarios**:
  ```
  Scenario: Dev server starts successfully
    Tool: Bash
    Steps:
      1. bun run dev
      2. curl http://localhost:3000 -I
    Expected Result: HTTP 200
    Evidence: .sisyphus/evidence/task-1-dev-server.txt

  Scenario: Build succeeds
    Tool: Bash
    Steps:
      1. bun run build 2>&1
    Expected Result: "✓ Compiled successfully" atau "Build successful", 0 errors
    Evidence: .sisyphus/evidence/task-1-build.txt
  ```

  **Commit**: YES (wave 1 group)
  - Message: `feat(foundation): project scaffolding Next.js 15 + shadcn/ui + Tailwind v4`

---

- [ ] 2. Type Definitions

  **What to do**:
  - Buat `src/types/database.types.ts` — TypeScript types yang sesuai semua tabel DB dari spec (profiles, addresses, categories, products, product_images, product_variants, orders, order_items, shipping_zones, shipping_zone_regions, shipping_rates, shipment_tracking, discounts, discount_usage, wishlists, reviews, pages, store_settings, data_deletion_requests, newsletter_subscribers, invoices, admin_audit_log)
  - Tipe include: enum `OrderStatus`, dan semua row types + insert types + update types
  - Buat `src/types/order.ts` — OrderStatus, OrderWithItems, OrderItem, ShippingAddress (snapshot), StatusHistory entry
  - Buat `src/types/product.ts` — Product, ProductWithImages, ProductVariant, ProductWithVariants, CartItem
  - Buat `src/types/shipping.ts` — ShippingZone, ShippingRate, ShippingOption (untuk checkout display), ShippingCalculationResult

  **Must NOT do**:
  - JANGAN gunakan `any` type
  - JANGAN generate dari Supabase CLI dulu (belum ada DB) — buat manual berdasarkan spec

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure TypeScript type definitions, tidak ada logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (dengan T1, T3-T8)
  - **Blocks**: T6, T9-T13, semua task yang pakai types
  - **Blocked By**: None

  **References**:
  - Spec section 2.1 (Database Schema) — semua kolom tabel
  - Spec section `src/types/` dalam folder structure
  - OrderStatus enum dari spec: `pending_payment | paid | processing | shipped | in_transit | out_for_delivery | delivered | completed | cancelled | refunded`

  **Acceptance Criteria**:
  - [ ] `bun run type-check` (atau `tsc --noEmit`) sukses setelah types dibuat
  - [ ] Semua enum OrderStatus cocok dengan spec

  **QA Scenarios**:
  ```
  Scenario: TypeScript compiles without errors
    Tool: Bash
    Steps:
      1. bun run type-check (atau tsc --noEmit)
    Expected Result: 0 errors, 0 warnings
    Evidence: .sisyphus/evidence/task-2-typecheck.txt
  ```

  **Commit**: YES (wave 1 group)

---

- [ ] 3. Utility Libraries

  **What to do**:
  - Buat `src/lib/utils/currency.ts`:
    - `formatGBP(pence: number): string` → `£29.99`
    - `formatGBPFromPence(pence: number): string` → display helper
    - `penceToPounds(pence: number): number` → 2999 → 29.99
    - `poundsToPence(pounds: number): number` → 29.99 → 2999
  - Buat `src/lib/utils/slug.ts`:
    - `slugify(text: string): string` → "Hello World!" → "hello-world"
    - Handle UK-specific chars
  - Buat `src/lib/utils/postcode.ts` **sesuai spec persis**:
    - `UK_POSTCODE_REGEX` (regex dari spec)
    - `validateUKPostcode(postcode: string): boolean`
    - `getOutwardCode(postcode: string): string` — "SW1A 1AA" → "SW1A"
    - `getPostcodeArea(postcode: string): string` — "SW1A 1AA" → "SW"
    - `formatPostcode(postcode: string): string` — "sw1a1aa" → "SW1A 1AA"
    - Handle edge cases: GIR 0AA, lowercase, extra spaces, BFPO (BF1)
  - Buat `src/lib/utils/validation.ts` — Zod schemas:
    - `ukPhoneSchema` (UK format: +44 or 07xxx, 10-11 digits)
    - `ukPostcodeSchema` (validasi dengan UK_POSTCODE_REGEX)
    - `addressSchema` (semua field address UK)
    - `emailSchema`
    - `passwordSchema` (min 8 chars, uppercase, number)
    - `productSchema`, `orderSchema` untuk server actions
  - Tambahkan `cn()` helper dari shadcn/ui di `src/lib/utils.ts` (sudah auto-generate shadcn, verify ada)

  **Must NOT do**:
  - JANGAN accept non-UK postcodes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure utility functions, deterministic, easily testable
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (dengan T1-T2, T4-T8)
  - **Blocks**: T6, T19, T31, T33 (semua yang butuh postcode/currency)
  - **Blocked By**: None

  **References**:
  - Spec section 4.2 (Postcode Validation & Lookup) — kode exact ada di spec
  - Spec section `src/lib/utils/` folder structure

  **Acceptance Criteria**:
  - [ ] `formatGBP(2999)` → `"£29.99"`
  - [ ] `validateUKPostcode("SW1A 1AA")` → `true`
  - [ ] `validateUKPostcode("INVALID")` → `false`
  - [ ] `getOutwardCode("SW1A 1AA")` → `"SW1A"`
  - [ ] `formatPostcode("sw1a1aa")` → `"SW1A 1AA"`
  - [ ] `validateUKPostcode("GIR 0AA")` → `true` (special case)

  **QA Scenarios**:
  ```
  Scenario: Currency formatting
    Tool: Bash
    Steps:
      1. node -e "const {formatGBP} = require('./src/lib/utils/currency'); console.log(formatGBP(2999))"
    Expected Result: "£29.99"
    Evidence: .sisyphus/evidence/task-3-currency.txt

  Scenario: Postcode edge cases
    Tool: Bash
    Steps:
      1. Jalankan validation tests untuk beberapa postcode valid dan invalid
    Expected Result: Valid postcodes return true, invalid return false
    Evidence: .sisyphus/evidence/task-3-postcode.txt
  ```

  **Commit**: YES (wave 1 group)

---

- [ ] 4. Supabase Client Setup

  **What to do**:
  - Buat `src/lib/supabase/client.ts`:
    ```typescript
    import { createBrowserClient } from '@supabase/ssr'
    export function createClient() {
      return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    }
    ```
  - Buat `src/lib/supabase/server.ts` (server component client via cookies):
    ```typescript
    import { createServerClient } from '@supabase/ssr'
    import { cookies } from 'next/headers'
    export async function createClient() { ... }
    ```
  - Buat `src/lib/supabase/admin.ts` (service role, server-only):
    ```typescript
    import { createClient } from '@supabase/supabase-js'
    export function createAdminClient() {
      return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    }
    ```
    PENTING: Export ini HANYA boleh diimport di server components/actions/route handlers
  - Buat `src/lib/supabase/middleware.ts` — helper untuk update session di middleware

  **Must NOT do**:
  - JANGAN import `admin.ts` dari client components
  - JANGAN expose `SUPABASE_SERVICE_ROLE_KEY` ke client bundle
  - JANGAN pakai `createClient` dari `@supabase/supabase-js` langsung untuk SSR (gunakan `@supabase/ssr`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Boilerplate client setup dari dokumentasi resmi Supabase
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (dengan T1-T3, T5-T8)
  - **Blocks**: T9-T13, T14-T18, semua task yang butuh Supabase
  - **Blocked By**: None (butuh env vars dari T7 tapi bisa pakai placeholder)

  **References**:
  - Supabase SSR docs: https://supabase.com/docs/guides/auth/server-side/nextjs
  - Spec section `src/lib/supabase/` folder structure
  - PENTING: Gunakan `@supabase/ssr` bukan `@supabase/auth-helpers-nextjs` (deprecated)
  - Middleware race condition: pastikan cookies di-refresh di setiap request (ikuti panduan Supabase SSR persis)

  **Acceptance Criteria**:
  - [ ] `createClient()` tidak throw error (dengan env vars)
  - [ ] `createAdminClient()` menggunakan service role key
  - [ ] TypeScript tidak ada error

  **QA Scenarios**:
  ```
  Scenario: Browser client dapat diinstansiasi
    Tool: Bash
    Steps:
      1. bun run type-check
    Expected Result: 0 errors untuk semua supabase client files
    Evidence: .sisyphus/evidence/task-4-typecheck.txt
  ```

  **Commit**: YES (wave 1 group)

---

- [ ] 5. Stripe Client Setup

  **What to do**:
  - Buat `src/lib/stripe/client.ts`:
    ```typescript
    import Stripe from 'stripe'
    export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })
    ```
    Server-only — JANGAN import di client components
  - Buat `src/lib/stripe/webhooks.ts`:
    - `verifyStripeWebhook(body: string, signature: string): Stripe.Event` — wrapper untuk `stripe.webhooks.constructEvent()`
    - Handler pattern untuk event routing
  - Buat `src/lib/stripe/index.ts` — barrel export (hanya server exports)

  **Must NOT do**:
  - JANGAN expose `STRIPE_SECRET_KEY` ke client
  - JANGAN gunakan Stripe client di edge runtime (gunakan nodejs runtime)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T33, T35 (checkout + webhook)
  - **Blocked By**: None

  **References**:
  - Spec section `src/lib/stripe/`, section 6.3 (webhook), section 6.1 (checkout)
  - Stripe API version: gunakan latest dari `stripe` v17 package

  **Acceptance Criteria**:
  - [ ] `import { stripe } from '@/lib/stripe/client'` tidak error di server context
  - [ ] TypeScript compiles

  **QA Scenarios**:
  ```
  Scenario: Stripe client type-checks
    Tool: Bash
    Steps: bun run type-check
    Expected Result: 0 errors untuk stripe files
    Evidence: .sisyphus/evidence/task-5-typecheck.txt
  ```

  **Commit**: YES (wave 1 group)

---

- [ ] 6. VAT Calculator + Shipping Calculator Stub + Audit Logger

  **What to do**:
  - Buat `src/lib/vat/calculator.ts` **sesuai spec section 6.2 persis**:
    - `interface VatBreakdown { price_ex_vat_pence, vat_amount_pence, price_inc_vat_pence }`
    - `calculateVat(price_pence, price_includes_vat, vat_rate): VatBreakdown`
    - `getDisplayPrice(product): number` — selalu return inc-VAT price
    - `calculateCartVat(items): { subtotal_ex_vat_pence, total_vat_pence, total_inc_vat_pence }`
    - Gunakan `Math.round()` untuk semua kalkulasi pence (no floating point issues)
  - Buat `src/lib/shipping/calculator.ts` stub (implementasi penuh di T31):
    - Interface `ShippingOption`, `CartItem` (untuk calculator)
    - Stub function `calculateShipping(postcode, cart_items, subtotal_pence): Promise<ShippingOption[]>` yang return `[]`
    - Helper stubs: `findMatchingZone()`, `getActiveRates()`, `calculateTieredWeight()`
  - Buat `src/lib/audit/logger.ts`:
    - `interface AuditLogParams` sesuai spec section 17.2
    - `logAdminAction(params, request?): Promise<void>` — panggil Supabase RPC `log_admin_action`
  - Buat `src/lib/audit/diff.ts`:
    - `generateChanges(oldRecord, newRecord, fieldsToTrack): Record<string, {old, new}> | null`

  **Must NOT do**:
  - JANGAN pakai floating point untuk kalkulasi harga (selalu integer pence)
  - JANGAN panggil `logAdminAction` dari client components

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T31 (shipping calculator full), T35 (webhook), T43 (admin orders)
  - **Blocked By**: None

  **References**:
  - Spec section 6.2 (VAT Handling) — kode TypeScript lengkap ada di spec, copy persis
  - Spec section 5.2 (Shipping Cost Calculation) — interface dan function signatures
  - Spec section 17.2 (Audit Logger) — kode TypeScript ada di spec

  **Acceptance Criteria**:
  - [ ] `calculateVat(2999, true, 20)` → `{ price_ex_vat_pence: 2499, vat_amount_pence: 500, price_inc_vat_pence: 2999 }`
  - [ ] `calculateVat(2999, false, 20)` → `{ price_ex_vat_pence: 2999, vat_amount_pence: 600, price_inc_vat_pence: 3599 }`
  - [ ] TypeScript 0 errors

  **QA Scenarios**:
  ```
  Scenario: VAT calculation accuracy
    Tool: Bash
    Steps:
      1. node -e "test calculateVat with inc-VAT price 2999 at 20%"
    Expected Result: ex-VAT = 2499, VAT = 500 (verified: 2499 + 500 = 2999 ✓)
    Evidence: .sisyphus/evidence/task-6-vat-calc.txt

  Scenario: Cart VAT calculation with mixed items
    Tool: Bash
    Steps:
      1. calculateCartVat([{price_pence:2999, price_includes_vat:true, vat_rate:20, quantity:2}])
    Expected Result: subtotal_ex_vat = 4998, total_vat = 1002, total_inc = 5998
    Evidence: .sisyphus/evidence/task-6-cart-vat.txt
  ```

  **Commit**: YES (wave 1 group)

---

- [ ] 7. Environment Variables Setup

  **What to do**:
  - Buat `.env.local.example` dengan semua env vars dari spec section 1.2:
    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
    SUPABASE_SERVICE_ROLE_KEY=eyJ...
    
    # Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    
    # App
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    NEXT_PUBLIC_STORE_NAME="My Store"
    NEXT_PUBLIC_CURRENCY=GBP
    NEXT_PUBLIC_VAT_RATE=20
    NEXT_PUBLIC_COUNTRY=GB
    
    # Email (Resend)
    RESEND_API_KEY=re_...
    RESEND_FROM_EMAIL=noreply@mystore.co.uk
    ```
  - Buat `.env.local` dari template (untuk development — gitignored)
  - Pastikan `.gitignore` include `.env.local`
  - Buat `src/lib/env.ts` — type-safe env validation dengan Zod:
    - Server env: SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY
    - Public env: NEXT_PUBLIC_SUPABASE_URL, dll
    - Throw error saat startup jika env vars missing

  **Must NOT do**:
  - JANGAN commit `.env.local` (hanya `.env.local.example`)
  - JANGAN expose server env vars ke public (NEXT_PUBLIC_*)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Semua task yang butuh env vars
  - **Blocked By**: None

  **References**:
  - Spec section 1.2 (Environment Variables)

  **Acceptance Criteria**:
  - [ ] `.env.local.example` ada dengan semua required vars
  - [ ] `.env.local` di `.gitignore`
  - [ ] `src/lib/env.ts` throw error yang jelas jika missing env

  **QA Scenarios**:
  ```
  Scenario: Missing env var throws clear error
    Tool: Bash
    Steps:
      1. Hapus salah satu env var required
      2. bun run build atau import env.ts
    Expected Result: Error message yang jelas: "Missing required env: STRIPE_SECRET_KEY"
    Evidence: .sisyphus/evidence/task-7-env-validation.txt
  ```

  **Commit**: YES (wave 1 group)

---

- [ ] 8. Global Layout + Navbar + Footer + next.config.ts

  **What to do**:
  - Update `src/app/layout.tsx` — root layout: font loading (Geist atau Inter), Providers wrapper (QueryClient, Sonner toaster), metadata defaults (store name, UK locale)
  - Buat `src/app/(storefront)/layout.tsx` — storefront layout dengan Navbar + Footer
  - Buat `src/components/storefront/navbar.tsx`:
    - Logo (link ke /)
    - Nav links: Products, About (CMS), Contact
    - Search icon (opsional placeholder)
    - Cart icon dengan badge count (dari useCart hook)
    - Auth: "Login / Register" atau User menu (Avatar + dropdown: My Account, Orders, Logout)
    - Mobile: hamburger menu + slide-out sheet
  - Buat `src/components/storefront/footer.tsx`:
    - Store name + tagline
    - Link kolom: Products, Help (CMS pages), Legal
    - Social links (dari store_settings)
    - Company info: registration number, VAT number (UK legal requirement)
    - Newsletter form placeholder (component from T24)
    - "© 2025 Store Name. All rights reserved."
  - Buat `next.config.ts`:
    ```typescript
    const securityHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      // CSP akan dikonfigurasi lebih lanjut di T52
    ]
    ```
    - `images.remotePatterns`: Supabase storage domain
    - `experimental.serverActions: { bodySizeLimit: '2mb' }` untuk image upload

  **Must NOT do**:
  - JANGAN pakai inline styles untuk security headers
  - Navbar JANGAN mengandung hardcoded text (gunakan store_settings atau env vars)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Layout + navigation components butuh design sensibility
  - **Skills**: [`shadcn-ui`]
    - `shadcn-ui`: Navbar menggunakan shadcn Sheet, DropdownMenu, Avatar components

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T14, T25-T29 (semua storefront pages)
  - **Blocked By**: T1 (shadcn/ui harus sudah installed)

  **References**:
  - Spec section 1.1 (folder structure: `(storefront)/layout.tsx`)
  - Spec section 12 (Security headers)
  - Spec section 10.3 (company info di footer — UK legal requirement)

  **Acceptance Criteria**:
  - [ ] Navbar render di semua storefront pages
  - [ ] Footer tampil dengan UK legal info placeholder
  - [ ] Mobile navbar (hamburger) berfungsi
  - [ ] Security headers ada di response (verifikasi via curl)

  **QA Scenarios**:
  ```
  Scenario: Security headers present
    Tool: Bash
    Steps:
      1. curl -I http://localhost:3000
      2. Check headers: X-Frame-Options, X-Content-Type-Options
    Expected Result: Kedua header present dengan nilai yang benar
    Evidence: .sisyphus/evidence/task-8-security-headers.txt

  Scenario: Mobile navbar works
    Tool: Playwright
    Steps:
      1. Set viewport to 375x812 (iPhone)
      2. Navigate to http://localhost:3000
      3. Click hamburger button (selector: [data-testid="mobile-menu-toggle"])
      4. Assert nav links visible
    Expected Result: Slide-out menu opens with navigation links
    Evidence: .sisyphus/evidence/task-8-mobile-nav.png
  ```

  **Commit**: YES (wave 1 group)
  - Message: `feat(foundation): project scaffolding, types, utils, clients, layout`

---

- [ ] 9. DB Migration 1 — Core Product Tables

  **What to do**:
  - Jalankan migration via Supabase CLI (`supabase migration new core_tables && supabase db push`)
  - Atau langsung via Supabase Dashboard SQL Editor
  - SQL yang harus di-execute (sesuai spec section 2.1):
    - `CREATE TABLE public.profiles` (extends auth.users, role enum: customer/admin/super_admin, GDPR fields)
    - `CREATE TABLE public.addresses` (UK format, UNIQUE INDEX untuk default per user)
    - `CREATE TABLE public.categories` (tree hierarchy via parent_id)
    - `CREATE TABLE public.products` (semua kolom: price_pence, vat_rate, price_includes_vat, dimensions, inventory, SEO, tags[])
    - `CREATE TABLE public.product_images` (sort_order, is_primary)
    - `CREATE TABLE public.product_variants` (options JSONB: {"colour": "Red", "size": "XL"})
    - Semua indexes (idx_products_category, idx_products_active, dll)
  - Verifikasi semua kolom match spec

  **Must NOT do**:
  - JANGAN store harga dalam pounds/float (gunakan BIGINT pence)
  - JANGAN skip constraints (role CHECK, unique indexes)
  - JANGAN forget `DEFAULT gen_random_uuid()` untuk id

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: SQL migration complex, butuh attention to detail untuk semua constraints
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T10, T11, T12 — tapi T9 harus selesai sebelum T12 karena triggers reference tables ini)
  - **Parallel Group**: Wave 2 (dengan T10-T13, tapi T12 blocked by T9+T10+T11)
  - **Blocks**: T12, T13, semua task yang butuh DB
  - **Blocked By**: T4 (Supabase client), T7 (env vars)

  **References**:
  - Spec section 2.1 — SQL schema untuk: profiles, addresses, categories, products, product_images, product_variants (COPY EXACT dari spec)
  - Spec: `price_pence BIGINT NOT NULL` — semua harga dalam pence
  - Spec: `postcode TEXT NOT NULL` — UK postcode format

  **Acceptance Criteria**:
  - [ ] Semua 6 tabel ada di Supabase
  - [ ] Constraints berjalan (coba insert role invalid → error)
  - [ ] Unique index pada `addresses.is_default` per user berfungsi
  - [ ] `products.slug` unique constraint berfungsi

  **QA Scenarios**:
  ```
  Scenario: Tables exist in Supabase
    Tool: Bash
    Steps:
      1. curl Supabase REST API: GET /rest/v1/products?limit=1
    Expected Result: HTTP 200, array response (empty OK)
    Evidence: .sisyphus/evidence/task-9-tables-exist.txt

  Scenario: Price in pence constraint
    Tool: Bash (supabase cli atau curl)
    Steps:
      1. Coba insert product dengan price_pence = -1 (invalid)
    Expected Result: INSERT fails atau data tidak valid tersimpan
    Evidence: .sisyphus/evidence/task-9-constraints.txt
  ```

  **Commit**: YES (wave 2 group)

---

- [ ] 10. DB Migration 2 — Orders + Shipping Tables

  **What to do**:
  - SQL migration (sesuai spec section 2.1):
    - `CREATE TYPE order_status AS ENUM (...)` — semua 10 status
    - `CREATE TABLE public.orders` (snapshot addresses JSONB, status_history JSONB, semua pricing columns pence, Stripe fields)
    - `CREATE TABLE public.order_items` (snapshot product name/price at time of purchase)
    - `CREATE TABLE public.shipping_zones` (name, description, sort_order)
    - `CREATE TABLE public.shipping_zone_regions` (match_type: postcode_prefix/postcode_area/country, match_value)
    - `CREATE TABLE public.shipping_rates` (calculation_type enum, weight_tiers JSONB, dll)
    - `CREATE TABLE public.shipment_tracking` (status, location, description, tracked_at)
    - Semua indexes

  **Must NOT do**:
  - JANGAN FK ke `addresses.id` dari orders (orders simpan address SNAPSHOT di JSONB, bukan FK)
  - JANGAN lupa `order_number` unique constraint

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (parallel dengan T9, T11)
  - **Parallel Group**: Wave 2
  - **Blocks**: T12, T35 (webhook), T36-T37 (account/orders)
  - **Blocked By**: T4, T7

  **References**:
  - Spec section 2.1 — SQL untuk: orders, order_items, shipping_zones, shipping_zone_regions, shipping_rates, shipment_tracking
  - Spec section 5.1 (UK Shipping Zones concept) — untuk memahami zone structure
  - Spec: `shipping_address JSONB NOT NULL` (snapshot, BUKAN FK ke addresses table)

  **Acceptance Criteria**:
  - [ ] `order_status` enum ada dengan semua 10 values
  - [ ] `orders` table ada dengan `shipping_address JSONB` (bukan FK)
  - [ ] `shipping_zone_regions.match_type` CHECK constraint berfungsi
  - [ ] Index `idx_zone_regions_match` ada

  **QA Scenarios**:
  ```
  Scenario: Order status enum works
    Tool: Bash
    Steps:
      1. curl Supabase: INSERT order dengan status invalid → expect 400 error
    Expected Result: Error "invalid input value for enum order_status"
    Evidence: .sisyphus/evidence/task-10-enum-constraint.txt
  ```

  **Commit**: YES (wave 2 group)

---

- [ ] 11. DB Migration 3 — Supporting Tables

  **What to do**:
  - SQL migration (sesuai spec section 2.1):
    - `CREATE TABLE public.discounts` (type: percentage/fixed_amount/free_shipping, applicable_to, applicable_ids UUID[])
    - `CREATE TABLE public.discount_usage` (UNIQUE per discount+user+order)
    - `CREATE TABLE public.wishlists` (UNIQUE user+product)
    - `CREATE TABLE public.reviews` (rating 1-5 CHECK, is_approved, admin_reply, UNIQUE per product+user+order)
    - `CREATE TABLE public.pages` (CMS: title, slug UNIQUE, content, is_published)
    - `CREATE TABLE public.store_settings` (key-value JSONB) + INSERT default UK values
    - `CREATE TABLE public.data_deletion_requests` (GDPR)
    - `CREATE TABLE public.newsletter_subscribers` (email UNIQUE, source, is_active)
    - `CREATE TABLE public.invoices` (invoice_number UNIQUE, pdf_url, pence amounts)
    - `CREATE TABLE public.admin_audit_log` (semua indexes untuk filtering)
    - Semua indexes

  **Must NOT do**:
  - JANGAN lupa INSERT default store_settings dengan UK values (currency: GBP, vat_rate: 20, timezone: Europe/London, dll)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (parallel dengan T9, T10)
  - **Parallel Group**: Wave 2
  - **Blocks**: T12
  - **Blocked By**: T4, T7

  **References**:
  - Spec section 2.1 — SQL untuk semua tables supporting (COPY EXACT dari spec)
  - Spec section 2.1 INSERT store_settings — **WAJIB** insert semua default values UK
  - Spec: `gdpr_data_retention_days: 730` default

  **Acceptance Criteria**:
  - [ ] Semua tabel ada
  - [ ] `store_settings` terisi default UK values (currency: GBP, vat_rate: 20, timezone: Europe/London)
  - [ ] `reviews.rating` CHECK constraint 1-5 berfungsi
  - [ ] `discounts.type` CHECK constraint berfungsi

  **QA Scenarios**:
  ```
  Scenario: Store settings defaults present
    Tool: Bash
    Steps:
      1. curl GET /rest/v1/store_settings?key=eq.currency
    Expected Result: [{"key": "currency", "value": "\"GBP\""}]
    Evidence: .sisyphus/evidence/task-11-store-settings.txt
  ```

  **Commit**: YES (wave 2 group)

---

- [ ] 12. DB Functions, Triggers + RLS Policies

  **What to do**:
  - Execute semua SQL dari spec section 2.2 (Functions & Triggers):
    - `update_updated_at()` trigger function + triggers untuk profiles, products, orders, addresses
    - `handle_new_user()` trigger — auto-create profile on auth.users INSERT
    - `generate_order_number()` trigger — format ORD-YYYYMMDD-XXXX
    - `decrement_stock_on_paid()` trigger — kurangi stock ketika order → paid
    - `restore_stock_on_cancel()` trigger — restore stock ketika cancelled/refunded
    - `generate_invoice_number()` trigger — format INV-YYYYMMDD-XXXX
    - `create_invoice_on_paid()` trigger — auto-create invoice record ketika paid
    - `log_admin_action()` RPC function
  - Execute semua RLS policies dari spec section 2.3:
    - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` untuk semua tabel
    - Policies untuk: profiles, addresses, orders, wishlists, reviews, data_deletion_requests, newsletter_subscribers, invoices, admin_audit_log

  **Must NOT do**:
  - JANGAN lupa SECURITY DEFINER untuk trigger functions yang butuh elevated permissions
  - JANGAN allow anon access ke tables yang seharusnya authenticated-only

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (harus tunggu T9, T10, T11 selesai)
  - **Parallel Group**: Wave 2 — tapi T12 blocked by T9+T10+T11
  - **Blocks**: T13, T14, semua tasks yang butuh auth/data
  - **Blocked By**: T9, T10, T11

  **References**:
  - Spec section 2.2 (DB Functions & Triggers) — COPY EXACT SQL dari spec
  - Spec section 2.3 (RLS) — COPY EXACT policies dari spec
  - PENTING: RLS harus di-enable SETELAH tabel dibuat (T9-T11)

  **Acceptance Criteria**:
  - [ ] `handle_new_user()` trigger berfungsi: register user → profile row auto-created
  - [ ] `generate_order_number()` berfungsi: insert order → `order_number` terisi ORD-format
  - [ ] RLS: customer tidak bisa SELECT orders milik customer lain
  - [ ] RLS: anon tidak bisa SELECT ke `admin_audit_log`
  - [ ] `decrement_stock_on_paid()` mengurangi stok ketika status changed ke paid

  **QA Scenarios**:
  ```
  Scenario: Auto-create profile on signup
    Tool: Bash (curl Supabase Auth API)
    Steps:
      1. POST /auth/v1/signup dengan email+password baru
      2. GET /rest/v1/profiles?id=eq.{new_user_id} dengan service role key
    Expected Result: Profile row ada dengan email yang benar, role = 'customer'
    Evidence: .sisyphus/evidence/task-12-profile-trigger.txt

  Scenario: RLS blocks cross-user data access
    Tool: Bash
    Steps:
      1. Login sebagai user A, dapatkan access token
      2. Coba GET /rest/v1/orders?user_id=eq.{user_B_id} dengan token user A
    Expected Result: HTTP 200 dengan empty array (RLS filter)
    Evidence: .sisyphus/evidence/task-12-rls-orders.txt

  Scenario: Stock decremented on payment
    Tool: Bash
    Steps:
      1. Set product stock_quantity = 10
      2. Create order dengan product qty 2, update status ke 'paid'
      3. Check product stock_quantity
    Expected Result: stock_quantity = 8
    Evidence: .sisyphus/evidence/task-12-stock-decrement.txt
  ```

  **Commit**: YES (wave 2 group)
  - Message: `feat(database): schema migrations, functions, triggers, RLS policies`

---

- [ ] 13. Supabase Types Regen + QA Seed Fixtures

  **What to do**:
  - Regenerate TypeScript types dari Supabase: `bunx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts`
  - Verifikasi generated types match spec
  - Buat `src/lib/supabase/seed.ts` — seed data untuk QA:
    - 2 categories (Electronics, Clothing)
    - 3 products dengan images dan variants (1 dengan variants size/colour, 1 simple, 1 featured)
    - 1 shipping zone "London" + 1 "Mainland UK" dengan rates (standard + express)
    - 1 discount code "WELCOME10" (10%, min £20)
    - 1 CMS pages (stub untuk legal pages — akan diisi di T29)
  - Buat npm script: `"seed": "bun run src/lib/supabase/seed.ts"` untuk convenience
  - Pastikan seed bisa dijalankan ulang tanpa error (upsert, bukan insert)

  **Must NOT do**:
  - JANGAN commit real data atau data yang mengandung PII
  - JANGAN hardcode UUID (gunakan gen_random_uuid() atau let DB generate)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (setelah T12)
  - **Parallel Group**: Wave 2 tail
  - **Blocks**: T14+ (QA scenarios butuh seed data)
  - **Blocked By**: T9, T10, T11, T12

  **References**:
  - Spec section 5.1 (UK Shipping Zones) — zone names + postcode matches
  - Supabase CLI docs untuk type generation

  **Acceptance Criteria**:
  - [ ] `src/types/database.types.ts` ter-generate dari actual DB schema
  - [ ] `bun run seed` sukses
  - [ ] Data ada di DB setelah seed (verifikasi via Supabase dashboard atau curl)

  **QA Scenarios**:
  ```
  Scenario: Seed runs successfully
    Tool: Bash
    Steps:
      1. bun run seed
      2. curl GET /rest/v1/products?limit=5
    Expected Result: HTTP 200, array dengan 3 products
    Evidence: .sisyphus/evidence/task-13-seed.txt
  ```

  **Commit**: YES (wave 2 group)

---

- [ ] 14. Auth Pages UI

  **What to do**:
  - Buat `src/app/(auth)/layout.tsx` — centered layout, minimal (no navbar/footer), store logo
  - Buat `src/app/(auth)/login/page.tsx`:
    - Form: email + password (react-hook-form + zod)
    - Real-time validation (email format, password non-empty)
    - "Remember me" checkbox
    - "Forgot password?" link
    - Submit button dengan loading spinner
    - "Don't have an account? Register" link
    - Pesan error: "Incorrect email or password" (generic, JANGAN reveal mana yang salah)
    - Max 5 failed attempts → tampilkan cooldown timer
    - Redirect ke `/admin` jika role admin, ke sebelumnya (via `redirect` param) jika customer
  - Buat `src/app/(auth)/register/page.tsx`:
    - Form: full_name, email, password, confirm password
    - Password strength indicator (weak/fair/strong)
    - Real-time match indicator untuk confirm password
    - Marketing consent checkbox (GDPR — unchecked default): "I'd like to receive offers and updates"
    - Link to Privacy Policy
    - Submit → redirect ke "Check your email" state (inline message, bukan redirect page)
    - "Resend email" button (rate limited, 60s cooldown)
  - Buat `src/app/(auth)/forgot-password/page.tsx`:
    - Form: email only
    - SELALU tampilkan: "If that email is registered, we've sent a reset link" (jangan reveal apakah email exist)
  - Buat `src/app/(auth)/reset-password/page.tsx`:
    - Form: new password + confirm password
    - Validation: min 8 chars, uppercase, number
    - Handle edge cases: link expired, token sudah dipakai
  - Buat `src/app/(auth)/verify-email/page.tsx`:
    - Landing page setelah klik email verification link
    - "Email verified! Welcome aboard" → auto-redirect ke homepage setelah 3 detik

  **Must NOT do**:
  - JANGAN pernah reveal apakah email sudah terdaftar atau belum
  - JANGAN allow submit selama loading (disable button)
  - Marketing consent JANGAN pre-checked

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Auth forms butuh UX yang baik (loading states, error messages, password strength)
  - **Skills**: [`shadcn-ui`]
    - `shadcn-ui`: Form, Input, Button, Label components

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T15-T18)
  - **Parallel Group**: Wave 3
  - **Blocks**: T15 (perlu UI untuk server actions), T16
  - **Blocked By**: T1 (shadcn), T12 (DB triggers untuk auto-create profile)

  **References**:
  - Spec section 3.1 (Registration flow)
  - Spec section 3.2 (Login flow)
  - Spec section 3.3 (Forgot Password)
  - Spec: rate limiting 5 attempts per 15 min

  **Acceptance Criteria**:
  - [ ] Login form renders, submit disabled during loading
  - [ ] Register form: password strength indicator visible
  - [ ] Marketing consent checkbox unchecked by default
  - [ ] Forgot password: same message regardless email exists or not

  **QA Scenarios**:
  ```
  Scenario: Login page renders correctly
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/login
      2. Assert: email input, password input, submit button all present
      3. Click submit with empty fields
    Expected Result: Validation errors shown, form not submitted
    Evidence: .sisyphus/evidence/task-14-login-form.png

  Scenario: Register marketing consent default
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/register
      2. Find checkbox with selector [name="marketing_consent"]
    Expected Result: Checkbox is NOT checked by default
    Evidence: .sisyphus/evidence/task-14-register-consent.png
  ```

  **Commit**: YES (wave 3 group)

---

- [ ] 15. Auth Server Actions + OAuth Callback

  **What to do**:
  - Buat `src/app/(auth)/actions.ts` — server actions:
    - `signUp(formData)`: `supabase.auth.signUp({email, password, options: {data: {full_name}, emailRedirectTo}})` → update `marketing_consent` + `marketing_consent_at` di profiles
    - `signIn(formData)`: `supabase.auth.signInWithPassword({email, password})` → check role → return redirect URL
    - `signOut()`: `supabase.auth.signOut()` → redirect ke /
    - `sendPasswordReset(email)`: `supabase.auth.resetPasswordForEmail(email, {redirectTo})` → SELALU return success message (jangan reveal email existence)
    - `updatePassword(newPassword)`: `supabase.auth.updateUser({password})` — hanya dari authenticated session
  - Buat `src/app/(auth)/auth/callback/route.ts` — Supabase OAuth callback:
    - Exchange `code` untuk session: `supabase.auth.exchangeCodeForSession(code)`
    - Update `profiles.email_verified = true` (untuk email verification)
    - Redirect ke appropriate page (checkout jika ada `redirect` param, homepage default)
  - Buat `src/app/(auth)/actions/google.ts` — OAuth Google:
    - `signInWithGoogle()`: `supabase.auth.signInWithOAuth({provider: 'google', options: {redirectTo: callback}})` — opsional, bisa skip jika client belum butuh

  **Must NOT do**:
  - JANGAN return informasi apakah email sudah exist
  - JANGAN gunakan client-side supabase untuk operations ini (gunakan server action)
  - `sendPasswordReset` HARUS return pesan yang sama untuk email yang ada maupun tidak ada

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Auth flow butuh handling edge cases dan security yang tepat
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T14, T16-T18)
  - **Parallel Group**: Wave 3
  - **Blocks**: T16, T17, T36 (account pages)
  - **Blocked By**: T4 (Supabase clients), T12 (DB triggers)

  **References**:
  - Spec section 3.1-3.4 (Auth flows)
  - Supabase SSR auth dengan Next.js 15 App Router
  - Spec section 3.3 edge case: "If that email is registered, we've sent a reset link"

  **Acceptance Criteria**:
  - [ ] Register: user bisa sign up, profile row auto-created via trigger
  - [ ] Login: successful login redirect ke /admin jika admin, ke / jika customer
  - [ ] Forgot password: SAMA response untuk email valid maupun tidak
  - [ ] OAuth callback: exchange code sukses, redirect ke benar

  **QA Scenarios**:
  ```
  Scenario: Register creates profile
    Tool: Playwright
    Steps:
      1. Navigate ke /register
      2. Fill form: name "Test User", email unique@test.com, password "Test1234!"
      3. Submit
      4. Check Supabase profiles table via admin curl
    Expected Result: Profile row ada dengan email yang benar, role = 'customer'
    Evidence: .sisyphus/evidence/task-15-register-profile.txt

  Scenario: Forgot password same response
    Tool: Playwright
    Steps:
      1. Navigate ke /forgot-password
      2. Submit dengan email yang TIDAK terdaftar
      3. Screenshot response
      4. Submit dengan email yang SUDAH terdaftar
      5. Screenshot response
    Expected Result: Kedua response IDENTIK, tidak reveal existence
    Evidence: .sisyphus/evidence/task-15-forgot-pw-response.png
  ```

  **Commit**: YES (wave 3 group)

---

- [ ] 16. Middleware Auth Guard

  **What to do**:
  - Update `src/middleware.ts` (sesuai spec section 3.5):
    ```typescript
    // 1. Refresh Supabase session (CRITICAL: prevent stale sessions)
    // 2. Protected routes guard: /account, /orders, /checkout → redirect /login?redirect=path
    // 3. Admin routes guard: /admin → check role = admin/super_admin → redirect / jika tidak
    // 4. Auth pages guard: /login, /register → redirect / jika sudah login
    ```
  - Handle edge case: race condition Supabase SSR cookies (ikuti panduan Supabase SSR persis)
  - Set `matcher` config untuk exclude static files, images, api routes yang tidak perlu auth
  - Admin role check: fetch profile role dari DB (JANGAN hanya cek JWT claims, cek DB untuk keamanan)
  - Tambahkan `X-Forwarded-For` capture untuk rate limiting (akan dipakai T30)

  **Must NOT do**:
  - JANGAN skip session refresh (menyebabkan stale session / race condition)
  - JANGAN trust client-side JWT claims untuk admin role check — HARUS verify dari DB
  - JANGAN block semua api routes (hanya admin api routes)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Middleware auth adalah security-critical, butuh careful implementation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T14-T15, T17-T18)
  - **Parallel Group**: Wave 3
  - **Blocks**: T25-T29 (storefront pages butuh middleware), T41-T48 (admin pages)
  - **Blocked By**: T4 (Supabase clients), T12 (DB untuk role check)

  **References**:
  - Spec section 3.5 (Middleware Auth Guard) — kode TypeScript ada di spec
  - Supabase SSR middleware pattern: https://supabase.com/docs/guides/auth/server-side/nextjs#middleware
  - PENTING: Ikuti `updateSession` pattern dari Supabase SSR, bukan custom cookie handling
  - Spec: admin routes `/admin/**` butuh role check ke DB

  **Acceptance Criteria**:
  - [ ] `/checkout` tanpa session → redirect `/login?redirect=/checkout`
  - [ ] `/admin` dengan customer session → redirect `/`
  - [ ] `/admin` dengan admin session → pass through
  - [ ] `/login` dengan valid session → redirect `/`

  **QA Scenarios**:
  ```
  Scenario: Protected route redirects unauthenticated
    Tool: Playwright
    Steps:
      1. Open browser (no session)
      2. Navigate to http://localhost:3000/checkout
    Expected Result: Redirect to /login?redirect=%2Fcheckout
    Evidence: .sisyphus/evidence/task-16-middleware-redirect.png

  Scenario: Admin route blocked for customer
    Tool: Playwright
    Steps:
      1. Login sebagai customer user
      2. Navigate to http://localhost:3000/admin
    Expected Result: Redirect to / (homepage)
    Evidence: .sisyphus/evidence/task-16-admin-block.png
  ```

  **Commit**: YES (wave 3 group)

---

- [ ] 17. use-auth Hook + Admin Layout

  **What to do**:
  - Buat `src/hooks/use-auth.ts`:
    - `useAuth()`: return `{ user, session, profile, loading, signOut }`
    - Subscribe ke `supabase.auth.onAuthStateChange()` untuk real-time session updates
    - Cache profile data (role, full_name, avatar_url) dari DB fetch satu kali
    - Multi-tab sync: session auto-sync via Supabase broadcast channel
  - Buat `src/app/admin/layout.tsx` — admin layout:
    - Sidebar (280px): store logo, navigation groups:
      - Dashboard (link ke /admin)
      - Orders (link ke /admin/orders)
      - Products (links ke /admin/products, /admin/categories)
      - Customers (link ke /admin/customers)
      - Shipping (links ke /admin/shipping/zones, /admin/shipping/rates)
      - Discounts (link ke /admin/discounts)
      - Content (links ke /admin/pages, CMS)
      - Settings (links ke all settings sub-pages)
      - Audit Log (link ke /admin/audit-log)
      - Analytics (link ke /admin/analytics)
    - Topbar: store name, breadcrumb, admin user avatar + logout
    - Mobile: collapsible sidebar (Sheet component)
    - Active link highlighting

  **Must NOT do**:
  - JANGAN double-check auth di layout (middleware sudah handle ini)
  - JANGAN fetch user data di setiap page render (cache di hook)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Admin layout butuh design sidebar yang baik
  - **Skills**: [`shadcn-ui`]
    - `shadcn-ui`: Sheet (mobile sidebar), Avatar, DropdownMenu

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T14-T16)
  - **Parallel Group**: Wave 3
  - **Blocks**: T41-T52 (semua admin pages)
  - **Blocked By**: T1 (shadcn), T4 (Supabase)

  **References**:
  - Spec section 1.1 (admin folder structure)
  - Spec section 3.6 (Session & Token Management)

  **Acceptance Criteria**:
  - [ ] Admin sidebar render dengan semua navigation links
  - [ ] Mobile sidebar (Sheet) membuka/menutup
  - [ ] `useAuth()` return user profile termasuk role
  - [ ] Logout dari admin → redirect ke /

  **QA Scenarios**:
  ```
  Scenario: Admin layout renders correctly
    Tool: Playwright
    Steps:
      1. Login sebagai admin user
      2. Navigate to http://localhost:3000/admin
      3. Assert sidebar visible dengan navigation links
    Expected Result: Sidebar dengan semua nav links (Dashboard, Orders, Products, dll)
    Evidence: .sisyphus/evidence/task-17-admin-layout.png

  Scenario: Mobile admin layout
    Tool: Playwright
    Steps:
      1. Set viewport 375x812
      2. Login sebagai admin, navigate to /admin
      3. Hamburger visible, click it
    Expected Result: Sidebar slides in
    Evidence: .sisyphus/evidence/task-17-mobile-admin.png
  ```

  **Commit**: YES (wave 3 group)
  - Message: `feat(auth): authentication flow, middleware, admin layout`

---

- [ ] 18. Address Form Component

  **What to do**:
  - Buat `src/components/shared/address-form.tsx`:
    - Props: `defaultValues?`, `onSubmit`, `showLabel?`, `showDeliveryInstructions?`, `isLoading?`
    - Fields (sesuai spec section 4.1 UK format):
      - Label (Home/Work/Other + custom text input)
      - Recipient Name * (pre-fill dari profile.full_name)
      - Phone * (UK format placeholder: +44 or 07xxx)
      - Postcode * + "Find Address" button (postcode lookup — placeholder/mock untuk sekarang, real integration opsional)
      - Address Line 1 * (house number + street)
      - Address Line 2 (flat/apartment, optional)
      - Town/City *
      - County (optional)
      - Delivery Instructions (textarea, placeholder: "e.g. Leave at side gate")
      - ☑ Make this my default address (checkbox)
    - Validation via react-hook-form + zod: UK phone format, UK postcode regex, required fields
    - Postcode auto-format on blur: "sw1a1aa" → "SW1A 1AA"
    - Error messages dalam bahasa yang user-friendly
  - Buat `src/app/account/addresses/page.tsx` — address management page:
    - List semua addresses (max 10)
    - Card per address: label badge, recipient, full address, "Default" badge
    - Actions: Edit, Delete, "Make Default"
    - "+ Add New Address" button → dialog/drawer dengan AddressForm
    - Delete confirmation dialog ("Are you sure?")
    - Prevent delete if address punya active order (check via server action)

  **Must NOT do**:
  - JANGAN allow lebih dari 10 addresses per user
  - JANGAN skip phone validation (UK format wajib)
  - JANGAN delete address yang sedang dipakai di active order

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UK address form butuh UX yang tepat (UK-specific field order, postcode first pattern)
  - **Skills**: [`shadcn-ui`]
    - `shadcn-ui`: Dialog, Form, Input, Select, Textarea, Checkbox

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T19-T24)
  - **Parallel Group**: Wave 4
  - **Blocks**: T33 (checkout butuh address form), T36 (account pages)
  - **Blocked By**: T3 (postcode utils), T12 (DB), T16 (middleware)

  **References**:
  - Spec section 4.1 (UK Address Format)
  - Spec section 4.2 (Postcode Validation — `UK_POSTCODE_REGEX`)
  - Spec section 4.3 (User Address Flow — max 10, delete confirmation)
  - Spec section 4.4 (Checkout Address Selection)

  **Acceptance Criteria**:
  - [ ] Form reject postcode format salah (e.g., "ABC 123")
  - [ ] Form accept valid UK postcode (e.g., "SW1A 1AA", "M1 4BT")
  - [ ] Postcode auto-formatted on blur (lowercase → uppercase + space)
  - [ ] Max 10 addresses per user enforced
  - [ ] Delete confirmation dialog muncul sebelum hapus

  **QA Scenarios**:
  ```
  Scenario: UK postcode validation in form
    Tool: Playwright
    Steps:
      1. Navigate to /account/addresses (login dulu)
      2. Click "+ Add New Address"
      3. Fill postcode: "INVALID" dan submit
    Expected Result: Validation error: "Please enter a valid UK postcode"
    Evidence: .sisyphus/evidence/task-18-postcode-validation.png

  Scenario: Valid address saved
    Tool: Playwright
    Steps:
      1. Fill semua required fields dengan valid UK data
      2. Submit
      3. Check addresses list
    Expected Result: New address card muncul di list
    Evidence: .sisyphus/evidence/task-18-address-saved.png
  ```

  **Commit**: YES (wave 4 group)

---

- [ ] 19. Image Upload Component

  **What to do**:
  - Buat `src/components/shared/image-upload.tsx`:
    - Props: `value: string[]` (URLs), `onChange: (urls: string[]) => void`, `maxImages?: number` (default 10), `bucket: string`, `folder: string`
    - Drag & drop zone (react-dropzone atau native HTML5)
    - Accept: `image/jpeg, image/png, image/webp, image/avif`
    - Max size per file: 5MB
    - Client-side compression/resize sebelum upload (gunakan browser Canvas API atau `browser-image-compression` library)
    - Upload ke Supabase Storage: `supabase.storage.from(bucket).upload(path, file)`
    - Progress indicator per file (loading bar)
    - Thumbnail grid dengan reorder drag-and-drop (motion library)
    - Primary image selector (click untuk set primary)
    - Delete per image dengan konfirmasi
    - Alt text input per image
  - Buat Supabase Storage bucket `product-images` dan `documents` (untuk invoices):
    - `product-images`: public read, authenticated write
    - `documents`: authenticated read only, service role write

  **Must NOT do**:
  - JANGAN upload raw file tanpa validasi type + size
  - JANGAN store raw file path (gunakan public URL dari Supabase Storage)
  - JANGAN allow SVG upload (security risk)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Drag-drop image upload dengan preview butuh visual polish
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T18, T20-T24)
  - **Parallel Group**: Wave 4
  - **Blocks**: T41 (admin products butuh image upload)
  - **Blocked By**: T1 (deps), T4 (Supabase), T12 (DB)

  **References**:
  - Spec section 8.3 (Product Management — image upload requirements)
  - Supabase Storage docs untuk bucket configuration dan upload

  **Acceptance Criteria**:
  - [ ] File > 5MB rejected dengan error message
  - [ ] Non-image file types rejected
  - [ ] Upload sukses → thumbnail muncul
  - [ ] Reorder via drag mengubah sort_order
  - [ ] Delete image menghapus dari Storage

  **QA Scenarios**:
  ```
  Scenario: File size limit enforced
    Tool: Playwright
    Steps:
      1. Navigate to /admin/products/new (login as admin)
      2. Attempt to upload file > 5MB
    Expected Result: Error "File size exceeds 5MB limit"
    Evidence: .sisyphus/evidence/task-19-file-size.png

  Scenario: Successful image upload
    Tool: Playwright
    Steps:
      1. Upload valid JPEG file < 5MB
      2. Wait for upload to complete
      3. Assert thumbnail visible
    Expected Result: Thumbnail visible, URL stored
    Evidence: .sisyphus/evidence/task-19-upload-success.png
  ```

  **Commit**: YES (wave 4 group)

---

- [ ] 20. Cookie Consent Banner + useCart + Cart Page

  **What to do**:
  - Buat `src/hooks/use-cookie-consent.ts`:
    - Read consent dari `localStorage.getItem('cookie_consent')` atau profile.cookie_preferences
    - Return `{ consent, updateConsent, hasConsented }`
    - Jika sudah consent → tidak tampilkan banner lagi
    - Jika user login → sync preferences ke DB
  - Buat `src/components/shared/cookie-banner.tsx` (sesuai spec section 10.1):
    - Fixed bottom bar
    - 3 buttons: "Accept All", "Reject Non-Essential", "Manage Preferences"
    - "Manage Preferences" → expandable panel: Essential (locked), Analytics (toggle), Marketing (toggle)
    - Link to Cookie Policy page
    - Hanya tampil jika belum ada consent
  - Buat `src/stores/cart-store.ts` (Zustand — sesuai spec section 7):
    - State: `items: CartItem[]`, `isLoading: boolean`
    - Actions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `syncFromStorage`, `mergeGuestCart`
    - Persist ke localStorage (zustand `persist` middleware)
    - `mergeGuestCart`: ketika login, merge guest cart dengan preferred item (ambil quantity tertinggi jika duplikat)
  - Buat `src/hooks/use-cart.ts`:
    - `useCart()`: expose cart state + computed values
    - Computed: `itemCount`, `subtotal_pence`, `getDisplayTotal()`
    - Notification: "Your basket has been updated" saat merge on login (via Sonner toast)
  - Buat `src/app/(storefront)/cart/page.tsx`:
    - Line items: product image, name, variant info, quantity stepper, price inc VAT, subtotal, remove button
    - Empty cart state: "Your basket is empty" + CTA "Continue Shopping"
    - Order summary sidebar: subtotal (ex VAT), VAT breakdown, "Estimated delivery: calculated at checkout", TOTAL inc VAT
    - "Proceed to Checkout" button (disabled jika cart kosong, redirect ke /login jika tidak login)
    - Stock validation on mount (cek via server, update jika ada perubahan + toast notification)

  **Must NOT do**:
  - JANGAN store prices di cart (ambil fresh dari server saat checkout — ini client-side cache saja)
  - Cookie banner JANGAN block page interaction (fixed bar, tidak modal blocking)
  - JANGAN pre-check Analytics/Marketing cookies

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Cart page + cookie banner adalah komponen UI yang butuh UX yang baik
  - **Skills**: [`shadcn-ui`]
    - `shadcn-ui`: Sheet, Separator, Badge, Skeleton untuk loading states

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T18-T19, T21-T24)
  - **Parallel Group**: Wave 4
  - **Blocks**: T23 (cart page), T33 (checkout)
  - **Blocked By**: T1 (zustand deps), T3 (currency utils), T12 (DB)

  **References**:
  - Spec section 7.1 (Cart Architecture — Zustand + localStorage)
  - Spec section 7.2 (Cart Validation)
  - Spec section 10.1 (Cookie Consent Banner)
  - Spec section 10.2 (GDPR cookie consent details)

  **Acceptance Criteria**:
  - [ ] Cookie banner muncul pertama kali, tidak muncul setelah accept
  - [ ] "Accept All" → semua consent true, banner hilang
  - [ ] Cart items persist setelah page refresh (localStorage)
  - [ ] Cart merge on login: "Your basket has been updated" toast muncul
  - [ ] Stock validation: jika item habis, cart diupdate + toast notification

  **QA Scenarios**:
  ```
  Scenario: Cookie banner appears on first visit
    Tool: Playwright
    Steps:
      1. Clear localStorage
      2. Navigate to http://localhost:3000
      3. Assert cookie banner visible
      4. Click "Accept All"
      5. Refresh page
      6. Assert banner NOT visible
    Expected Result: Banner visible on first visit, hidden after accept
    Evidence: .sisyphus/evidence/task-20-cookie-banner.png

  Scenario: Cart persists across page refresh
    Tool: Playwright
    Steps:
      1. Add product to cart
      2. Refresh page
      3. Navigate to /cart
    Expected Result: Cart still has the item
    Evidence: .sisyphus/evidence/task-20-cart-persist.png

  Scenario: Analytics cookies not pre-checked
    Tool: Playwright
    Steps:
      1. Click "Manage Preferences" on cookie banner
    Expected Result: Analytics and Marketing checkboxes are UNCHECKED
    Evidence: .sisyphus/evidence/task-20-cookie-unchecked.png
  ```

  **Commit**: YES (wave 4 group)
  - Message: `feat(components): address form, cart system, cookie consent, image upload`

---

- [ ] 21. Newsletter Form + Rate Limiting

  **What to do**:
  - Buat `src/components/shared/newsletter-form.tsx`:
    - Email input + "Subscribe" button (single row)
    - Submit → server action: check duplicate, insert/reactivate subscriber
    - Inline success: "Thanks for subscribing!" (replace form)
    - Inline error untuk invalid email
    - Props: `source: 'footer' | 'checkout' | 'website'`
  - Integrasikan di Footer (T8) dan di Checkout Success (T34)
  - Buat server action `src/app/actions/newsletter.ts`:
    - Validate email format
    - Check existing subscriber (active → "already subscribed", inactive → reactivate)
    - Insert baru jika belum ada
    - Link `user_id` jika user sedang login
    - Source field: "footer" / "checkout" / "website"
  - Buat `src/lib/rate-limit.ts` — simple in-memory rate limiter (atau Upstash Redis jika production):
    - `rateLimiter(identifier: string, max: number, windowMs: number): Promise<{success: boolean, remaining: number, resetAt: Date}>`
    - Untuk: login attempts (5/15min), forgot-password (3/hr), newsletter signup (3/hr per IP)
  - Update auth server actions (T15) untuk menggunakan rate limiter
  - Tambahkan rate limiting ke newsletter server action

  **Must NOT do**:
  - JANGAN kirim confirmation email untuk newsletter (no email system untuk ini)
  - JANGAN allow unsubscribe dari footer form (hanya dari account settings)
  - JANGAN tampilkan berapa subscriber yang ada (privacy)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple form + server action + rate limit utility
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T18-T20)
  - **Parallel Group**: Wave 4
  - **Blocks**: T34 (checkout success newsletter opt-in)
  - **Blocked By**: T3 (validation), T12 (DB newsletter_subscribers)

  **References**:
  - Spec section 16.2 (Newsletter Signup Locations)
  - Spec section 16.3 (Signup Flow)
  - Spec section 16.5 (Unsubscribe — hanya dari account settings)

  **Acceptance Criteria**:
  - [ ] Subscribe dengan email baru → success message
  - [ ] Subscribe dengan email yang sudah ada → "You're already subscribed!"
  - [ ] Subscribe dengan email invalid → error message
  - [ ] Rate limit: 4th attempt dalam 1 jam → 429 Too Many Requests

  **QA Scenarios**:
  ```
  Scenario: Newsletter subscription
    Tool: Playwright
    Steps:
      1. Navigate to homepage, scroll to footer
      2. Enter unique test email
      3. Click "Subscribe"
    Expected Result: "Thanks for subscribing!" message appears
    Evidence: .sisyphus/evidence/task-21-newsletter-success.png

  Scenario: Rate limiting on newsletter
    Tool: Bash
    Steps:
      1. POST /api-equivalent 4 times dalam cepat dengan same IP
    Expected Result: 4th request mendapat 429 response
    Evidence: .sisyphus/evidence/task-21-rate-limit.txt
  ```

  **Commit**: YES (wave 4 group)

---

- [ ] 22. Homepage

  **What to do**:
  - Buat `src/app/(storefront)/page.tsx` — homepage:
    - **Hero Banner**: Full-width image/video, headline, subtitle, CTA button ("Shop Now" → /products). Data dari `store_settings.hero_*` (atau hardcode untuk boilerplate, admin-configurable nanti)
    - **Featured Categories**: Grid 4 cards (image, name, link ke /products?category=slug). Fetch dari DB: `SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order LIMIT 4`
    - **Featured Products**: Grid 4-8 produk (image, name, price inc VAT via `getDisplayPrice()`, rating stars, badge New/Sale). Fetch dari DB: `WHERE is_featured = TRUE AND is_active = TRUE`
    - **New Arrivals**: Grid 4-8 produk terbaru. Fetch: `ORDER BY created_at DESC LIMIT 8`
    - **Sale/Promo Section**: Tampil hanya jika ada active discounts — banner dengan discount code
    - **Testimonials**: Static 3 review quotes (hardcode untuk boilerplate)
    - **Newsletter Section**: `<NewsletterForm source="website" />`
    - SEO: metadata (title, description, og:image)
    - Loading states: Suspense dengan skeleton loaders

  **Must NOT do**:
  - JANGAN show harga ex-VAT di product cards (selalu inc-VAT via `getDisplayPrice()`)
  - JANGAN fetch semua products (limit + pagination)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Homepage adalah showcase utama, butuh design yang menarik
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T26-T30)
  - **Parallel Group**: Wave 5
  - **Blocks**: T50 (admin dashboard analytics butuh ada data)
  - **Blocked By**: T8 (layout), T13 (seed data), T20 (cart hook untuk navbar badge)

  **References**:
  - Spec section 11.1 (Homepage)
  - Spec: `getDisplayPrice()` SELALU dipakai untuk display harga (inc VAT)

  **Acceptance Criteria**:
  - [ ] Homepage load tanpa error
  - [ ] Featured products tampil dengan harga inc VAT
  - [ ] Newsletter form di homepage berfungsi
  - [ ] Mobile responsive (semua section)

  **QA Scenarios**:
  ```
  Scenario: Homepage renders with products
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Assert: hero visible, featured products section ada
      3. Check harga format: "£XX.XX" (bukan £XX.XXX atau £XX)
    Expected Result: Homepage loads dengan products dan format harga benar
    Evidence: .sisyphus/evidence/task-22-homepage.png

  Scenario: Mobile homepage
    Tool: Playwright
    Steps:
      1. Set viewport 375x812
      2. Navigate to /
    Expected Result: Semua section responsive, no horizontal scroll
    Evidence: .sisyphus/evidence/task-22-homepage-mobile.png
  ```

  **Commit**: YES (wave 5 group)

---

- [ ] 23. Product Listing + Product Detail Pages

  **What to do**:
  - Buat `src/app/(storefront)/products/page.tsx` (sesuai spec 11.2):
    - Sidebar filters (collapsible mobile):
      - Category checkbox tree (fetch dari DB, nested)
      - Price range slider (£ format, filter in pence internally)
      - Tags multiselect
      - Minimum rating stars
      - "In stock only" toggle
    - Sort select: Newest, Price ↑, Price ↓, Best Selling, Rating
    - Product grid (4-col desktop, 2-col mobile): image, name, price inc VAT, compare_at_price strikethrough, rating stars, badge (New/Sale)
    - Pagination (atau infinite scroll)
    - URL-based filters: `/products?category=shoes&sort=price_asc&min=2000&max=5000` (shareable + SEO)
    - Total count: "Showing 24 of 156 products"
    - Loading skeleton saat filter/sort
  - Buat `src/app/(storefront)/products/[slug]/page.tsx` (sesuai spec 11.3):
    - Image gallery: thumbnail strip + main image + lightbox modal + zoom on hover
    - Product name, rating summary (stars + count link ke reviews)
    - Price: `getDisplayPrice()` inc VAT dengan label "Inc. VAT"
    - Compare-at-price strikethrough jika ada
    - Short description
    - Variant selector: colour swatches, size buttons (disabled jika OOS)
    - Stock status: "In Stock" / "Low Stock (Only 3 left)" / "Out of Stock"
    - Quantity stepper
    - "Add to Basket" button (disabled jika OOS) → `useCart().addItem()`
    - "♡ Wishlist" toggle (heart button, login required)
    - Delivery estimate info: "Free delivery over £50" / "Estimated 3-5 working days"
    - Tabs: Description (rich text) | Specifications | Reviews (list + form)
    - Related products carousel (same category)
    - Recently viewed (localStorage)
    - SEO: generateMetadata dengan product data, structured data (JSON-LD)

  **Must NOT do**:
  - JANGAN tampilkan harga ex-VAT di product listing/detail (selalu inc VAT)
  - JANGAN allow "Add to Basket" jika OOS

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`shadcn-ui`]
    - `shadcn-ui`: Slider, Tabs, Checkbox, Badge, Skeleton

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T22, T24-T30)
  - **Parallel Group**: Wave 5
  - **Blocks**: T27 (checkout butuh product data), T41 (admin products)
  - **Blocked By**: T8 (layout), T13 (seed), T20 (cart hook)

  **References**:
  - Spec section 11.2 (Product Listing)
  - Spec section 11.3 (Product Detail)
  - Spec: URL-based filters untuk SEO (`/products?category=slug&sort=price_asc`)
  - Spec: `getDisplayPrice()` untuk semua price display

  **Acceptance Criteria**:
  - [ ] Product listing tampil dengan filter berfungsi
  - [ ] URL berubah saat filter/sort (shareable link)
  - [ ] Product detail: semua info tampil, variant selector berfungsi
  - [ ] "Add to Basket" menambah item ke cart (badge di navbar update)
  - [ ] OOS product: "Add to Basket" disabled

  **QA Scenarios**:
  ```
  Scenario: Product listing filter by category
    Tool: Playwright
    Steps:
      1. Navigate to /products
      2. Click category "Electronics" dari filter sidebar
      3. Assert URL berubah ke /products?category=electronics
      4. Assert product grid hanya tampilkan produk kategori tersebut
    Expected Result: Filtered products visible, URL updated
    Evidence: .sisyphus/evidence/task-23-product-filter.png

  Scenario: Add to cart from product detail
    Tool: Playwright
    Steps:
      1. Navigate to /products/{seed-product-slug}
      2. Click "Add to Basket"
      3. Check navbar cart badge
    Expected Result: Cart badge shows "1"
    Evidence: .sisyphus/evidence/task-23-add-to-cart.png
  ```

  **Commit**: YES (wave 5 group)

---

- [ ] 24. Wishlist, Contact, CMS Pages + Rate Limiting

  **What to do**:
  - Buat `src/app/(storefront)/wishlist/page.tsx`:
    - Fetch wishlists dengan product details untuk current user
    - Grid layout mirip product listing
    - "Move to Cart" button per item
    - "Remove from Wishlist" button
    - Empty state: "Your wishlist is empty" + CTA
  - Buat `src/app/(storefront)/contact/page.tsx`:
    - Form: name, email, subject, message
    - Submit → kirim email ke store contact_email (via Resend atau store hanya dalam DB — sesuai keputusan)
    - Success message inline
    - Store contact info (phone, email, address) dari store_settings
  - Buat `src/app/(storefront)/pages/[slug]/page.tsx` — CMS pages:
    - Fetch page dari DB by slug
    - Render rich text HTML (DOMPurify untuk sanitize XSS)
    - 404 jika page tidak published atau tidak ada
    - SEO metadata dari page.meta_title + page.meta_description
  - Seed 5 legal CMS pages via T13/server action:
    - `/pages/terms-conditions` — Terms & Conditions (template text)
    - `/pages/privacy-policy` — Privacy Policy (template text)
    - `/pages/returns-refunds` — Returns & Refunds (14-day cooling-off)
    - `/pages/cookie-policy` — Cookie Policy
    - `/pages/delivery-information` — Delivery information
  - Tambahkan `src/middleware.ts` rate limiting integration (dari T21 rate limiter):
    - Login: max 5/15min per IP
    - Forgot password: max 3/hr per IP
    - Newsletter: max 3/hr per IP
    - Shipping calc: max 30/min per IP

  **Must NOT do**:
  - JANGAN render unsanitized HTML (gunakan DOMPurify untuk CMS content)
  - Wishlist JANGAN bisa diakses tanpa login (middleware handle)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T22-T23, T25)
  - **Parallel Group**: Wave 5
  - **Blocks**: T33 (checkout butuh legal pages link), T47 (admin CMS editor)
  - **Blocked By**: T8 (layout), T11 (pages table), T13 (seed), T21 (rate limiter)

  **References**:
  - Spec section 10.3 (UK Consumer Rights — returns policy, legal pages list)
  - Spec section 11 (Storefront pages: wishlist, CMS route)
  - DOMPurify untuk sanitize HTML rich text

  **Acceptance Criteria**:
  - [ ] 5 legal CMS pages ada dan accessible via `/pages/{slug}`
  - [ ] CMS page tidak published → 404
  - [ ] Wishlist berfungsi (add/remove, move to cart)
  - [ ] Contact form submit berhasil

  **QA Scenarios**:
  ```
  Scenario: CMS legal pages accessible
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/pages/privacy-policy
    Expected Result: HTTP 200, page content visible
    Evidence: .sisyphus/evidence/task-24-cms-page.png

  Scenario: Unpublished page returns 404
    Tool: Bash
    Steps:
      1. curl -I http://localhost:3000/pages/draft-page
    Expected Result: HTTP 404
    Evidence: .sisyphus/evidence/task-24-cms-404.txt
  ```

  **Commit**: YES (wave 5 group)
  - Message: `feat(storefront): homepage, products, wishlist, CMS pages, rate limiting`

---

- [ ] 25. Shipping Calculator + Shipping API Route

  **What to do**:
  - Implementasi penuh `src/lib/shipping/calculator.ts` (sesuai spec section 5.2):
    - `findMatchingZone(outwardCode: string, postcodeArea: string)`:
      1. Match `postcode_area` dulu (paling spesifik: "SW1A")
      2. Fallback ke `postcode_prefix` ("SW")
      3. Fallback ke `country` "GB" (catch-all)
      - Query dari `shipping_zone_regions` + `shipping_zones`
    - `getActiveRates(zoneId: string)`: fetch dari `shipping_rates WHERE is_active = TRUE ORDER BY sort_order`
    - `calculateTieredWeight(weight_grams, weight_tiers)`: iterate tiers, find matching bracket
    - `calculateShipping(postcode, cart_items, subtotal_pence)`:
      - Hitung total weight dari cart_items
      - Determine zone via postcode
      - Get rates
      - Filter by max_weight_grams
      - Calculate per calculation_type (flat, per_weight, tiered_weight, free_above)
      - Return array ShippingOption sorted by cost_pence
    - Handle edge cases:
      - Postcode format aneh: normalize terlebih dahulu via `formatPostcode()`
      - Zone tidak ditemukan: return empty array (checkout akan tampilkan error)
      - Semua rates melebihi max weight: filter out
  - Buat `src/app/api/shipping/calculate/route.ts`:
    - `POST { postcode, cart_items, subtotal_pence }`
    - Validate input via Zod
    - Panggil `calculateShipping()`
    - Return sorted ShippingOption[]
    - Rate limit: 30 requests/min per IP (via T21 rate limiter)
    - **PENTING**: Server-authoritative — JANGAN percaya client-side total, recalculate dari `cart_items`

  **Must NOT do**:
  - JANGAN gunakan client-side shipping calculation (hanya di server)
  - JANGAN cache shipping result (postcode + cart bisa berubah)
  - JANGAN allow rate bypass dari client

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex business logic dengan banyak edge cases
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T26-T30)
  - **Parallel Group**: Wave 6
  - **Blocks**: T26 (checkout step 2 butuh shipping API)
  - **Blocked By**: T3 (postcode utils), T6 (shipping stub), T10 (shipping tables), T12 (RLS), T13 (seed zones+rates)

  **References**:
  - Spec section 5.2 (Shipping Cost Calculation) — kode TypeScript ada di spec, copy + implementasi
  - Spec section 5.1 (UK Shipping Zones) — zone postcode matches
  - Spec section 6.1 (Checkout Step 2) — response format yang dibutuhkan checkout

  **Acceptance Criteria**:
  - [ ] `POST /api/shipping/calculate` dengan postcode "SW1A 1AA" → return London zone rates
  - [ ] `POST /api/shipping/calculate` dengan postcode "M1 4BT" → return Mainland UK rates
  - [ ] Cart subtotal above threshold → `is_free_shipping: true`
  - [ ] Invalid postcode → 400 error dengan message jelas
  - [ ] Tiered weight calculation akurat

  **QA Scenarios**:
  ```
  Scenario: London zone shipping calculation
    Tool: Bash
    Steps:
      1. curl -X POST http://localhost:3000/api/shipping/calculate \
           -H "Content-Type: application/json" \
           -d '{"postcode":"SW1A 1AA","subtotal_pence":3000,"cart_items":[{"weight_grams":500,"quantity":1}]}'
    Expected Result: JSON array dengan options London zone (Same Day, Next Day, Standard)
    Evidence: .sisyphus/evidence/task-25-shipping-london.txt

  Scenario: Free shipping threshold
    Tool: Bash
    Steps:
      1. Same request tapi subtotal_pence = 7500 (> £75 free shipping threshold)
    Expected Result: Standard option mempunyai cost_pence = 0, is_free_shipping = true
    Evidence: .sisyphus/evidence/task-25-shipping-free.txt

  Scenario: Invalid postcode
    Tool: Bash
    Steps:
      1. POST dengan postcode "INVALID"
    Expected Result: HTTP 400, error message
    Evidence: .sisyphus/evidence/task-25-shipping-invalid.txt
  ```

  **Commit**: YES (wave 6 group)

---

- [ ] 26. Checkout Multi-Step

  **What to do**:
  - Buat `src/app/(storefront)/checkout/page.tsx` (sesuai spec section 6.1):
    - **Step 1: Delivery Address**
      - Jika user ada saved addresses: tampilkan default (pre-selected), dropdown "Choose different address", "Add new address" link (inline form atau modal menggunakan `AddressForm` dari T18)
      - Jika tidak ada: tampilkan AddressForm penuh (auto-save ke address book)
      - Validasi postcode UK sebelum → Next
    - **Step 2: Delivery Method**
      - Call `POST /api/shipping/calculate` dengan selected address postcode
      - Display radio buttons per ShippingOption: label, cost formatted (£X.XX / FREE), estimated delivery date range
      - "Estimated: Mon 10 – Wed 12 Mar" (hitung dari today + min/max delivery days, exclude weekends)
      - Update order summary sidebar saat pilih metode
    - **Step 3: Discount Code**
      - Input + "Apply" button
      - Server action: validate code (active?, not expired?, under usage limit?, user limit?, min spend met?, applicable to items in cart?)
      - Show discount amount di summary
      - "Remove" button jika sudah applied
    - **Step 4: Review & Payment**
      - Full summary: line items (image, name, qty, price inc VAT), delivery address, delivery method + estimated date
      - Price breakdown: subtotal (ex VAT), VAT itemised (20%/5%/0% jika mix), delivery, discount, **TOTAL inc VAT** (bold)
      - Customer notes textarea (optional)
      - **Stripe Payment Element** (mount via `@stripe/react-stripe-js`):
        - Server action: create PaymentIntent `stripe.paymentIntents.create({amount: total_pence, currency: 'gbp', metadata: {user_id}})`
        - Client: `<PaymentElement />`
        - Cek final stock (server-side) sebelum charge
      - "Place Order — £XX.XX" button: disable + spinner saat submit
      - Submit: `stripe.confirmPayment({elements, confirmParams: {return_url: .../checkout/success?order_id=xxx}})`
  - Progress indicator (stepper) di atas form: Step 1 → 2 → 3 → 4
  - Order summary sidebar (sticky) di semua steps
  - Data di-preserve ketika pindah step (react state atau URL params)
  - **PENTING**: Semua pricing recalculated server-side saat submit (jangan trust client-side totals)

  **Must NOT do**:
  - JANGAN allow checkout tanpa login (middleware handle)
  - JANGAN trust client-side cart/price untuk server operations
  - JANGAN expose Stripe secret key ke client
  - JANGAN proceed jika stock habis di server check

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Multi-step checkout adalah UX paling critical, butuh design yang sangat baik
  - **Skills**: [`shadcn-ui`]
    - `shadcn-ui`: RadioGroup, Card, Separator, Badge, Skeleton

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T27-T30)
  - **Parallel Group**: Wave 6
  - **Blocks**: T27 (success page), T35 (webhook dipicu dari checkout)
  - **Blocked By**: T5 (Stripe), T18 (AddressForm), T20 (cart), T25 (shipping API)

  **References**:
  - Spec section 6.1 (Full Checkout Flow) — semua 4 steps detail
  - Spec section 6.2 (VAT Handling) — price breakdown display rules
  - Spec section 6.4 (Payment Failure & Retry)
  - Spec: `checkout_require_account: true` — harus login, tidak ada guest checkout

  **Acceptance Criteria**:
  - [ ] Checkout tidak accessible tanpa login (middleware redirect)
  - [ ] Semua 4 steps berfungsi, navigasi forward/back
  - [ ] Stripe Payment Element mounted dan visible
  - [ ] Discount code valid → discount tampil di summary
  - [ ] Discount code invalid → error message spesifik
  - [ ] "Place Order" button disabled saat loading
  - [ ] Test card 4242424242424242 berhasil (Stripe test mode)

  **QA Scenarios**:
  ```
  Scenario: Full checkout flow test
    Tool: Playwright
    Steps:
      1. Login, add product to cart, navigate ke /checkout
      2. Step 1: select default address (sudah ada dari seed)
      3. Step 2: select Standard delivery
      4. Step 3: skip discount
      5. Step 4: mount Stripe Element, use test card 4242424242424242
      6. Click "Place Order"
    Expected Result: Redirect ke /checkout/success?order_id=xxx
    Evidence: .sisyphus/evidence/task-26-checkout-flow.png

  Scenario: Invalid discount code
    Tool: Playwright
    Steps:
      1. Di Step 3, enter "INVALID123"
      2. Click Apply
    Expected Result: Error message "Invalid or expired discount code"
    Evidence: .sisyphus/evidence/task-26-invalid-discount.png
  ```

  **Commit**: YES (wave 6 group)

---

- [ ] 27. Checkout Success + Stripe Webhook Handler

  **What to do**:
  - Buat `src/app/(storefront)/checkout/success/page.tsx`:
    - Read `order_id` dari URL params
    - Fetch order dari DB (status harus 'paid' — atau 'pending_payment' sementara webhook belum fire)
    - Display: "Thank you! Your order has been placed"
    - Order number (ORD-format)
    - Order summary (items, delivery address, method)
    - Estimated delivery date
    - "View Order Details" link → /orders/{id}
    - "Continue Shopping" link → /products
    - Newsletter opt-in section: "Want to hear about new products and offers?" + unchecked checkbox + subscribe jika checked
    - Jika order tidak found atau bukan milik user: redirect ke /
  - Buat `src/app/api/webhooks/stripe/route.ts` — **PENTING: nodejs runtime, bukan edge!**:
    - Read raw body: `const body = await req.text()`
    - Verify signature: `stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)`
    - **Idempotency**: Check apakah event sudah diproses sebelumnya (simpan processed event IDs, atau check order status sebelum update)
    - Handle events:
      - `payment_intent.succeeded`:
        1. Find order via `stripe_payment_intent_id` metadata
        2. Jika order sudah 'paid': skip (idempotency)
        3. Update order: `status = 'paid'`, `paid_at = now()`, `stripe_charge_id`
        4. Trigger `decrement_stock_on_paid()` via DB trigger (sudah auto)
        5. Create invoice via DB trigger `create_invoice_on_paid()` (sudah auto)
        6. Generate PDF invoice via `generateInvoicePDF()` (T38)
        7. Send order confirmation email ke customer (T40)
        8. Send new order notification ke admin (T40)
      - `payment_intent.payment_failed`:
        1. Update order: tambahkan ke `status_history` "Payment failed"
        2. Send "Payment failed" email ke customer dengan retry link
      - `charge.refunded`:
        1. Update order: `status = 'refunded'`
        2. Restore stock via DB trigger (sudah auto)
        3. Send refund confirmation email
      - `charge.dispute.created`:
        1. Flag order di admin_notes
        2. Send immediate admin notification email
    - Return 200 untuk semua events (bahkan yang diabaikan)
    - Log setiap event yang diproses

  **Must NOT do**:
  - JANGAN gunakan edge runtime untuk webhook handler (butuh nodejs untuk `req.text()`)
  - JANGAN proses event dua kali (cek idempotency)
  - JANGAN update order status langsung dari client (hanya via webhook)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Webhook handler adalah payment-critical, butuh careful idempotency handling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T27 awal mudah, T28-T30)
  - **Parallel Group**: Wave 6
  - **Blocks**: T37 (customer order view), T38 (invoice gen dipanggil dari webhook)
  - **Blocked By**: T5 (Stripe client), T10 (orders table), T12 (DB triggers)

  **References**:
  - Spec section 6.3 (Stripe Webhook Handler) — kode ada di spec
  - Spec section 6.4 (Payment Failure & Retry)
  - Spec section 15.1 (Invoice Flow — dipicu dari webhook)
  - PENTING: `export const runtime = 'nodejs'` di route file!

  **Acceptance Criteria**:
  - [ ] Checkout success page render untuk order yang valid
  - [ ] Webhook: `payment_intent.succeeded` → order status → 'paid'
  - [ ] Webhook: duplicate event → tidak update dua kali (idempotency)
  - [ ] Webhook: invalid signature → 400 response
  - [ ] Webhook: `charge.refunded` → order status → 'refunded'

  **QA Scenarios**:
  ```
  Scenario: Webhook processes payment success
    Tool: Bash (Stripe CLI atau curl with webhook signature)
    Steps:
      1. Create test order di DB dengan status 'pending_payment'
      2. Send fake webhook event payment_intent.succeeded
      3. Check order status di DB
    Expected Result: Order status = 'paid', paid_at = timestamp
    Evidence: .sisyphus/evidence/task-27-webhook-success.txt

  Scenario: Webhook idempotency
    Tool: Bash
    Steps:
      1. Send same payment_intent.succeeded event twice (same event ID)
    Expected Result: Second call is no-op, order not updated twice
    Evidence: .sisyphus/evidence/task-27-webhook-idempotent.txt
  ```

  **Commit**: YES (wave 6 group)
  - Message: `feat(checkout): shipping calc, multi-step checkout, stripe webhook`

---

- [ ] 28. Account Pages + Customer Orders + Invoice

  **What to do**:
  - Buat `src/app/(storefront)/account/page.tsx` — profile overview:
    - Display: avatar, full_name, email, phone, role badge
    - Quick links: Edit Profile, My Addresses, My Orders, Settings
    - Recent orders (3 terbaru)
  - Buat `src/app/(storefront)/account/settings/page.tsx`:
    - Edit profile: full_name, phone (UK validation)
    - Change email (verify new email via Supabase)
    - Change password (min 8, uppercase, number)
    - Email preferences: ☐ Newsletter (toggle `newsletter_subscribers.is_active`)
    - **GDPR Section**:
      - "Download My Data" → server action: export profile + orders + addresses + reviews sebagai JSON
      - "Delete My Account" → dialog konfirmasi → insert ke `data_deletion_requests` → email notif ke admin
      - Marketing consent status + timestamp display
  - Buat `src/app/(storefront)/orders/page.tsx`:
    - List semua orders: order number, date, status badge (colored), total inc VAT, item count
    - Filter: All / Active / Completed / Cancelled
    - Pagination
  - Buat `src/app/(storefront)/orders/[id]/page.tsx`:
    - Header: Order #, Status badge, Date
    - Tracking timeline (newest first, sesuai spec section 5.3):
      - ✓ timestamp — description
    - Order items: image, name, variant, qty, price
    - Delivery address (dari snapshot JSONB)
    - Payment info: method summary, paid at
    - "Download Invoice" button → `/api/invoices/{invoice_id}/download`
    - "Request Return" button: visible dalam 14 hari setelah delivered (UK 14-day cooling-off)
  - Buat `src/app/api/invoices/[id]/download/route.ts`:
    - Auth check: verify invoice belongs to current user's order
    - Jika `pdf_url` ada: redirect ke Supabase Storage URL
    - Jika tidak: generate on demand via `generateInvoicePDF(invoiceId)` lalu redirect

  **Must NOT do**:
  - JANGAN allow user mengakses invoice order milik user lain
  - JANGAN delete akun langsung (hanya buat `data_deletion_requests`, proses manual oleh admin)
  - JANGAN export data tanpa auth check

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`shadcn-ui`]
    - `shadcn-ui`: Tabs, Card, Badge, Separator

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T29-T31)
  - **Parallel Group**: Wave 7
  - **Blocks**: T38 (PDF invoice), T49 (audit log per order)
  - **Blocked By**: T12 (DB), T16 (middleware), T27 (order + invoice tables exist)

  **References**:
  - Spec section 4.3 (Address management)
  - Spec section 5.3 (Tracking timeline — customer view)
  - Spec section 10.2 (GDPR: data export, right to erasure)
  - Spec section 10.3 (14-day cooling-off / return button)

  **Acceptance Criteria**:
  - [ ] Account settings: profile update berfungsi
  - [ ] GDPR: "Download My Data" download JSON dengan semua data user
  - [ ] GDPR: "Delete My Account" → `data_deletion_requests` row created
  - [ ] Order list: semua orders customer tampil dengan benar
  - [ ] Order detail: tracking timeline tampil chronological
  - [ ] "Request Return" button: visible dalam 14 hari, hidden setelah itu
  - [ ] Invoice download: redirect ke correct PDF

  **QA Scenarios**:
  ```
  Scenario: GDPR data export
    Tool: Playwright
    Steps:
      1. Login, navigate ke /account/settings
      2. Click "Download My Data"
      3. Assert download triggered (JSON file)
    Expected Result: JSON file downloaded dengan profile + orders data
    Evidence: .sisyphus/evidence/task-28-gdpr-export.txt

  Scenario: Order invoice download
    Tool: Playwright
    Steps:
      1. Navigate ke /orders/{existing-paid-order-id}
      2. Click "Download Invoice"
    Expected Result: PDF file downloaded atau opened in browser
    Evidence: .sisyphus/evidence/task-28-invoice-download.png
  ```

  **Commit**: YES (wave 7 group)

---

- [ ] 29. PDF Invoice Generator + Email Templates

  **What to do**:
  - Buat `src/components/shared/invoice-template.tsx`:
    - React PDF component menggunakan `@react-pdf/renderer`
    - Layout sesuai spec section 15.2:
      - Header: store logo, store name, address, VAT number, company number
      - Invoice info: invoice number, date, order number
      - Bill To / Deliver To columns
      - Items table: item name, variant, qty, unit price, VAT rate, total
      - Summary: subtotal ex-VAT, VAT amount, delivery, discount, **TOTAL inc VAT**
      - Payment info: method, paid date
      - Footer: delivery method
    - UK legal requirements: VAT number, company number, per-item VAT breakdown
  - Buat `src/lib/invoice/generator.ts` (sesuai spec section 15.3):
    - `generateInvoicePDF(invoiceId: string): Promise<string>`:
      1. Fetch invoice + order + order_items + store_settings dari Supabase
      2. `renderToBuffer(InvoiceDocument({invoice, settings}))`
      3. Upload ke Supabase Storage: `documents/invoices/{order_id}/{invoice_number}.pdf`
      4. Update `invoices.pdf_url`
      5. Return public URL
    - **PENTING**: Harus di nodejs runtime (tidak boleh di edge)
  - Buat `src/lib/email/templates.ts` — Resend email helper:
    - Setup Resend client: `const resend = new Resend(process.env.RESEND_API_KEY)`
    - HTML email template dasar: store logo, header, body, footer (company address, VAT number, company number)
    - Functions per email type:
      - `sendOrderConfirmation(order, customer, invoicePdfUrl)`
      - `sendOrderDispatched(order, customer, trackingNumber)`
      - `sendOrderDelivered(order, customer)`
      - `sendOrderCancelled(order, customer)`
      - `sendOrderRefunded(order, customer, refundAmount)`
      - `sendPaymentFailed(order, customer, retryUrl)`
      - `sendAbandonedCart(customer, cartItems, cartUrl)`
      - `sendReviewRequest(order, customer)` — 7 hari setelah delivered
      - `sendAdminNewOrder(order)` — ke store contact_email
      - `sendAdminLowStock(product)` — ke store contact_email
      - `sendGdprDeletionRequest(user)` — ke admin
      - `sendGdprDeletionComplete(user)` — ke customer
    - Responsive HTML template, dark mode compatible, company info di footer

  **Must NOT do**:
  - JANGAN generate PDF di edge runtime (`export const runtime = 'nodejs'`)
  - JANGAN pakai `renderToString` untuk PDF (gunakan `renderToBuffer`)
  - Email footer HARUS include company info (UK legal requirement)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: PDF generation dengan @react-pdf/renderer memerlukan spesifikasi yang precise
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T28, T30, T31)
  - **Parallel Group**: Wave 7
  - **Blocks**: T35 webhook calls invoice gen, T43 admin order refund email
  - **Blocked By**: T5 (Stripe), T11 (invoices table), T12 (DB), T27 (webhook flow)

  **References**:
  - Spec section 15.1-15.4 (PDF Invoice — kode TypeScript ada di spec)
  - Spec section 15.2 (Invoice PDF Content — exact layout)
  - Spec section 9.1-9.2 (Email notifications list + template structure)
  - UK legal: "Company registration number in footer" — spec section 10.3

  **Acceptance Criteria**:
  - [ ] `generateInvoicePDF(invoiceId)` menghasilkan PDF file di Supabase Storage
  - [ ] PDF mencantumkan: invoice number, VAT number, per-item VAT breakdown
  - [ ] PDF URL tersimpan di `invoices.pdf_url`
  - [ ] `sendOrderConfirmation()` berhasil kirim email via Resend
  - [ ] Semua email function tidak throw error (dengan mock atau test Resend)

  **QA Scenarios**:
  ```
  Scenario: PDF invoice generated
    Tool: Bash
    Steps:
      1. Call generateInvoicePDF dengan existing invoice ID (dari seed order)
      2. Check Supabase Storage ada file di documents/invoices/
      3. Check invoices.pdf_url updated
    Expected Result: PDF file exists di storage, URL saved
    Evidence: .sisyphus/evidence/task-29-pdf-generated.txt

  Scenario: Invoice contains required UK legal fields
    Tool: Manual (Bash + download)
    Steps:
      1. Download generated PDF
      2. Verify VAT number field, company number, per-item VAT breakdown present
    Expected Result: Semua UK legal fields ada di invoice
    Evidence: .sisyphus/evidence/task-29-invoice-fields.png
  ```

  **Commit**: YES (wave 7 group)
  - Message: `feat(account): account/orders pages, PDF invoice, email templates`

---

- [ ] 30. Admin Products + Categories CRUD

  **What to do**:
  - Buat `src/app/admin/products/page.tsx` — product list:
    - Table: image thumbnail, name, category, price (inc VAT), stock, status (active/draft), featured toggle, actions
    - Search by name/SKU, filter by category/status
    - Bulk actions: deactivate, delete
    - "New Product" button
  - Buat `src/app/admin/products/new/page.tsx` dan `src/app/admin/products/[id]/edit/page.tsx` — product form:
    - Basic info: name (→ auto-generate slug), short description, full description (Tiptap rich text editor)
    - Category dropdown dengan search
    - **Media**: `ImageUpload` component (T19) — drag drop, max 10, reorder, alt text
    - **Pricing** (sesuai spec section 8.3):
      - Price (£) input → konvert ke pence saat save
      - "Price includes VAT" toggle (ON by default) dengan preview: "Customer sees: £XX.XX inc. VAT" atau "Customer sees: £XX.XX inc. VAT (£YY.YY + £ZZ.ZZ VAT)"
      - VAT rate select: Standard 20% / Reduced 5% / Zero 0%
      - Compare at price (optional, strikethrough)
      - Cost price (optional, admin only — ex-VAT, untuk margin calc)
    - **Inventory**: SKU, barcode, track inventory toggle, stock qty, low stock threshold
    - **Shipping**: weight (grams, REQUIRED), dimensions L×W×H cm
    - **Variants** (optional):
      - Add option groups (Size, Colour, etc.)
      - Auto-generate variant combinations
      - Per-variant: SKU, price override (null = inherit), stock qty
      - Bulk edit table
    - **SEO**: meta title (auto-fill), meta description, Google preview snippet
    - Tags chip input
    - Status: Active/Draft toggle, Featured toggle
    - Save actions: "Save Draft" | "Publish"
    - Audit log: setiap save → `logAdminAction('product.created' / 'product.updated')` dengan `generateChanges()`
  - Buat `src/app/admin/categories/page.tsx`:
    - Tree view atau flat list dengan parent_id hierarchy
    - CRUD: create, edit name/slug/description/image, reorder (sort_order), activate/deactivate
    - Cannot delete category jika ada products assigned (prevent orphan)
    - Audit log: `category.created`, `category.updated`, `category.deleted`

  **Must NOT do**:
  - JANGAN allow cost_price di client-side untuk customer access
  - JANGAN delete category dengan active products

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`shadcn-ui`, `shadcn-ui`]
    - `shadcn-ui`: DataTable (@tanstack/react-table), Form, Tabs, Toggle, Sheet

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T31-T33)
  - **Parallel Group**: Wave 8
  - **Blocks**: T49 (audit log per product), T51 (analytics pakai product data)
  - **Blocked By**: T17 (admin layout), T19 (image upload), T29 (audit logger)

  **References**:
  - Spec section 8.3 (Product Management — full UI spec)
  - Spec section 17.1 (Audit log — `product.created, updated, deleted, stock_adjusted`)

  **Acceptance Criteria**:
  - [ ] Create product dengan all required fields → product muncul di listing
  - [ ] VAT toggle preview shows correct customer price
  - [ ] Image upload berfungsi (drag drop, reorder)
  - [ ] Variants: auto-generate combinations dari size × colour
  - [ ] Audit log entry created setiap save product

  **QA Scenarios**:
  ```
  Scenario: Create product end-to-end
    Tool: Playwright
    Steps:
      1. Navigate ke /admin/products/new (admin login)
      2. Fill: name "Test Product", price £29.99 (VAT included), weight 500g
      3. Select category
      4. Upload 1 image
      5. Click "Publish"
      6. Navigate ke /products
    Expected Result: Product visible di storefront listing
    Evidence: .sisyphus/evidence/task-30-create-product.png

  Scenario: VAT toggle preview
    Tool: Playwright
    Steps:
      1. Product form, price = £29.99
      2. Toggle "Price includes VAT" OFF
      3. Assert preview text updated: "Customer sees: £35.99 inc. VAT"
    Expected Result: Preview shows £35.99 (£29.99 + 20% VAT)
    Evidence: .sisyphus/evidence/task-30-vat-preview.png
  ```

  **Commit**: YES (wave 8 group)

---

- [ ] 31. Admin Orders Management

  **What to do**:
  - Buat `src/app/admin/orders/page.tsx` (sesuai spec section 8.2):
    - Table: Order#, Customer name+email, Total (inc VAT £format), Status badge, Date, Actions
    - Filters: status dropdown, date range picker, search (order#, customer name, email)
    - Bulk actions: "Mark as Processing" (untuk paid orders), "Export CSV"
    - Pagination (50 per page)
  - Buat `src/app/admin/orders/[id]/page.tsx` — order detail:
    - Header: Order #, Status Badge (colored), Date created
    - **Status Update section**:
      - Status dropdown (sesuai valid transitions dari spec)
      - "Update" button → server action: update DB, insert ke `status_history`, insert ke `shipment_tracking`
      - Jika status → "shipped": tambahkan field tracking number (required) + courier/method
      - Jika status → "in_transit" atau "out_for_delivery": add tracking entry dengan location
      - Jika status → "delivered": auto-set `delivered_at = now()`, send delivery confirmation email
      - Add note textarea
    - **Customer Info**: full_name, email (link ke /admin/customers/{id}), phone
    - **Delivery Address**: dari `shipping_address` JSONB snapshot
    - **Order Items**: table dengan product image, name, variant, qty, unit price, VAT rate, total
    - **Payment Info**: Stripe PaymentIntent ID (link ke Stripe dashboard), payment method summary, paid_at, refund button (partial/full)
    - **Refund**: button → dialog → Stripe `stripe.refunds.create({charge: charge_id, amount?: partial_amount})` → update order status → send email
    - **Shipping Tracking Timeline**: editable list + "Add tracking entry" form
    - **Admin Notes**: internal textarea (not visible to customer)
    - Actions: Cancel Order (with reason dialog), Resend Confirmation Email, Download Invoice, Regenerate Invoice
    - **Activity Log tab**: semua `admin_audit_log` entries untuk order ini
    - Audit log: SEMUA perubahan → `logAdminAction()`

  **Must NOT do**:
  - JANGAN allow invalid status transitions (e.g., 'delivered' → 'shipped')
  - JANGAN allow refund tanpa Stripe charge ID
  - JANGAN show customer payment details beyond "Visa ending 4242"

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`shadcn-ui`]
    - `shadcn-ui`: DataTable, Dialog, Tabs, Badge, Timeline-like component

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T30, T32-T33)
  - **Parallel Group**: Wave 8
  - **Blocks**: T49 (audit log harus sudah ada)
  - **Blocked By**: T17 (admin layout), T27 (orders exist), T29 (audit logger, email)

  **References**:
  - Spec section 8.2 (Order Management — semua actions detail)
  - Spec section 5.3 (Shipping Tracking Flow)
  - Spec section 17.1 (Audit log — `order.status_updated, refunded, cancelled, tracking_added`)

  **Acceptance Criteria**:
  - [ ] Order list tampil dengan semua orders
  - [ ] Status update berfungsi + tracking entry created
  - [ ] Refund via Stripe berhasil (test mode)
  - [ ] Audit log entry dibuat untuk setiap perubahan
  - [ ] CSV export berfungsi

  **QA Scenarios**:
  ```
  Scenario: Update order status
    Tool: Playwright
    Steps:
      1. Navigate ke /admin/orders/{paid-order-id}
      2. Change status dropdown ke "processing"
      3. Click Update
      4. Check status badge updated
      5. Check Activity Log tab ada entry baru
    Expected Result: Status updated, audit log entry created
    Evidence: .sisyphus/evidence/task-31-order-status.png

  Scenario: Admin refund
    Tool: Playwright
    Steps:
      1. Click "Refund" pada paid order
      2. Select full refund dalam dialog
      3. Confirm
      4. Check Stripe dashboard test mode for refund
    Expected Result: Refund created in Stripe, order status = 'refunded'
    Evidence: .sisyphus/evidence/task-31-refund.png
  ```

  **Commit**: YES (wave 8 group)

---

- [ ] 32. Admin Customers + Shipping + Discounts + CMS

  **What to do**:
  - Buat `src/app/admin/customers/page.tsx`:
    - Table: name, email, registered date, total orders, total spend
    - Search by name/email, filter by date range
  - Buat `src/app/admin/customers/[id]/page.tsx`:
    - Profile: avatar, name, email, phone, joined date, role
    - Order history (all orders dari customer ini)
    - Addresses list (read-only view)
    - GDPR: status data deletion request jika ada, "Process Deletion" button (admin)
    - Audit log: `logAdminAction('customer.role_changed')` jika admin ubah role
  - Buat `src/app/admin/shipping/zones/page.tsx` dan `rates/page.tsx` (sesuai spec section 8.4):
    - Zone list: name, regions, method count, status
    - Zone editor: name, regions (multi-select dengan type: prefix/area/country + value)
    - Rates per zone: method, label, calculation type, rate config, delivery estimate
    - "+ Add Rate" form dengan semua calculation type options
    - Reorder rates (drag, updates sort_order)
    - "Test Calculator": input postcode → see which rates apply (calls `/api/shipping/calculate`)
    - Audit log: `shipping.zone_created`, `shipping.rate_created`, dll
  - Buat `src/app/admin/discounts/page.tsx` dan `new/page.tsx`:
    - List: code, type, value, usage (X/limit), expires_at, status
    - Create form: code, description, type (percentage/fixed/free_shipping), value, min spend, max discount cap, usage limits, date range, applicable to
    - Quick deactivate/activate toggle
    - Audit log: `discount.created`, `discount.deactivated`
  - Buat `src/app/admin/pages/page.tsx` — CMS pages:
    - List: title, slug, published status, updated date
    - Buat/Edit page: title, slug (auto-gen), content (Tiptap rich text), meta SEO fields, publish toggle
    - Preview button (buka /pages/slug di new tab)
    - Audit log: `page.updated`, `page.published`

  **Must NOT do**:
  - JANGAN expose customer PII lebih dari yang dibutuhkan
  - JANGAN allow delete discount yang sudah dipakai di orders (deactivate saja)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`shadcn-ui`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T30-T31)
  - **Parallel Group**: Wave 8 (sebagian) + Wave 9
  - **Blocks**: T49 (audit log)
  - **Blocked By**: T17 (admin layout), T10 (shipping tables), T11 (discounts table)

  **References**:
  - Spec section 8.4 (Shipping Zone Management)
  - Spec section 8.2 (Discount list in admin)
  - Spec section 17.1 (Audit log actions untuk shipping, discounts, customers, pages)

  **Acceptance Criteria**:
  - [ ] Shipping zone + rate created → tersedia di `/api/shipping/calculate`
  - [ ] Discount code created → valid saat dipakai di checkout
  - [ ] CMS page published → accessible di `/pages/{slug}`
  - [ ] Customer GDPR deletion processed → `data_deletion_requests.status = 'completed'`

  **QA Scenarios**:
  ```
  Scenario: Create shipping zone and use in checkout
    Tool: Playwright + Bash
    Steps:
      1. Create zone "Test Zone" dengan region "W1" prefix
      2. Add rate: Standard £3.99 flat
      3. curl /api/shipping/calculate dengan postcode "W1A 1AA"
    Expected Result: Test Zone Standard rate appears in response
    Evidence: .sisyphus/evidence/task-32-shipping-zone.txt

  Scenario: Create discount and apply at checkout
    Tool: Playwright
    Steps:
      1. Create discount code "TEST10" (10%, no min spend)
      2. Go through checkout, apply "TEST10"
    Expected Result: 10% discount applied to order total
    Evidence: .sisyphus/evidence/task-32-discount-apply.png
  ```

  **Commit**: YES (wave 9 group)

---

- [ ] 33. Admin Settings + Newsletter

  **What to do**:
  - Buat `src/app/admin/settings/general/page.tsx`:
    - Store name, store logo (ImageUpload), currency (fixed: GBP), timezone, VAT rate, default price_includes_vat toggle, VAT number, company registration number, contact email, contact phone, store address, social links (Instagram, Facebook, TikTok)
    - Save → update `store_settings` table
  - Buat `src/app/admin/settings/payment/page.tsx`:
    - Display Stripe keys dari env vars (masked): Publishable Key, Secret Key (readonly), Webhook Secret (readonly)
    - Instruksi setup Stripe webhook URL
  - Buat `src/app/admin/settings/email/page.tsx`:
    - Resend API key (masked input), from email, from name
    - Preview email templates (read-only)
  - Buat `src/app/admin/settings/legal/page.tsx`:
    - GDPR data retention days, cookie banner enabled toggle, returns policy days
    - Links ke CMS legal pages untuk edit content
  - Buat `src/app/admin/settings/newsletter/page.tsx` — Newsletter Subscribers:
    - Stats: total active subscribers, this month, unsubscribed this month
    - Table: email, name, source, subscribed date, status (active/unsubscribed)
    - Search, sort
    - "Export CSV" button → download CSV dengan email, full_name, subscribed_at, source
    - Audit log: `settings.updated` per settings change
  - Buat `src/app/admin/settings/shipping/page.tsx`:
    - Default shipping rules (fallback)
    - Auto-complete days (default 14 — order auto-complete N days after delivered)
    - Low stock email alert toggle
  - Semua settings form: react-hook-form + zod, save dengan server action, toast notification

  **Must NOT do**:
  - JANGAN store Stripe secret key di `store_settings` table (ambil dari env vars)
  - JANGAN allow edit VAT number tanpa confirmation

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`shadcn-ui`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T30-T32)
  - **Parallel Group**: Wave 9
  - **Blocks**: T50 (dashboard pakai store_settings), T51 (analytics)
  - **Blocked By**: T17 (admin layout), T11 (store_settings, newsletter tables)

  **References**:
  - Spec section 16.4 (Admin Newsletter Subscriber Management)
  - Spec section store_settings default values dari spec 2.1
  - Spec section 10.2 (GDPR settings: data_retention_days, cookie_banner_enabled)

  **Acceptance Criteria**:
  - [ ] Store name update di general settings → tersimpan ke DB
  - [ ] Newsletter CSV export download berfungsi
  - [ ] All 6 settings pages load tanpa error

  **QA Scenarios**:
  ```
  Scenario: Newsletter CSV export
    Tool: Playwright
    Steps:
      1. Navigate ke /admin/settings/newsletter (admin login)
      2. Click "Export CSV"
    Expected Result: CSV file downloaded dengan columns: email, full_name, subscribed_at, source
    Evidence: .sisyphus/evidence/task-33-newsletter-csv.txt
  ```

  **Commit**: YES (wave 9 group)

---

- [ ] 34. Audit Log System + Admin Dashboard + Analytics + Cron Jobs

  **What to do**:
  - Buat `src/app/admin/audit-log/page.tsx` (sesuai spec section 17.4):
    - Filters: date range picker, admin dropdown, entity type dropdown, free text search (summary field)
    - Table: Date/Time | Admin email | Action | Summary | [View]
    - [View] expand row: full changes diff (old → new values), IP address, user agent
    - Pagination (50 per page)
    - "Export CSV" (filtered)
    - Tambahkan "Activity Log" tab di `/admin/orders/[id]` (filter entries untuk order ini)
    - Tambahkan "Change History" tab di `/admin/products/[id]/edit`
  - Buat `src/app/admin/page.tsx` — dashboard overview (sesuai spec section 8.1):
    - Metric cards dengan time toggle (today / 7 days / 30 days):
      - Total Revenue (£), Total Orders, Average Order Value, New Customers
    - Sales chart: line chart last 30 days (gunakan recharts atau shadcn chart)
    - Recent Orders: 5 terbaru dengan quick action buttons
    - Low Stock Alerts: products dimana `stock_quantity <= low_stock_threshold` (link ke edit)
    - Pending Reviews: count awaiting moderation (link ke future review moderation)
    - Newsletter: X active subscribers (link ke /admin/settings/newsletter)
    - Recent Activity: 5 audit log entries terbaru
  - Buat `src/app/admin/analytics/page.tsx`:
    - Sales overview: revenue chart per period (weekly/monthly)
    - Top products by revenue
    - Orders by status breakdown (pie chart)
    - New customers per period
  - Buat cron job route handlers (diprotect dengan secret key header):
    - `src/app/api/cron/cleanup/route.ts`:
      - Abandoned cart: kirim reminder email ke user yang punya pending_payment order > 1 jam (via T29 email)
      - Auto-cancel: cancel orders `pending_payment > 24 jam` yang belum dibayar
      - Auto-complete: complete orders `delivered > N days` (dari store_settings `auto_complete_days`)
    - `src/app/api/cron/audit-retention/route.ts`:
      - Delete audit log entries older than `gdpr_data_retention_days` dari store_settings
    - Kedua cron routes: validate `Authorization: Bearer {CRON_SECRET}` header
    - Setup: document cara schedule via Vercel Cron atau GitHub Actions

  **Must NOT do**:
  - JANGAN allow cron routes tanpa secret key auth
  - JANGAN delete audit logs yang berkaitan dengan legal requirements (orders, financial data)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Dashboard dengan charts butuh visual design
  - **Skills**: [`shadcn-ui`]
    - `shadcn-ui`: Chart component (shadcn menggunakan recharts)

  **Parallelization**:
  - **Can Run In Parallel**: YES (dengan T33)
  - **Parallel Group**: Wave 10
  - **Blocks**: F1-F4 (final verification)
  - **Blocked By**: T17 (admin layout), T11 (admin_audit_log table), T29 (email untuk cron)

  **References**:
  - Spec section 8.1 (Dashboard Overview)
  - Spec section 17.3-17.5 (Audit Log UI + data retention)
  - Spec section 9.1 (Abandoned cart email — 1hr, payment pending — 6hr)
  - Spec: `auto_complete_days: 14` dari store_settings
  - Spec: `gdpr_data_retention_days: 730` default

  **Acceptance Criteria**:
  - [ ] Audit log page: filter by action type berfungsi
  - [ ] Audit log: "Change History" tab di product edit muncul dengan history
  - [ ] Dashboard: metric cards tampil dengan data dari DB
  - [ ] Cron cleanup: `GET /api/cron/cleanup` tanpa auth → 401
  - [ ] Cron cleanup: dengan valid secret → 200, abandoned orders di-cancel
  - [ ] Cron audit: delete old entries sesuai retention period

  **QA Scenarios**:
  ```
  Scenario: Audit log filter
    Tool: Playwright
    Steps:
      1. Navigate ke /admin/audit-log
      2. Filter by entity_type "order"
    Expected Result: Only order-related audit entries visible
    Evidence: .sisyphus/evidence/task-34-audit-filter.png

  Scenario: Cron cleanup requires auth
    Tool: Bash
    Steps:
      1. curl http://localhost:3000/api/cron/cleanup (no auth header)
      2. curl http://localhost:3000/api/cron/cleanup -H "Authorization: Bearer {CRON_SECRET}"
    Expected Result: First → 401, Second → 200
    Evidence: .sisyphus/evidence/task-34-cron-auth.txt
  ```

  **Commit**: YES (wave 10 group)
  - Message: `feat(admin): audit log, dashboard, analytics, cron jobs`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Baca plan end-to-end. Verifikasi setiap "Must Have" ada implementasinya. Verifikasi setiap "Must NOT Have" tidak ada di codebase (cari pattern forbidden). Check semua evidence files ada di .sisyphus/evidence/. Compare deliverables vs plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Jalankan `bun run build` + `bun run lint` + `bun run type-check`. Review semua file yang diubah: `as any`/`@ts-ignore`, empty catch, console.log di production, unused imports, hardcoded secrets, service role key leakage ke client.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | TypeCheck [PASS/FAIL] | Security [PASS/FAIL] | VERDICT`

- [ ] F3. **Real QA End-to-End** — `unspecified-high` + `playwright` skill
  Start dari clean state. Jalankan full user journey: register → verify email → browse products → add to cart → checkout → payment (test card) → view order → download invoice. Juga: admin login → update order status → tambah tracking → refund. Save semua screenshots ke `.sisyphus/evidence/final-qa/`.
  Output: `User Journey [PASS/FAIL] | Admin Journey [PASS/FAIL] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  Per task: baca "What to do", baca actual diff. Verifikasi 1:1 — semua yang di spec dibangun, tidak ada yang di luar spec. Check "Must NOT do" compliance. Detect cross-task contamination.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- Wave 1: `feat(foundation): project scaffolding, types, utils, supabase/stripe clients`
- Wave 2: `feat(database): full schema, functions, triggers, RLS policies`
- Wave 3: `feat(auth): authentication flow, middleware, admin layout`
- Wave 4: `feat(components): address form, cart system, shared components`
- Wave 5: `feat(storefront): homepage, product listing, product detail, wishlist`
- Wave 6: `feat(checkout): shipping calculator, checkout flow, stripe webhook`
- Wave 7: `feat(account): account pages, order tracking, pdf invoice, email`
- Wave 8: `feat(admin-core): products, categories, orders, customers admin`
- Wave 9: `feat(admin-advanced): shipping, discounts, cms, settings`
- Wave 10: `feat(audit): audit log, analytics, cron jobs`

---

## Success Criteria

### Verification Commands
```bash
bun run build          # Expected: Build successful, 0 errors
bun run lint           # Expected: No ESLint errors
bun run type-check     # Expected: TypeScript 0 errors
# Test Stripe payment (test mode)
curl -X POST http://localhost:3000/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{"postcode":"SW1A 1AA","subtotal_pence":5000,"cart_items":[{"weight_grams":500,"quantity":1}]}'
# Expected: JSON array of shipping options with cost_pence
```

### Final Checklist
- [ ] Semua "Must Have" present
- [ ] Semua "Must NOT Have" absent (grep codebase)
- [ ] `bun run build` pass
- [ ] `bun run lint` pass
- [ ] Stripe test payment berhasil end-to-end
- [ ] PDF invoice ter-generate dengan semua field UK legal requirement
- [ ] GDPR: cookie banner berfungsi, data export JSON, deletion request masuk DB
- [ ] RLS terverifikasi: customer tidak bisa akses data customer lain
- [ ] Admin protected: 401 jika bukan admin/super_admin
