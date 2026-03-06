'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types/database.types'

export async function signIn(data: {
  email: string
  password: string
  redirect?: string
}): Promise<{ error?: string; redirectTo?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: 'Invalid email or password' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Invalid email or password' }
  }

  revalidatePath('/', 'layout')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const profile = profileData as { role: UserRole } | null

  if (profile?.role === 'admin' || profile?.role === 'super_admin') {
    return { redirectTo: '/admin' }
  }

  return { redirectTo: data.redirect || '/account' }
}

export async function signUp(data: {
  email: string
  password: string
  full_name: string
  marketing_consent: boolean
}): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { full_name: data.full_name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: 'Unable to create account. Please try again.' }
  }

  if (authData.user && data.marketing_consent) {
    await supabase
      .from('profiles')
      .update({
        marketing_consent: true,
        marketing_consent_at: new Date().toISOString(),
      })
      .eq('id', authData.user.id)
  }

  return {}
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function sendPasswordReset(data: {
  email: string
}): Promise<{ success: boolean }> {
  const supabase = await createClient()

  await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  })

  // Always return success — never reveal whether email exists
  return { success: true }
}

export async function updatePassword(data: {
  password: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: data.password,
  })

  if (error) {
    return { error: 'Unable to update password. The link may have expired.' }
  }

  return {}
}

export async function resendVerification(
  email: string
): Promise<{ success: boolean }> {
  const supabase = await createClient()

  await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  return { success: true }
}
