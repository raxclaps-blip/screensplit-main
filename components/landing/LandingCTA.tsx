import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LandingCTA() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-muted/35 p-8 text-center sm:p-10">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Build your next before-and-after in minutes.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Keep your process simple: upload, style, export, and share.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth/signup" className="inline-flex items-center gap-2">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/signin">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
