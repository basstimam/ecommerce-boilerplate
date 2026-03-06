# Learnings — ecommerce-boilerplate-uk

## [2026-03-06] Session Start

### Platform
- OS: Windows (win32), shell: cmd.exe
- Git: initialized at C:\Users\Imam\Documents\project\KERJAAN\flux\ecommerce-boilerplate
- Git branch: main
- Initial commit: 3b6a427

### Windows cmd Shell Pattern
- `export CI=true...` prefix is auto-generated but fails on Windows cmd
- WORKAROUND: Use `export CI=true...; false || ACTUAL_COMMAND` pattern
  - `export CI=true...; false` fails as one unit → `||` runs actual command

### Tech Stack Constraints
- Tailwind v4: syntax `@import "tailwindcss"` (NOT `@tailwind base/components/utilities`)
- @react-pdf/renderer: MUST use nodejs runtime (NOT edge runtime)
- Stripe webhook: MUST use nodejs runtime, `request.text()` for raw body
- Supabase SSR: use `@supabase/ssr` package, NOT `@supabase/auth-helpers-nextjs` (deprecated)
- Prices: always store in PENCE (BIGINT), never float pounds

### Key Decisions
- Email: Resend (not Supabase Email)
- Checkout: requires login (checkout_require_account = true)
- Charts: shadcn chart (recharts wrapper)
- Postcode: regex validation only (no external lookup)

## [2026-03-06] T1 Completed: Project Scaffolding
- Next.js version: 15.5.12 (Turbopack)
- Bun version: 1.3.9
- Tailwind v4 configured with `@import "tailwindcss"` (v4.2.1)
- shadcn/ui style: new-york, baseColor: neutral, cssVariables: true
- shadcn/ui components installed: button, input, label, select, textarea, badge, card, dialog, sheet, dropdown-menu, table, tabs, separator, skeleton, avatar, popover, command, checkbox, radio-group, slider, switch, calendar, progress, sonner, form (25 components)
- Toast component deprecated in shadcn — use sonner instead
- TypeScript strict mode: strict + noImplicitAny + strictNullChecks
- Build status: SUCCESS (0 errors, 0 TS errors)
- Windows workaround: batch files for complex commands (export doesn't work in cmd.exe)
- `create-next-app` requires empty directory — temporarily move existing files, then restore
- Route groups created: (storefront), (auth), admin, api
- Default page.tsx removed, replaced with (storefront)/page.tsx placeholder
- Zod v4.3.6 installed (major version 4, not 3 — check for API differences)
  
## [2026-03-06] T14 Completed: Auth Pages UI  
- Zod v4: z.boolean().default(false) menyebabkan type mismatch dengan react-hook-form — solusi: hapus .default(false), gunakan defaultValues di useForm saja  
- Next.js 15: useSearchParams() wajib wrapped dalam Suspense boundary saat dipakai di page component  
- Pattern: buat XxxContent() component yang pakai useSearchParams, lalu XxxPage() export default wraps dengan Suspense  
- GDPR: marketing_consent harus defaultValues false (bukan z.boolean().default(false))  
- Auth layout: gunakan route group (auth) tanpa Navbar/Footer, centered dengan ShoppingBag icon sebagai logo  
- Build sukses (0 TypeScript errors), hanya ESLint warnings untuk placeholder _data params 
  
## [2026-03-06] T15 Completed: Auth Server Actions + OAuth Callback  
- @supabase/postgrest-js v2.98.0 memerlukan `Relationships: []` di setiap table definition dalam Database types  
- Manual Database types tanpa Relationships field menyebabkan `.select()` dan `.update()` resolve ke type `never`  
- Fix: tambahkan `Relationships: []` ke semua table (akan di-replace oleh `supabase gen types` nanti)  
- `__InternalSupabase.PostgrestVersion: '12'` juga menyebabkan issues — dihapus dari manual types  
- Server actions: `'use server'` di top file, import createClient dari server.ts (bukan client.ts)  
- OAuth callback: Supabase PKCE flow — callback exchanges code for session, no token needed di reset-password  
- Turbopack catches duplicate variable names (e.g., `const { data }` used twice) even when TS doesn't  
- sendPasswordReset: ALWAYS return success to prevent email enumeration attacks  
- `revalidatePath('/', 'layout')` setelah signIn/signOut untuk refresh auth cache  
- Build sukses (0 TypeScript errors), all routes detected including /auth/callback (dynamic) 
