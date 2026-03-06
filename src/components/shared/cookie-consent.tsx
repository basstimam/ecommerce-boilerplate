'use client'

import Link from 'next/link'
import { Cookie } from 'lucide-react'
import { useCookieConsent } from '@/hooks/use-cookie-consent'
import { Button } from '@/components/ui/button'

export function CookieConsent() {
  const { hasPending, accept, reject } = useCookieConsent()

  if (!hasPending) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg md:bottom-4 md:left-4 md:right-auto md:max-w-sm md:rounded-lg md:border">
      <div className="flex items-start gap-3">
        <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium">We use cookies</p>
          <p className="text-xs text-muted-foreground">
            We use cookies to improve your experience and for analytics. See our{' '}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>{' '}
            for details.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={accept} className="flex-1">
              Accept all
            </Button>
            <Button size="sm" variant="outline" onClick={reject} className="flex-1">
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
