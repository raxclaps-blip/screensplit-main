"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Clock3, MailCheck, ShieldCheck, Sparkles } from "lucide-react"
import { toast } from "sonner"
import Logo from "@/components/common/Logo"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
    toast("Sending reset link...", { description: "Please wait" })

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to send reset email")
        toast.error(data.error || "Failed to send reset email")
        return
      }

      setSuccess("If an account exists with this email, you will receive a password reset link shortly.")
      toast.success("If an account exists, a password reset link has been sent")
    } catch {
      setError("An error occurred. Please try again.")
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_70%_at_100%_0%,rgba(56,189,248,0.14),transparent_58%),radial-gradient(90%_60%_at_0%_100%,rgba(16,185,129,0.12),transparent_60%)]" />
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1.25fr_0.9fr]">
        <section className="relative flex flex-col justify-between border-border/60 px-6 py-8 sm:px-10 lg:border-r lg:px-14 lg:py-12">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="text-sm font-semibold tracking-wide">Screensplit</p>
              <p className="text-xs text-muted-foreground">Account Recovery</p>
            </div>
          </div>

          <div className="my-10 max-w-xl space-y-6 lg:my-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Recover access in minutes
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Securely reset your password and get back to work.
            </h1>
            <p className="max-w-lg text-base text-muted-foreground">
              We&apos;ll email a reset link if your account exists. No account details are exposed during this process.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <MailCheck className="mb-2 h-4 w-4 text-sky-500" />
                <p className="text-sm font-medium">Email-based Recovery</p>
                <p className="text-xs text-muted-foreground">One-time reset links sent securely.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <ShieldCheck className="mb-2 h-4 w-4 text-emerald-500" />
                <p className="text-sm font-medium">Protected Flow</p>
                <p className="text-xs text-muted-foreground">Rate limited and origin-validated endpoints.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <Clock3 className="mb-2 h-4 w-4 text-violet-500" />
                <p className="text-sm font-medium">Fast Return</p>
                <p className="text-xs text-muted-foreground">Quickly resume where you left off.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Remembered your password?{" "}
            <Link href="/auth/signin" className="font-medium text-foreground hover:underline">
              Back to sign in
            </Link>
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-8 sm:px-10 lg:px-12">
          <div className="w-full max-w-md space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Forgot password</h2>
              <p className="text-sm text-muted-foreground">
                Enter your email and we&apos;ll send a reset link.
              </p>
            </div>

            <Card className="w-full border-border/60 bg-background/95 shadow-xl backdrop-blur-sm">
              <CardHeader className="space-y-2 pb-3">
                <CardTitle className="text-2xl">Reset access</CardTitle>
                <CardDescription>
                  Use the email tied to your account.
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
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                      disabled={isLoading || !!success}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !!success}
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Sign In
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
