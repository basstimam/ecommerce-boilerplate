'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, AlertCircle, Clock } from 'lucide-react'
import { emailSchema } from '@/lib/utils/validation'
import { signIn } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

const MAX_ATTEMPTS = 5
const COOLDOWN_SECONDS = 15 * 60

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  })

  const isOnCooldown = cooldownEndsAt !== null && Date.now() < cooldownEndsAt

  useEffect(() => {
    if (!cooldownEndsAt) return
    const tick = () => {
      const remaining = Math.ceil((cooldownEndsAt - Date.now()) / 1000)
      if (remaining <= 0) {
        setSecondsLeft(0)
        setCooldownEndsAt(null)
        setFailedAttempts(0)
      } else {
        setSecondsLeft(remaining)
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [cooldownEndsAt])

  async function onSubmit(data: LoginFormData) {
    if (isOnCooldown) return
    setIsLoading(true)
    setServerError(null)
    try {
      const params = new URLSearchParams(window.location.search)
      const redirectParam = params.get('redirect') || undefined
      const result = await signIn({
        email: data.email,
        password: data.password,
        redirect: redirectParam,
      })
      if (result.error) {
        const next = failedAttempts + 1
        setFailedAttempts(next)
        if (next >= MAX_ATTEMPTS) {
          setCooldownEndsAt(Date.now() + COOLDOWN_SECONDS * 1000)
          setSecondsLeft(COOLDOWN_SECONDS)
        } else {
          setServerError(result.error)
        }
        setIsLoading(false)
      } else if (result.redirectTo) {
        router.replace(result.redirectTo)
      }
    } catch {
      setServerError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const formatCooldown = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Enter your email and password to access your account</CardDescription>
      </CardHeader>

      <CardContent>
        {isOnCooldown ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
            <Clock className="h-8 w-8 text-destructive" />
            <p className="font-semibold text-destructive">Too many failed attempts</p>
            <p className="text-sm text-muted-foreground">
              Please wait before trying again
            </p>
            <span className="text-3xl font-mono font-bold text-destructive">
              {formatCooldown(secondsLeft)}
            </span>
          </div>
        ) : (
          <Form {...form}>
            <form
              data-testid="login-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {serverError && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {failedAttempts > 0 && !serverError && (
                <p className="text-xs text-muted-foreground text-center">
                  {MAX_ATTEMPTS - failedAttempts} attempt{MAX_ATTEMPTS - failedAttempts !== 1 ? 's' : ''} remaining
                </p>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="email-input"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          data-testid="password-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isLoading}
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                data-testid="submit-button"
                type="submit"
                className="w-full"
                disabled={isLoading || isOnCooldown}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
