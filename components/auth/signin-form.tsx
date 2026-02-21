"use client"

import { useEffect, useMemo, useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"

interface SignInFormProps {
  callbackUrl?: string
}

type LastUsedMethod = "credentials" | "google"

const STORAGE_KEYS = {
  rememberMe: "screensplit.auth.remember_me",
  lastUsedMethod: "screensplit.auth.last_used_method",
  lastUsedAt: "screensplit.auth.last_used_at",
  savedEmail: "screensplit.auth.saved_email",
} as const

function getSignInErrorMessage(error?: string, code?: string) {
  if (code === "rate_limited") {
    return "Too many login attempts. Please try again later."
  }

  if (code === "email_not_verified") {
    return "Please verify your email before signing in."
  }

  if (code === "auth_unavailable") {
    return "Authentication service is temporarily unavailable. Please try again."
  }

  if (error === "OAuthAccountNotLinked") {
    return "This email is already linked to another sign-in method."
  }

  if (error === "Configuration") {
    return "Authentication service is not properly configured. Please contact support."
  }

  return "Invalid email or password. Please check your credentials and try again."
}

function getStorageItem(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function setStorageItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {}
}

function removeStorageItem(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {}
}

function formatLastUsedTime(timestamp?: number | null) {
  if (!timestamp) return ""
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString()
}

export function SignInForm({ callbackUrl = "/apps/screensplit" }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [lastUsedMethod, setLastUsedMethod] = useState<LastUsedMethod | null>(null)
  const [lastUsedAt, setLastUsedAt] = useState<number | null>(null)
  const [savedEmail, setSavedEmail] = useState("")
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false)

  useEffect(() => {
    const savedRememberMe = getStorageItem(STORAGE_KEYS.rememberMe) === "1"
    const savedEmail = getStorageItem(STORAGE_KEYS.savedEmail) || ""
    const savedMethod = getStorageItem(STORAGE_KEYS.lastUsedMethod)
    const savedLastUsedAt = Number(getStorageItem(STORAGE_KEYS.lastUsedAt) || "")

    setRememberMe(savedRememberMe)
    setSavedEmail(savedEmail)
    setEmail(savedRememberMe ? savedEmail : "")
    setLastUsedMethod(savedMethod === "credentials" || savedMethod === "google" ? savedMethod : null)
    setLastUsedAt(Number.isFinite(savedLastUsedAt) ? savedLastUsedAt : null)
    setHasHydratedStorage(true)
  }, [])

  const lastUsedMessage = useMemo(() => {
    if (!lastUsedMethod) return ""
    const methodLabel = lastUsedMethod === "google" ? "Google" : "Email and password"
    const identifier = lastUsedMethod === "credentials" && savedEmail ? ` (${savedEmail})` : ""
    const when = formatLastUsedTime(lastUsedAt)
    return when ? `Last used: ${methodLabel}${identifier} (${when})` : `Last used: ${methodLabel}${identifier}`
  }, [lastUsedAt, lastUsedMethod, savedEmail])

  function persistRememberPreferences(nextRememberMe: boolean, nextEmail: string) {
    setStorageItem(STORAGE_KEYS.rememberMe, nextRememberMe ? "1" : "0")

    if (nextRememberMe && nextEmail) {
      setStorageItem(STORAGE_KEYS.savedEmail, nextEmail)
      setSavedEmail(nextEmail)
    } else {
      removeStorageItem(STORAGE_KEYS.savedEmail)
      setSavedEmail("")
    }
  }

  function persistLastUsed(method: LastUsedMethod) {
    const now = Date.now()
    setStorageItem(STORAGE_KEYS.lastUsedMethod, method)
    setStorageItem(STORAGE_KEYS.lastUsedAt, String(now))
    setLastUsedMethod(method)
    setLastUsedAt(now)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const normalizedEmail = (email || (formData.get("email") as string)).toLowerCase().trim()
    const password = formData.get("password") as string

    try {
      toast("Signing in...", { description: "Please wait" })
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        remember: rememberMe ? "true" : "false",
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        const errorMessage = getSignInErrorMessage(result.error, result.code)
        
        setError(errorMessage)
        toast.error(errorMessage)
        setIsLoading(false)
      } else if (result?.ok) {
        persistRememberPreferences(rememberMe, normalizedEmail)
        persistLastUsed("credentials")
        toast.success("Signed in successfully")
        // Use window.location for full page reload to ensure session is properly loaded
        window.location.href = callbackUrl
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
      toast.error("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  async function signInWithGoogle() {
    setIsGoogleLoading(true)
    try {
      toast("Redirecting to Google...")
      persistLastUsed("google")
      await signIn("google", { callbackUrl })
    } catch (error) {
      setError("Failed to sign in with Google")
      toast.error("Failed to sign in with Google")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className="w-full border-border/60 bg-background/95 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-2 pb-3">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to continue to your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasHydratedStorage && lastUsedMessage && (
          <div className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {lastUsedMessage}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          variant="outline"
          onClick={signInWithGoogle}
          disabled={isGoogleLoading || isLoading}
          className="w-full"
        >
          {isGoogleLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
                disabled={isLoading}
              />
              Remember me
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="pt-1 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
