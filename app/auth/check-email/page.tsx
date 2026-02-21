"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") || ""

  const [email, setEmail] = useState(initialEmail)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null)

  async function resend() {
    if (!email) {
      setError("Email is required to resend.")
      return
    }
    setResending(true)
    setMessage("")
    setError("")
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (data?.devVerificationUrl) setDevVerificationUrl(data.devVerificationUrl)
      if (res.ok) {
        setMessage("Verification email sent. Please check your inbox.")
        toast.success("Verification email sent")
      } else {
        setError(data?.error || "Failed to resend verification email. Try again later.")
        toast.error(data?.error || "Failed to resend verification email. Try again later.")
      }
    } catch (e) {
      setError("Failed to resend verification email. Try again later.")
      toast.error("Failed to resend verification email. Try again later.")
    } finally {
      setResending(false)
    }
  }

  useEffect(() => {
    if (!email && initialEmail) setEmail(initialEmail)
  }, [initialEmail, email])

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Account created successfully!</CardTitle>
          <CardDescription>
            Please check your email to verify your account before signing in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button onClick={resend} disabled={resending || !email} className="w-full">
              {resending ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>
            {!email && (
              <p className="text-xs text-muted-foreground text-center">
                No email in URL. Return to signup and try again.
              </p>
            )}
          </div>

          {devVerificationUrl && (
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href={devVerificationUrl}>Open verification link (dev)</Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Dev-only shortcut shown while running locally.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Button asChild variant="secondary">
              <Link href="/auth/signin">Proceed to login</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/auth/signup">Use a different email</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmailContent />
    </Suspense>
  )
}
