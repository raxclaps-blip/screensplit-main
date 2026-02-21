import { Suspense } from "react"
import { SignInForm } from "@/components/auth/signin-form"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { Clock3, ShieldCheck, Sparkles } from "lucide-react"
import Logo from "@/components/common/Logo"

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string
    error?: string
  }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  // Await searchParams before accessing its properties (Next.js 15+)
  const params = await searchParams
  
  // Redirect if already authenticated
  const user = await getCurrentUser()
  if (user) {
    redirect(params.callbackUrl || "/apps/screensplit")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_70%_at_100%_0%,rgba(115,133,255,0.16),transparent_58%),radial-gradient(90%_60%_at_0%_100%,rgba(16,185,129,0.12),transparent_60%)]" />
      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1.25fr_0.9fr]">
        <section className="relative flex flex-col justify-between border-border/60 px-6 py-8 sm:px-10 lg:border-r lg:px-14 lg:py-12">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="text-sm font-semibold tracking-wide">Screensplit</p>
              <p className="text-xs text-muted-foreground">Professional Visual Comparisons</p>
            </div>
          </div>

          <div className="my-10 max-w-xl space-y-6 lg:my-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Trusted by teams shipping visual results fast
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Sign in to your professional comparison workspace.
            </h1>
            <p className="max-w-lg text-base text-muted-foreground">
              Keep projects, exports, and client-ready comparisons in one secure place with fast, reliable access.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <ShieldCheck className="mb-2 h-4 w-4 text-emerald-500" />
                <p className="text-sm font-medium">Secure Access</p>
                <p className="text-xs text-muted-foreground">JWT sessions and protected routes.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <Clock3 className="mb-2 h-4 w-4 text-sky-500" />
                <p className="text-sm font-medium">Fast Sessions</p>
                <p className="text-xs text-muted-foreground">Optimized login for everyday work.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <Sparkles className="mb-2 h-4 w-4 text-violet-500" />
                <p className="text-sm font-medium">Polished Output</p>
                <p className="text-xs text-muted-foreground">Share-ready visuals in minutes.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Need an account?{" "}
            <Link href="/auth/signup" className="font-medium text-foreground hover:underline">
              Create one now
            </Link>
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-8 sm:px-10 lg:px-12">
          <div className="w-full max-w-md space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground">
                Use your preferred sign-in method to continue.
              </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <SignInForm callbackUrl={params.callbackUrl} />
            </Suspense>
            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
