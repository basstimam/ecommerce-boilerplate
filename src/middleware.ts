import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import type { Database, UserRole } from '@/types/database.types'

const PROTECTED_ROUTES = ['/account', '/checkout', '/wishlist']
const ADMIN_ROUTES = ['/admin']
const AUTH_ONLY_ROUTES = ['/login', '/register', '/forgot-password']

const RATE_LIMITED_ROUTES: { pattern: RegExp; windowMs: number; limit: number }[] = [
  { pattern: /^\/(login|register|forgot-password|reset-password)$/, windowMs: 15 * 60 * 1000, limit: 5 },
  { pattern: /^\/api\/newsletter\/subscribe$/, windowMs: 60 * 1000, limit: 3 },
  { pattern: /^\/api\/shipping\/calculate$/, windowMs: 60 * 1000, limit: 20 },
]

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isProtected(pathname: string) {
  return PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

function isAdminRoute(pathname: string) {
  return ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

function isAuthOnly(pathname: string) {
  return AUTH_ONLY_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

function checkRateLimit(ip: string, pathname: string): boolean {
  const rule = RATE_LIMITED_ROUTES.find((r) => r.pattern.test(pathname))
  if (!rule) return false

  const key = `${ip}:${pathname}`
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + rule.windowMs })
    return false
  }

  entry.count += 1
  if (entry.count > rule.limit) return true

  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (checkRateLimit(ip, pathname)) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': '60' },
    })
  }

  const { supabaseResponse, user } = await updateSession(request)

  if (isAuthOnly(pathname) && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/account'
    return NextResponse.redirect(url)
  }

  if (isProtected(pathname) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (isAdminRoute(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const profile = profileData as { role: UserRole } | null

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
