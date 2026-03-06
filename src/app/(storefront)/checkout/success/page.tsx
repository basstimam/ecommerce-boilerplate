'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clearCart = useCartStore((s) => s.clearCart)

  const paymentIntentId = searchParams.get('payment_intent')
  const redirectStatus = searchParams.get('redirect_status')

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')

  useEffect(() => {
    if (!paymentIntentId) {
      router.replace('/')
      return
    }

    if (redirectStatus === 'succeeded') {
      clearCart()
      setStatus('success')
    } else if (redirectStatus === 'failed' || redirectStatus === 'canceled') {
      setStatus('failed')
    } else {
      setStatus('success')
    }
  }, [paymentIntentId, redirectStatus, clearCart, router])

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Confirming your order...</p>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <XCircle className="mb-4 h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Payment Failed</h1>
        <p className="mt-2 text-muted-foreground">
          Your payment could not be processed. No charge has been made.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild variant="outline">
            <Link href="/cart">Return to Cart</Link>
          </Button>
          <Button asChild>
            <Link href="/checkout">Try Again</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-24 text-center">
      <CheckCircle2 className="mb-4 h-16 w-16 text-green-600" />
      <h1 className="text-3xl font-bold">Order Confirmed!</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Thank you for your order. We&apos;ve received your payment and will send a confirmation
        email shortly.
      </p>

      {paymentIntentId && (
        <p className="mt-3 text-xs text-muted-foreground">
          Reference:{' '}
          <span className="font-mono">{paymentIntentId.slice(3, 15).toUpperCase()}</span>
        </p>
      )}

      <div className="mt-4 rounded-lg border bg-muted/40 p-4 text-left text-sm">
        <p className="font-semibold">What happens next?</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          <li>✉️ Confirmation email sent to your inbox</li>
          <li>📦 Your order is being picked and packed</li>
          <li>🚚 Delivery tracking sent once dispatched</li>
        </ul>
      </div>

      <div className="mt-8 flex gap-3">
        <Button asChild variant="outline">
          <Link href="/account/orders">View Orders</Link>
        </Button>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4">
      <Suspense
        fallback={
          <div className="flex flex-col items-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  )
}
