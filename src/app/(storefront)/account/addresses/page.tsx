'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { validateUKPostcode, formatPostcode } from '@/lib/utils/postcode'
import { MapPin, Plus, Trash2, Star, Loader2, X } from 'lucide-react'

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50),
  full_name: z.string().min(2, 'Full name is required'),
  line1: z.string().min(3, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  county: z.string().optional(),
  postcode: z.string().refine(validateUKPostcode, 'Invalid UK postcode'),
  phone: z.string().optional(),
})

type AddressForm = z.infer<typeof addressSchema>

interface SavedAddress extends AddressForm {
  id: string
  is_default: boolean
}

export default function AddressesPage() {
  const supabase = createClient()
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) })

  const fetchAddresses = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })

    setAddresses((data ?? []) as SavedAddress[])
    setFetchLoading(false)
  }, [supabase])

  useEffect(() => { fetchAddresses() }, [fetchAddresses])

  const openAdd = () => {
    reset({ label: 'Home', postcode: '' })
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (addr: SavedAddress) => {
    reset(addr)
    setEditingId(addr.id)
    setShowForm(true)
  }

  const onSubmit = async (data: AddressForm) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const formatted = { ...data, postcode: formatPostcode(data.postcode) }

      if (editingId) {
        const { error } = await supabase
          .from('addresses')
          .update({ ...formatted, updated_at: new Date().toISOString() })
          .eq('id', editingId)
          .eq('user_id', user.id)
        if (error) throw error
        toast.success('Address updated')
      } else {
        const isFirst = addresses.length === 0
        const { error } = await supabase
          .from('addresses')
          .insert({ ...formatted, user_id: user.id, is_default: isFirst })
        if (error) throw error
        toast.success('Address added')
      }

      setShowForm(false)
      fetchAddresses()
    } catch (err) {
      toast.error('Failed to save address', { description: err instanceof Error ? err.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const deleteAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      toast.error('Failed to delete address')
    } else {
      toast.success('Address deleted')
      fetchAddresses()
    }
  }

  const setDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    toast.success('Default address updated')
    fetchAddresses()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your delivery addresses for faster checkout.</p>
        </div>
        {!showForm && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                {...register('label')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="e.g. Home, Work"
              />
              {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  {...register('full_name')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="John Smith"
                />
                {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="+44 7700 000000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input
                {...register('line1')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="123 High Street"
              />
              {errors.line1 && <p className="mt-1 text-xs text-red-600">{errors.line1.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (optional)</label>
              <input
                {...register('line2')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                placeholder="Flat 4, Apartment B"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Town</label>
                <input
                  {...register('city')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="London"
                />
                {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">County (optional)</label>
                <input
                  {...register('county')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Greater London"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                <input
                  {...register('postcode')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 uppercase"
                  placeholder="SW1A 1AA"
                  onBlur={(e) => setValue('postcode', formatPostcode(e.target.value))}
                />
                {errors.postcode && <p className="mt-1 text-xs text-red-600">{errors.postcode.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {fetchLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">No addresses saved</p>
            <p className="text-sm text-gray-500">Add an address for faster checkout.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-xl bg-white border shadow-sm p-5 ${addr.is_default ? 'border-gray-900' : 'border-gray-100'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{addr.label}</span>
                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2 py-0.5 text-xs text-white">
                      <Star className="h-3 w-3" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(addr)}
                    className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <address className="not-italic text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-900">{addr.full_name}</p>
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city}{addr.county ? `, ${addr.county}` : ''}</p>
                <p>{addr.postcode}</p>
              </address>
              {!addr.is_default && (
                <button
                  onClick={() => setDefault(addr.id)}
                  className="mt-3 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
