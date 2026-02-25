"use client"

import { Suspense, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import useSWR from "swr"

type VerifyEmailResponse = {
  error?: string
}

const verifyEmailFetcher = async ([url, token]: readonly [string, string]) => {
  const response = await fetch(`${url}?token=${encodeURIComponent(token)}`)
  const data = (await response.json().catch(() => ({}))) as VerifyEmailResponse

  if (!response.ok) {
    throw new Error(data.error || "Failed to verify email")
  }
}

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const handledStatusRef = useRef<"success" | "error" | null>(null)
  const { error, isLoading } = useSWR(
    token ? ["/api/auth/verify-email", token] : null,
    verifyEmailFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  )

  const status: "loading" | "success" | "error" = !token
    ? "error"
    : isLoading
      ? "loading"
      : error
        ? "error"
        : "success"
  const message = !token
    ? "Invalid verification link"
    : error
      ? error.message || "Failed to verify email"
      : "Your email has been verified successfully!"

  useEffect(() => {
    if (status === "success" && handledStatusRef.current !== "success") {
      handledStatusRef.current = "success"
      toast.success("Email verified successfully")
      const timeoutId = window.setTimeout(() => {
        router.push("/auth/signin")
      }, 3000)

      return () => window.clearTimeout(timeoutId)
    }

    if (status === "error" && token && handledStatusRef.current !== "error") {
      handledStatusRef.current = "error"
      toast.error(message)
    }

    return undefined
  }, [message, router, status, token])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Verifying your email address..."}
            {status === "success" && "Email verified successfully"}
            {status === "error" && "Verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your email...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <Alert className="border-green-500">
                <AlertDescription className="text-center">
                  {message}
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground text-center">
                Redirecting you to sign in...
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/signin">Sign In Now</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <Alert variant="destructive">
                <AlertDescription className="text-center">
                  {message}
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2 w-full">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/signup">Create New Account</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/signin">Back to Sign In</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
