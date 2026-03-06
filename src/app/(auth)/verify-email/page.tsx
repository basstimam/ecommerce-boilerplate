'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const errorParam = searchParams.get('error')

  const [countdown, setCountdown] = useState(3)
  const isError = !!errorParam || !token

  useEffect(() => {
    if (isError) return

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isError, router])

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="rounded-full bg-destructive/10 p-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Verification failed</h2>
              <p className="text-sm text-muted-foreground">
                {errorParam === 'expired'
                  ? 'This verification link has expired. Please request a new one.'
                  : errorParam === 'used'
                    ? 'This verification link has already been used.'
                    : 'This verification link is invalid. Please try signing up again.'}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/register">Back to sign up</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="rounded-full bg-green-500/10 p-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Email verified!</h2>
            <p className="text-sm text-muted-foreground">
              Your email address has been verified successfully. Welcome aboard!
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Redirecting in {countdown}…</span>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to homepage now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
