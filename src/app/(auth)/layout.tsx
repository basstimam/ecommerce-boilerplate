import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
      >
        <ShoppingBag className="h-7 w-7" />
        <span className="text-xl font-bold tracking-tight">
          {process.env.NEXT_PUBLIC_STORE_NAME ?? 'UK Store'}
        </span>
      </Link>

      <div className="w-full max-w-sm">{children}</div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()}{' '}
        {process.env.NEXT_PUBLIC_STORE_NAME ?? 'UK Store'}. All rights reserved.
      </p>
    </div>
  )
}
