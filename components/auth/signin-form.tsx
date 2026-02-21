"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
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
  googleEnabled?: boolean
  githubEnabled?: boolean
}

type OAuthProvider = "google" | "github"
type LastUsedMethod = "credentials" | OAuthProvider

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

export function SignInForm({
  callbackUrl = "/apps/screensplit",
  googleEnabled = false,
  githubEnabled = false,
}: SignInFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoadingProvider, setOauthLoadingProvider] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [lastUsedMethod, setLastUsedMethod] = useState<LastUsedMethod | null>(null)
  const [lastUsedAt, setLastUsedAt] = useState<number | null>(null)
  const [savedEmail, setSavedEmail] = useState("")
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false)

  const resolvedCallbackUrl = useMemo(() => {
    const rawCallbackUrl = searchParams.get("callbackUrl") || callbackUrl
    return rawCallbackUrl.startsWith("/") ? rawCallbackUrl : "/apps/screensplit"
  }, [callbackUrl, searchParams])

  useEffect(() => {
    const savedRememberMe = getStorageItem(STORAGE_KEYS.rememberMe) === "1"
    const savedEmail = getStorageItem(STORAGE_KEYS.savedEmail) || ""
    const savedMethod = getStorageItem(STORAGE_KEYS.lastUsedMethod)
    const savedLastUsedAt = Number(getStorageItem(STORAGE_KEYS.lastUsedAt) || "")

    setRememberMe(savedRememberMe)
    setSavedEmail(savedEmail)
    setEmail(savedRememberMe ? savedEmail : "")
    setLastUsedMethod(
      savedMethod === "credentials" || savedMethod === "google" || savedMethod === "github"
        ? savedMethod
        : null
    )
    setLastUsedAt(Number.isFinite(savedLastUsedAt) ? savedLastUsedAt : null)
    setHasHydratedStorage(true)
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(resolvedCallbackUrl)
    }
  }, [resolvedCallbackUrl, router, status])

  const lastUsedMessage = useMemo(() => {
    if (!lastUsedMethod) return ""
    const methodLabel =
      lastUsedMethod === "google"
        ? "Google"
        : lastUsedMethod === "github"
          ? "GitHub"
          : "Email and password"
    const identifier = lastUsedMethod === "credentials" && savedEmail ? ` (${savedEmail})` : ""
    const when = formatLastUsedTime(lastUsedAt)
    return when ? `Last used: ${methodLabel}${identifier} (${when})` : `Last used: ${methodLabel}${identifier}`
  }, [lastUsedAt, lastUsedMethod, savedEmail])
  const hasOAuthProviders = googleEnabled || githubEnabled

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
        callbackUrl: resolvedCallbackUrl,
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
        router.replace(resolvedCallbackUrl)
        router.refresh()
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
      toast.error("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  async function signInWithOAuth(provider: OAuthProvider) {
    if ((provider === "google" && !googleEnabled) || (provider === "github" && !githubEnabled)) {
      return
    }
    setOauthLoadingProvider(provider)
    try {
      const providerLabel = provider === "google" ? "Google" : "GitHub"
      toast(`Redirecting to ${providerLabel}...`)
      persistLastUsed(provider)
      await signIn(provider, { callbackUrl: resolvedCallbackUrl })
    } catch {
      const providerLabel = provider === "google" ? "Google" : "GitHub"
      setError(`Failed to sign in with ${providerLabel}`)
      toast.error(`Failed to sign in with ${providerLabel}`)
    } finally {
      setOauthLoadingProvider(null)
    }
  }

  return (
    <Card className="w-full overflow-hidden rounded-2xl border border-border/60 bg-background/92 shadow-[0_16px_50px_-34px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="h-0.5 w-full bg-gradient-to-r from-sky-500/70 via-emerald-400/65 to-cyan-500/70" />
      <CardHeader className="space-y-1 pb-2 pt-4">
        <CardTitle className="text-xl tracking-tight">Sign in</CardTitle>
        <CardDescription>
          Choose a sign-in method.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        {hasHydratedStorage && lastUsedMessage && (
          <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
            {lastUsedMessage}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasOAuthProviders && (
          <>
            <div className={`grid gap-2 ${googleEnabled && githubEnabled ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
              {googleEnabled && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signInWithOAuth("google")}
                  disabled={oauthLoadingProvider !== null || isLoading}
                  className="h-10 w-full justify-start rounded-lg border-border/70 bg-background/70 px-3 text-sm font-medium hover:bg-muted/45"
                >
                  {oauthLoadingProvider === "google" ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.google className="mr-2 h-4 w-4" />
                  )}
                  Google
                </Button>
              )}
              {githubEnabled && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signInWithOAuth("github")}
                  disabled={oauthLoadingProvider !== null || isLoading}
                  className="h-10 w-full justify-start rounded-lg border-border/70 bg-background/70 px-3 text-sm font-medium hover:bg-muted/45"
                >
                  {oauthLoadingProvider === "github" ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.github className="mr-2 h-4 w-4" />
                  )}
                  GitHub
                </Button>
              )}
            </div>

            <div className="relative py-0.5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 tracking-[0.14em] text-muted-foreground">
                  Email
                </span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
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
              className="mt-1 h-10 rounded-lg border-border/70 bg-background/70"
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
              className="mt-1 h-10 rounded-lg border-border/70 bg-background/70"
            />
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
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
              className="font-medium text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            className="h-10 w-full rounded-lg shadow-sm"
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
          Need an account?{" "}
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
