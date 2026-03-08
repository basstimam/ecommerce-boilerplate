import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'
import { createClient } from '@/lib/supabase/server'

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { full_name: string | null } | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user ? { email: user.email ?? '', fullName: profile?.full_name } : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
