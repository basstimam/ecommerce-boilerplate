import { z } from 'zod'
import { validateUKPostcode } from './postcode'

export const emailSchema = z.string().email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const ukPostcodeSchema = z
  .string()
  .refine(validateUKPostcode, 'Please enter a valid UK postcode')

export const ukPhoneSchema = z
  .string()
  .regex(/^(\+44|0)[0-9]{9,10}$/, 'Please enter a valid UK phone number')
  .optional()
  .or(z.literal(''))

export const addressSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  line1: z.string().min(3, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  county: z.string().optional(),
  postcode: ukPostcodeSchema,
  country: z.string().min(1),
  phone: ukPhoneSchema,
})

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  price_pence: z.number().int().positive('Price must be positive'),
  vat_rate: z.number().refine((v) => [0, 5, 20].includes(v), 'VAT rate must be 0, 5, or 20'),
  stock_quantity: z.number().int().min(0),
})

export const orderSchema = z.object({
  shipping_address: addressSchema,
  billing_address: addressSchema.optional(),
})

export type AddressFormData = z.infer<typeof addressSchema>
export type ProductFormData = z.infer<typeof productSchema>
