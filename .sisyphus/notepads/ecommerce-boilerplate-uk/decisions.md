# Decisions — ecommerce-boilerplate-uk

## [2026-03-06] Architectural Decisions

### Authentication
- Email/password + optional Google OAuth
- Checkout REQUIRES login (checkout_require_account: true)
- NO guest checkout

### Email Provider
- Decision: Resend (RESEND_API_KEY env var)
- Rationale: Production-grade, spec says "Supabase Email / Resend"

### Pricing
- All prices stored in PENCE (BIGINT) — consistent with Stripe
- Display prices always show inc-VAT via getDisplayPrice()

### UK Shipping
- Self-managed (no Royal Mail/DPD API)
- Zone matching: postcode_area → postcode_prefix → country (GB catch-all)

### Review Moderation
- Review approval/rejection via "Reviews" tab in admin product edit page
- Dashboard shows pending reviews count with link

### Git Worktree
- No separate worktree needed — fresh project, work in main directory
- worktree_path = C:\Users\Imam\Documents\project\KERJAAN\flux\ecommerce-boilerplate
