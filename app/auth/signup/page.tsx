import { Suspense } from "react"
import { SignUpForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { ChartNoAxesCombined, ShieldCheck, Sparkles } from "lucide-react"
import Logo from "@/components/common/Logo"

export default async function SignUpPage() {
  // Redirect if already authenticated
  const user = await getCurrentUser()
  if (user) {
    redirect("/apps/screensplit")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_70%_at_100%_0%,rgba(16,185,129,0.14),transparent_58%),radial-gradient(90%_60%_at_0%_100%,rgba(56,189,248,0.12),transparent_60%)]" />
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
              Build polished before/after visuals faster
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Create your account and launch your visual workspace.
            </h1>
            <p className="max-w-lg text-base text-muted-foreground">
              Store projects, share secure links, and produce client-ready comparison assets with a reliable workflow.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <ShieldCheck className="mb-2 h-4 w-4 text-emerald-500" />
                <p className="text-sm font-medium">Secure by Default</p>
                <p className="text-xs text-muted-foreground">Protected routes and hardened auth flows.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <ChartNoAxesCombined className="mb-2 h-4 w-4 text-sky-500" />
                <p className="text-sm font-medium">Trackable Output</p>
                <p className="text-xs text-muted-foreground">Keep your assets and workflow organized.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/70 p-3">
                <Sparkles className="mb-2 h-4 w-4 text-violet-500" />
                <p className="text-sm font-medium">Client Ready</p>
                <p className="text-xs text-muted-foreground">Create share-ready comparisons in minutes.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-8 sm:px-10 lg:px-12">
          <div className="w-full max-w-md space-y-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Create account</h2>
              <p className="text-sm text-muted-foreground">
                Enter your details to start using Screensplit.
              </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <SignUpForm />
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
