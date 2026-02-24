"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"
import { AUTH_CALLBACK_COOKIE } from "@/lib/auth-callback"
import { authClient } from "@/lib/auth-client"

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

function getSignInErrorMessage(message?: string) {
  if (!message) {
    return "Invalid email or password. Please check your credentials and try again."
  }

  const normalized = message.toLowerCase()

  if (normalized.includes("too many")) {
    return "Too many login attempts. Please try again later."
  }

  if (normalized.includes("email not verified")) {
    return "Please verify your email before signing in."
  }

  if (normalized.includes("account not linked")) {
    return "This email is already linked to another sign-in method."
  }

  if (normalized.includes("not enabled") || normalized.includes("configuration")) {
    return "Authentication service is not properly configured. Please contact support."
  }

  return message
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

function getCookieItem(key: string) {
  if (typeof document === "undefined") return null
  const encodedKey = `${encodeURIComponent(key)}=`
  const cookieEntry = document.cookie.split("; ").find((entry) => entry.startsWith(encodedKey))
  if (!cookieEntry) return null
  const rawValue = cookieEntry.slice(encodedKey.length)
  try {
    return decodeURIComponent(rawValue)
  } catch {
    return rawValue
  }
}

function setCookieItem(key: string, value: string, maxAgeSeconds: number) {
  if (typeof window === "undefined") return
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`
}

function removeCookieItem(key: string) {
  if (typeof window === "undefined") return
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${encodeURIComponent(key)}=; Path=/; Max-Age=0; SameSite=Lax${secure}`
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

function sanitizeCallbackUrl(rawCallbackUrl: string | null | undefined, fallback = "/apps/dashboard") {
  if (!rawCallbackUrl) return fallback
  const trimmed = rawCallbackUrl.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback
  if (trimmed.startsWith("/auth") || trimmed.startsWith("/api/auth")) return fallback
  return trimmed
}

export function SignInForm({
  callbackUrl = "/apps/dashboard",
  googleEnabled = false,
  githubEnabled = false,
}: SignInFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending } = authClient.useSession()
  const status = isPending ? "loading" : session ? "authenticated" : "unauthenticated"
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
    const callbackFromCookie = getCookieItem(AUTH_CALLBACK_COOKIE)
    const rawCallbackUrl = callbackFromCookie || searchParams.get("callbackUrl") || callbackUrl
    return sanitizeCallbackUrl(rawCallbackUrl, "/apps/dashboard")
  }, [callbackUrl, searchParams])

  useEffect(() => {
    const callbackFromQuery = searchParams.get("callbackUrl")
    if (!callbackFromQuery) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete("callbackUrl")
    const cleanUrl = params.size > 0 ? `/auth/signin?${params.toString()}` : "/auth/signin"
    router.replace(cleanUrl)
  }, [router, searchParams])

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
      removeCookieItem(AUTH_CALLBACK_COOKIE)
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
      setCookieItem(AUTH_CALLBACK_COOKIE, resolvedCallbackUrl, 10 * 60)
      const { data, error: signInError } = await authClient.signIn.email({
        email: normalizedEmail,
        password,
        rememberMe,
        callbackURL: resolvedCallbackUrl,
      })

      if (signInError) {
        const errorMessage = getSignInErrorMessage(signInError.message)
        
        setError(errorMessage)
        toast.error(errorMessage)
        setIsLoading(false)
      } else if (data) {
        persistRememberPreferences(rememberMe, normalizedEmail)
        persistLastUsed("credentials")
        if (data.redirect && data.url) {
          window.location.href = data.url
          return
        }
        removeCookieItem(AUTH_CALLBACK_COOKIE)
        toast.success("Signed in successfully")
        router.replace(data.url || resolvedCallbackUrl)
        router.refresh()
      } else {
        const fallbackError = "Sign in did not complete. Please try again."
        setError(fallbackError)
        toast.error(fallbackError)
        setIsLoading(false)
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
      setCookieItem(AUTH_CALLBACK_COOKIE, resolvedCallbackUrl, 10 * 60)
      const { data, error: signInError } = await authClient.signIn.social({
        provider,
        callbackURL: resolvedCallbackUrl,
        disableRedirect: true,
      })

      if (signInError) {
        throw signInError
      }

      if (!data?.url) {
        throw new Error("Missing OAuth redirect URL")
      }

      persistLastUsed(provider)
      window.location.href = data.url
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
