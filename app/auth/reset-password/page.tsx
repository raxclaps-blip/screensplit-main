"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"
import { Clock3, KeyRound, Loader2, ShieldCheck, Sparkles } from "lucide-react"
import Logo from "@/components/common/Logo"

function ResetPasswordCard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      setError("Invalid reset link")
      return
    }
    setToken(tokenParam)
  }, [searchParams])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    toast("Resetting password...", { description: "Please wait" })

    const formData = new FormData(event.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (!token) {
      setError("Invalid reset link")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to reset password")
        toast.error(data.error || "Failed to reset password")
        return
      }

      setSuccess(true)
      toast.success("Password reset successfully! Redirecting to sign in...")
      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)
    } catch {
      setError("An error occurred. Please try again.")
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token && !error) {
    return (
      <Card className="w-full border-border/60 bg-background/95 shadow-xl backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-border/60 bg-background/95 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-2 pb-3">
        <CardTitle className="text-2xl">Reset password</CardTitle>
        <CardDescription>
          Choose a strong new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>
              Password reset successfully! Redirecting to sign in...
            </AlertDescription>
          </Alert>
        )}

        {!success && token && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password (min. 8 characters)"
                autoComplete="new-password"
                required
                disabled={isLoading}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                autoComplete="new-password"
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        )}

        {!success && (
          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link
              href="/auth/signin"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        )}

        {success && (
          <Button asChild className="w-full">
            <Link href="/auth/signin">Sign in now</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function ResetPasswordContent() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_70%_at_100%_0%,rgba(99,102,241,0.14),transparent_58%),radial-gradient(90%_60%_at_0%_100%,rgba(56,189,248,0.12),transparent_60%)]" />
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1.25fr_0.9fr]">
        <section className="relative flex flex-col justify-between border-border/60 px-6 py-8 sm:px-10 lg:border-r lg:px-14 lg:py-12">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="text-sm font-semibold tracking-wide">Screensplit</p>
              <p className="text-xs text-muted-foreground">Password Reset</p>
            </div>
          </div>

          <div className="my-10 max-w-xl space-y-6 lg:my-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Secure account recovery flow
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Set a new password and restore full account access.
            </h1>
            <p className="max-w-lg text-base text-muted-foreground">
              This link can be used once and helps protect your account from unauthorized resets.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <KeyRound className="mb-2 h-4 w-4 text-sky-500" />
                <p className="text-sm font-medium">One-time Link</p>
                <p className="text-xs text-muted-foreground">Reset token is consumed after use.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <ShieldCheck className="mb-2 h-4 w-4 text-emerald-500" />
                <p className="text-sm font-medium">Hardened Security</p>
                <p className="text-xs text-muted-foreground">Strong hashing and auth safeguards.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <Clock3 className="mb-2 h-4 w-4 text-violet-500" />
                <p className="text-sm font-medium">Quick Recovery</p>
                <p className="text-xs text-muted-foreground">Back to your workflow in minutes.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Need a fresh reset email?{" "}
            <Link href="/auth/forgot-password" className="font-medium text-foreground hover:underline">
              Request a new link
            </Link>
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-8 sm:px-10 lg:px-12">
          <div className="w-full max-w-md space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Create a new password</h2>
              <p className="text-sm text-muted-foreground">
                Enter and confirm your new password below.
              </p>
            </div>
            <ResetPasswordCard />
          </div>
        </section>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
