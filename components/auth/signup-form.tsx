"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null)
  const [emailValue, setEmailValue] = useState<string>("")
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Store form reference before async operations
    const form = event.currentTarget
    const formData = new FormData(form)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    setEmailValue(email)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      toast("Creating account...", { description: "Please wait a moment" })
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('Failed to parse response:', jsonError)
        setError("Server error. Please try again.")
        return
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || "Registration failed"
        setError(errorMessage)
        toast.error(errorMessage)
        console.error('Registration error:', { status: response.status, data })
        return
      }

      setSuccess("Account created successfully! Please check your email to verify your account before signing in.")
      toast.success("Account created successfully!", { description: "Check your email to verify your account" })
      if (data?.devVerificationUrl) {
        setDevVerificationUrl(data.devVerificationUrl)
      } else {
        setDevVerificationUrl(null)
      }

      const params = new URLSearchParams({ email })
      if (data?.devVerificationUrl) {
        params.set("dev", data.devVerificationUrl)
      }
      router.push(`/auth/check-email?${params.toString()}`)
      
      // Clear form on success
      if (form) {
        form.reset()
      }
    } catch (error) {
      console.error('Unexpected registration error:', error)
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.")
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function signInWithGoogle() {
    setIsGoogleLoading(true)
    try {
      await signIn("google", { callbackUrl: "/apps/screensplit" })
    } catch (error) {
      setError("Failed to sign in with Google")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  async function resendVerification() {
    if (!emailValue) return
    setResending(true)
    setResendMessage("")
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue })
      })
      const data = await res.json()
      if (res.ok) {
        setResendMessage('Verification email sent successfully.')
        toast.success('Verification email sent successfully')
      } else {
        setResendMessage(data?.error || 'Failed to resend verification email.')
        toast.error(data?.error || 'Failed to resend verification email.')
      }
    } catch (e) {
      setResendMessage('Failed to resend verification email.')
      toast.error('Failed to resend verification email.')
    } finally {
      setResending(false)
    }
  }

  return (
    <Card className="w-full border-border/60 bg-background/95 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-2 pb-3">
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>
          Enter your information to create your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <>
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
            {devVerificationUrl && (
              <div className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <Link href={devVerificationUrl}>Open verification link (dev)</Link>
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <Button onClick={resendVerification} disabled={resending || !emailValue} className="w-full" variant="secondary">
                {resending ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </Button>
              {resendMessage && (
                <p className="text-xs text-muted-foreground text-center">{resendMessage}</p>
              )}
            </div>
          </>
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
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
              placeholder="Create a password (min. 8 characters)"
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
              placeholder="Confirm your password"
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
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <div className="pt-1 text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
