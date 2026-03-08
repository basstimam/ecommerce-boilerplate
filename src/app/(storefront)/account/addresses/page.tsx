'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { validateUKPostcode, formatPostcode } from '@/lib/utils/postcode'
import { MapPin, Plus, Trash2, Star, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
          <h1 className="text-2xl font-bold">Saved Addresses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your delivery addresses for faster checkout.
          </p>
        </div>
        {!showForm && (
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </CardTitle>
            <button
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  {...register('label')}
                  placeholder="e.g. Home, Work"
                />
                {errors.label && (
                  <p className="text-xs text-destructive">{errors.label.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    {...register('full_name')}
                    placeholder="John Smith"
                    autoComplete="name"
                  />
                  {errors.full_name && (
                    <p className="text-xs text-destructive">{errors.full_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="+44 7700 000000"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="line1">Address Line 1</Label>
                <Input
                  id="line1"
                  {...register('line1')}
                  placeholder="123 High Street"
                  autoComplete="address-line1"
                />
                {errors.line1 && (
                  <p className="text-xs text-destructive">{errors.line1.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="line2">Address Line 2 (optional)</Label>
                <Input
                  id="line2"
                  {...register('line2')}
                  placeholder="Flat 4, Apartment B"
                  autoComplete="address-line2"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City / Town</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="London"
                    autoComplete="address-level2"
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="county">County (optional)</Label>
                  <Input
                    id="county"
                    {...register('county')}
                    placeholder="Greater London"
                    autoComplete="address-level1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    {...register('postcode')}
                    placeholder="SW1A 1AA"
                    autoComplete="postal-code"
                    className="uppercase"
                    onBlur={(e) => setValue('postcode', formatPostcode(e.target.value))}
                  />
                  {errors.postcode && (
                    <p className="text-xs text-destructive">{errors.postcode.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? 'Update Address' : 'Save Address'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {fetchLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium mb-1">No addresses saved</p>
            <p className="text-sm text-muted-foreground">Add an address for faster checkout.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={addr.is_default ? 'border-primary' : undefined}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{addr.label}</span>
                    {addr.is_default && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        <Star className="h-3 w-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(addr)}
                      className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Delete address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <address className="not-italic text-sm text-muted-foreground space-y-0.5">
                  <p className="font-medium text-foreground">{addr.full_name}</p>
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>{addr.city}{addr.county ? `, ${addr.county}` : ''}</p>
                  <p>{addr.postcode}</p>
                </address>
                {!addr.is_default && (
                  <button
                    onClick={() => setDefault(addr.id)}
                    className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Set as default
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
