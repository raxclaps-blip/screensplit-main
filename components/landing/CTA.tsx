"use client"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowRight, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  const { status } = useSession()
  const isAuthenticated = status === "authenticated"
  return (
    <section className="relative border-t border-border bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/50 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_80%_at_50%_10%,black,transparent)] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.10),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-6 py-24 border-l border-r border-border">
        <div className="text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Ready to get started?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            {isAuthenticated ? "Continue creating amazing comparisons" : "Sign up to create your first before & after image in seconds"}
          </p>
          {isAuthenticated ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/apps/screensplit">
                <Button size="lg" className="gap-2 rounded-full text-base shadow-sm shadow-primary/10">
                  Open Screensplit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/apps/videosplit">
                <Button size="lg" variant="outline" className="gap-2 rounded-full text-base">
                  Open Videosplit
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2 rounded-full text-base shadow-sm shadow-primary/10">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="gap-2 rounded-full text-base">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
