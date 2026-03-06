'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const settingsSchema = z.object({
  store_name: z.string().min(1),
  store_email: z.string().email(),
  store_phone: z.string().optional(),
  vat_number: z.string().optional(),
  company_number: z.string().optional(),
  address_line1: z.string().min(1),
  address_city: z.string().min(1),
  address_postcode: z.string().min(1),
  free_shipping_threshold_pence: z.number({ coerce: true }).min(0),
  order_email_from: z.string().email(),
})

type SettingsForm = z.infer<typeof settingsSchema>

const DEFAULTS: SettingsForm = {
  store_name: 'My Store',
  store_email: 'hello@mystore.co.uk',
  store_phone: '',
  vat_number: 'GB123456789',
  company_number: '',
  address_line1: '123 High Street',
  address_city: 'London',
  address_postcode: 'SW1A 1AA',
  free_shipping_threshold_pence: 5000,
  order_email_from: 'orders@mystore.co.uk',
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: DEFAULTS,
  })

  const onSubmit = async (_data: SettingsForm) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    toast.success('Settings saved', { description: 'Connect a settings table in Supabase to persist these.' })
    setLoading(false)
  }

  const fieldClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure your store details and preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Store Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Store Name</label>
              <input {...register('store_name')} className={fieldClass} />
              {errors.store_name && <p className="mt-1 text-xs text-red-600">{errors.store_name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Store Email</label>
              <input {...register('store_email')} type="email" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number (optional)</label>
              <input {...register('store_phone')} type="tel" className={fieldClass} placeholder="+44 20 0000 0000" />
            </div>
            <div>
              <label className={labelClass}>Order Confirmation From</label>
              <input {...register('order_email_from')} type="email" className={fieldClass} />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">UK Business Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>VAT Number</label>
              <input {...register('vat_number')} className={fieldClass} placeholder="GB123456789" />
            </div>
            <div>
              <label className={labelClass}>Company Number (optional)</label>
              <input {...register('company_number')} className={fieldClass} placeholder="12345678" />
            </div>
            <div>
              <label className={labelClass}>Registered Address Line 1</label>
              <input {...register('address_line1')} className={fieldClass} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>City</label>
                <input {...register('address_city')} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Postcode</label>
                <input {...register('address_postcode')} className={`${fieldClass} uppercase`} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Shipping</h2>
          <div className="max-w-xs">
            <label className={labelClass}>Free Shipping Threshold (pence)</label>
            <input {...register('free_shipping_threshold_pence')} type="number" min="0" className={fieldClass} />
            <p className="mt-1 text-xs text-gray-400">Enter in pence. 5000 = £50.00</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}
