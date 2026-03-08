'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2, MapPin, Truck, CreditCard, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/types/product'
import { formatGBPFromPence } from '@/lib/utils/currency'
import { calculateCartVat } from '@/lib/vat/calculator'
import { validateUKPostcode, formatPostcode } from '@/lib/utils/postcode'
import type { ShippingOption } from '@/lib/shipping/calculator'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const addressSchema = z.object({
  full_name: z.string().min(2, 'Full name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number required'),
  address_line1: z.string().min(3, 'Address required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  county: z.string().optional(),
  postcode: z
    .string()
    .min(1, 'Postcode required')
    .refine((v) => validateUKPostcode(v), 'Enter a valid UK postcode'),
})

type AddressForm = z.infer<typeof addressSchema>

type Step = 'address' | 'shipping' | 'payment'

const STEPS: { key: Step; label: string; icon: typeof MapPin }[] = [
  { key: 'address', label: 'Delivery', icon: MapPin },
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'payment', label: 'Payment', icon: CreditCard },
]

export function CheckoutClient() {
  const { items, getSubtotalPence } = useCartStore()
  const router = useRouter()

  const [step, setStep] = useState<Step>('address')
  const [address, setAddress] = useState<AddressForm | null>(null)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string
    discount_pence: number
    is_free_shipping: boolean
    message: string
  } | null>(null)
  const [discountLoading, setDiscountLoading] = useState(false)

  const subtotalPence = getSubtotalPence()
  const vatSummary = calculateCartVat(
    items.map((i) => ({
      price_pence: i.price_pence,
      price_includes_vat: i.price_includes_vat,
      vat_rate: i.vat_rate,
      quantity: i.quantity,
    }))
  )
  const effectiveShippingPence = appliedDiscount?.is_free_shipping
    ? 0
    : (selectedShipping?.price_pence ?? 0)
  const totalPence = Math.max(
    0,
    vatSummary.total_inc_vat_pence + effectiveShippingPence - (appliedDiscount?.discount_pence ?? 0)
  )

  useEffect(() => {
    if (items.length === 0) router.replace('/cart')
  }, [items, router])

  const applyDiscount = async () => {
    if (!discountCode.trim()) return
    setDiscountLoading(true)
    try {
      const res = await fetch('/api/checkout/apply-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, subtotal_pence: subtotalPence }),
      })
      const data = await res.json() as { error?: string; success?: boolean; code?: string; discount_pence?: number; is_free_shipping?: boolean; message?: string }
      if (!res.ok) {
        toast.error(data.error ?? 'Invalid code')
      } else {
        setAppliedDiscount({
          code: data.code!,
          discount_pence: data.discount_pence ?? 0,
          is_free_shipping: data.is_free_shipping ?? false,
          message: data.message ?? 'Discount applied',
        })
        toast.success(data.message ?? 'Discount applied')
        setDiscountCode('')
      }
    } catch {
      toast.error('Failed to apply discount code')
    } finally {
      setDiscountLoading(false)
    }
  }

  const fetchShippingOptions = useCallback(async (postcode: string) => {
    setLoadingShipping(true)
    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode, subtotal_pence: subtotalPence, items }),
      })
      const data = await res.json() as { options: ShippingOption[] }
      setShippingOptions(data.options ?? [])
      if (data.options?.length > 0) setSelectedShipping(data.options[0])
    } catch {
      toast.error('Could not load shipping options')
    } finally {
      setLoadingShipping(false)
    }
  }, [subtotalPence, items])

  async function handleAddressSubmit(data: AddressForm) {
    const formatted = { ...data, postcode: formatPostcode(data.postcode) }
    setAddress(formatted)
    await fetchShippingOptions(formatted.postcode)
    setStep('shipping')
  }

  async function handleShippingNext() {
    if (!selectedShipping) {
      toast.error('Please select a shipping method')
      return
    }
    const res = await fetch('/api/checkout/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount_pence: totalPence,
        metadata: {
          shipping_rate_id: selectedShipping.rate_id,
          shipping_zone_id: selectedShipping.zone_id,
          item_count: String(items.length),
          discount_code: appliedDiscount?.code ?? '',
          discount_pence: String(appliedDiscount?.discount_pence ?? 0),
        },
      }),
    })
    if (!res.ok) {
      toast.error('Could not initialise payment. Please try again.')
      return
    }
    const { client_secret } = await res.json() as { client_secret: string }
    setClientSecret(client_secret)
    setStep('payment')
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Checkout</h1>

      <StepIndicator current={step} steps={STEPS} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 'address' && (
            <AddressStep onSubmit={handleAddressSubmit} defaultValues={address ?? undefined} />
          )}
          {step === 'shipping' && (
            <ShippingStep
              options={shippingOptions}
              loading={loadingShipping}
              selected={selectedShipping}
              onSelect={setSelectedShipping}
              onBack={() => setStep('address')}
              onNext={handleShippingNext}
            />
          )}
          {step === 'payment' && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <PaymentStep
                clientSecret={clientSecret}
                address={address!}
                shipping={selectedShipping!}
                onBack={() => setStep('shipping')}
              />
            </Elements>
          )}
        </div>

        <OrderSummary
          items={items}
          vatSummary={vatSummary}
          shipping={selectedShipping}
          effectiveShippingPence={effectiveShippingPence}
          totalPence={totalPence}
          step={step}
          discountCode={discountCode}
          onDiscountCodeChange={setDiscountCode}
          onApplyDiscount={applyDiscount}
          discountLoading={discountLoading}
          appliedDiscount={appliedDiscount}
          onRemoveDiscount={() => setAppliedDiscount(null)}
        />
      </div>
    </div>
  )
}

function StepIndicator({
  current,
  steps,
}: {
  current: Step
  steps: typeof STEPS
}) {
  const currentIdx = steps.findIndex((s) => s.key === current)
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < currentIdx
        const active = s.key === current
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                done
                  ? 'bg-green-600 text-white'
                  : active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`hidden text-sm sm:block ${active ? 'font-semibold' : 'text-muted-foreground'}`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-px w-8 ${i < currentIdx ? 'bg-green-600' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function AddressStep({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (d: AddressForm) => Promise<void>
  defaultValues?: Partial<AddressForm>
}) {
  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      county: '',
      postcode: '',
      ...defaultValues,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4" />
          Delivery Address
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane@example.co.uk" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+44 7700 000000" autoComplete="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_line1"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="123 High Street" autoComplete="address-line1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_line2"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Address Line 2 <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Flat 4, Building B" autoComplete="address-line2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Town / City</FormLabel>
                    <FormControl>
                      <Input placeholder="London" autoComplete="address-level2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>County <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Greater London" autoComplete="address-level1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input placeholder="SW1A 1AA" autoComplete="postal-code" className="uppercase" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="mt-2 w-full sm:w-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</>
              ) : (
                'Continue to Shipping'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function ShippingStep({
  options,
  loading,
  selected,
  onSelect,
  onBack,
  onNext,
}: {
  options: ShippingOption[]
  loading: boolean
  selected: ShippingOption | null
  onSelect: (o: ShippingOption) => void
  onBack: () => void
  onNext: () => Promise<void>
}) {
  const [submitting, setSubmitting] = useState(false)

  async function handleNext() {
    setSubmitting(true)
    await onNext()
    setSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Truck className="h-4 w-4" />
          Shipping Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading shipping options...</span>
          </div>
        ) : options.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No shipping options available for this postcode.
          </p>
        ) : (
          <RadioGroup
            value={selected?.rate_id ?? ''}
            onValueChange={(v) => {
              const opt = options.find((o) => o.rate_id === v)
              if (opt) onSelect(opt)
            }}
            className="flex flex-col gap-3"
          >
            {options.map((option) => (
              <label
                key={option.rate_id}
                htmlFor={option.rate_id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                  selected?.rate_id === option.rate_id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={option.rate_id} id={option.rate_id} />
                  <div>
                    <p className="font-medium">{option.name}</p>
                    {option.description && (
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    )}
                    {option.estimated_days_min && option.estimated_days_max && (
                      <p className="text-xs text-muted-foreground">
                        {option.estimated_days_min}–{option.estimated_days_max} working days
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-semibold">
                  {option.price_pence === 0 ? 'FREE' : formatGBPFromPence(option.price_pence)}
                </span>
              </label>
            ))}
          </RadioGroup>
        )}

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button
            onClick={handleNext}
            disabled={!selected || submitting}
          >
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait...</>
            ) : (
              'Continue to Payment'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentStep({
  address,
  shipping,
  onBack,
}: {
  clientSecret: string
  address: AddressForm
  shipping: ShippingOption
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setErrorMsg(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        payment_method_data: {
          billing_details: {
            name: address.full_name,
            email: address.email,
            phone: address.phone,
            address: {
              line1: address.address_line1,
              line2: address.address_line2 ?? '',
              city: address.city,
              postal_code: address.postcode,
              country: 'GB',
            },
          },
        },
      },
    })

    if (error) {
      setErrorMsg(error.message ?? 'Payment failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="font-medium">Delivering to</p>
          <p className="text-muted-foreground">
            {address.address_line1}, {address.city}, {address.postcode}
          </p>
          <p className="mt-1 font-medium">Shipping: {shipping.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <PaymentElement />

          {errorMsg && (
            <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {errorMsg}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
              Back
            </Button>
            <Button type="submit" disabled={!stripe || submitting} className="flex-1">
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
              ) : (
                'Pay Now'
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Secured by Stripe. Your card details are never stored on our servers.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

function OrderSummary({
  items,
  vatSummary,
  shipping,
  effectiveShippingPence,
  totalPence,
  step,
  discountCode,
  onDiscountCodeChange,
  onApplyDiscount,
  discountLoading,
  appliedDiscount,
  onRemoveDiscount,
}: {
  items: CartItem[]
  vatSummary: { subtotal_ex_vat_pence: number; total_vat_pence: number; total_inc_vat_pence: number }
  shipping: ShippingOption | null
  effectiveShippingPence: number
  totalPence: number
  step: Step
  discountCode: string
  onDiscountCodeChange: (v: string) => void
  onApplyDiscount: () => void
  discountLoading: boolean
  appliedDiscount: { code: string; discount_pence: number; is_free_shipping: boolean; message: string } | null
  onRemoveDiscount: () => void
}) {
  return (
    <div className="h-fit">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-4 w-4" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={`${item.product_id}-${item.variant_id ?? ''}`} className="flex justify-between text-sm">
                <span className="line-clamp-1 text-muted-foreground">
                  {item.product_name}
                  {item.variant_options && (
                    <span className="ml-1 text-xs">
                      ({Object.values(item.variant_options).join(', ')})
                    </span>
                  )}
                  {' '}× {item.quantity}
                </span>
                <span className="shrink-0 font-medium">
                  {formatGBPFromPence(item.price_pence * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {appliedDiscount ? (
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
              <div>
                <p className="text-xs font-medium text-green-800">{appliedDiscount.code}</p>
                <p className="text-xs text-green-600">{appliedDiscount.message}</p>
              </div>
              <button
                onClick={onRemoveDiscount}
                className="text-xs text-green-600 hover:text-green-900 underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={discountCode}
                onChange={(e) => onDiscountCodeChange(e.target.value.toUpperCase())}
                placeholder="Discount code"
                className="h-8 text-xs uppercase"
                onKeyDown={(e) => e.key === 'Enter' && onApplyDiscount()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={onApplyDiscount}
                disabled={discountLoading || !discountCode.trim()}
                className="h-8 px-3 text-xs whitespace-nowrap"
              >
                {discountLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal (ex. VAT)</span>
              <span>{formatGBPFromPence(vatSummary.subtotal_ex_vat_pence)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT</span>
              <span>{formatGBPFromPence(vatSummary.total_vat_pence)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>
                {shipping
                  ? effectiveShippingPence === 0
                    ? 'FREE'
                    : formatGBPFromPence(effectiveShippingPence)
                  : '—'}
              </span>
            </div>
            {appliedDiscount && appliedDiscount.discount_pence > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedDiscount.code})</span>
                <span>−{formatGBPFromPence(appliedDiscount.discount_pence)}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{step === 'address' ? formatGBPFromPence(vatSummary.total_inc_vat_pence) : formatGBPFromPence(totalPence)}</span>
          </div>

          <p className="text-xs text-muted-foreground">All prices include UK VAT where applicable.</p>
        </CardContent>
      </Card>
    </div>
  )
}
