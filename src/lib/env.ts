import { z } from 'zod'

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().email(),
})

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_STORE_NAME: z.string().min(1),
  NEXT_PUBLIC_CURRENCY: z.string().default('GBP'),
  NEXT_PUBLIC_VAT_RATE: z.string().default('20'),
  NEXT_PUBLIC_COUNTRY: z.string().default('GB'),
})

function validateServerEnv() {
  if (typeof window !== 'undefined') return {} as z.infer<typeof serverEnvSchema>

  const result = serverEnvSchema.safeParse(process.env)
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join('.') + ': ' + i.message).join('\n')
    throw new Error(`Missing required environment variables:\n${missing}`)
  }
  return result.data
}

export const serverEnv = validateServerEnv()

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME,
  NEXT_PUBLIC_CURRENCY: process.env.NEXT_PUBLIC_CURRENCY,
  NEXT_PUBLIC_VAT_RATE: process.env.NEXT_PUBLIC_VAT_RATE,
  NEXT_PUBLIC_COUNTRY: process.env.NEXT_PUBLIC_COUNTRY,
})
