import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Target,
  Heart,
  Zap,
  Users,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { cacheLife } from "next/cache";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Screensplit's mission to make visual comparisons effortless. Built for creators, by creators. Privacy-first, simple, and always free.",
  openGraph: {
    title: "About Screensplit",
    description: "Learn about our mission to make visual comparisons effortless. Built for creators, by creators.",
  },
  twitter: {
    title: "About Screensplit",
    description: "Learn about our mission to make visual comparisons effortless. Built for creators, by creators.",
  },
};

export default async function AboutPage() {
  "use cache"
  cacheLife("max")

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navbar />

        {/* Hero Section */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span>Built for creators, by creators</span>
              </div>
              <h1 className="mb-6 max-w-4xl mx-auto text-balance text-5xl font-bold leading-tight tracking-tight md:text-7xl">
                Making visual comparisons effortless
              </h1>
              <p className="mb-10 max-w-2xl mx-auto text-pretty text-lg text-muted-foreground md:text-xl">
                We believe that showcasing change should be simple, beautiful,
                and accessible to everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section - Bento Grid */}
        <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
          <div className="grid gap-4 md:grid-cols-6 md:grid-rows-3">
            {/* Large mission card */}
            <div className="rounded-2xl border border-border bg-card p-8 md:col-span-4 md:row-span-2">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="mb-4 text-3xl font-bold">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Screensplit was born from a simple frustration: creating before
                & after comparisons was unnecessarily complicated. Existing
                tools required uploads, accounts, subscriptions, or complex
                software installations.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We set out to build something different—a tool that respects
                your privacy, works instantly in your browser, and delivers
                professional results without the hassle. No signups, no uploads,
                no compromises.
              </p>
              <p className="text-foreground font-medium">
                Our mission is to empower creators with tools that are as simple
                as they are powerful.
              </p>
            </div>

            {/* Stats card */}
            <div className="rounded-2xl border border-border bg-card p-6 md:col-span-2 md:row-span-1">
              <div className="mb-3 text-4xl font-bold">10K+</div>
              <p className="text-muted-foreground text-sm">
                Images created by designers, marketers, and creators worldwide
              </p>
            </div>

            {/* Stats card */}
            <div className="rounded-2xl border border-border bg-card p-6 md:col-span-2 md:row-span-1">
              <div className="mb-3 text-4xl font-bold">100%</div>
              <p className="text-muted-foreground text-sm">
                Client-side processing means your data never leaves your device
              </p>
            </div>

            {/* Vision card */}
            <div className="rounded-2xl border border-border bg-card p-6 md:col-span-3 md:row-span-1">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Our Vision</h3>
              <p className="text-muted-foreground text-sm">
                To become the go-to tool for visual comparisons, trusted by
                millions of creators who value simplicity, privacy, and quality.
              </p>
            </div>

            {/* Speed card */}
            <div className="rounded-2xl border border-border bg-card p-6 md:col-span-3 md:row-span-1">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground text-sm">
                Average processing time of 5 seconds from upload to export. No
                waiting, no loading bars, just results.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
          <div>
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                Our Values
              </h2>
              <p className="text-lg text-muted-foreground">
                The principles that guide everything we build
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Value card with nested content */}
              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
                  <Shield className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold">Privacy First</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Your images are yours alone. We built Screensplit to process
                  everything locally in your browser, ensuring your work never
                  touches our servers.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="mb-1 font-medium text-sm">No Uploads</div>
                    <p className="text-xs text-muted-foreground">
                      Files stay on your device
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="mb-1 font-medium text-sm">No Tracking</div>
                    <p className="text-xs text-muted-foreground">
                      We don't monitor usage
                    </p>
                  </div>
                </div>
              </div>

              {/* Value card with nested content */}
              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
                  <Zap className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold">Simplicity</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Great tools shouldn't require a manual. We obsess over making
                  Screensplit intuitive, so you can focus on creating rather
                  than learning.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="mb-1 font-medium text-sm">No Signup</div>
                    <p className="text-xs text-muted-foreground">
                      Start creating instantly
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="mb-1 font-medium text-sm">Clean UI</div>
                    <p className="text-xs text-muted-foreground">
                      Distraction-free design
                    </p>
                  </div>
                </div>
              </div>

              {/* Value card with nested content */}
              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
                  <Heart className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold">Quality</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  We believe free tools can still be premium. Every pixel,
                  interaction, and export is crafted to meet professional
                  standards.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="mb-1 font-medium text-sm">
                      High Resolution
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Export at full quality
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="mb-1 font-medium text-sm">Polished UX</div>
                    <p className="text-xs text-muted-foreground">
                      Smooth interactions
                    </p>
                  </div>
                </div>
              </div>

              {/* Value card with nested content */}
              <div className="rounded-2xl border border-border bg-card p-8">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold">Accessibility</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Powerful tools shouldn't be locked behind paywalls.
                  Screensplit is free for everyone, from students to
                  professionals.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="mb-1 font-medium text-sm">Always Free</div>
                    <p className="text-xs text-muted-foreground">
                      No hidden costs
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="mb-1 font-medium text-sm">No Limits</div>
                    <p className="text-xs text-muted-foreground">
                      Unlimited exports
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Screensplit started as a weekend project in early 2024. As
                  designers ourselves, we were frustrated with the existing
                  solutions for creating before & after comparisons.
                </p>
                <p>
                  Most tools required uploading sensitive client work to unknown
                  servers, creating accounts, or paying for subscriptions.
                  Others were desktop applications that felt outdated and
                  clunky.
                </p>
                <p>
                  We knew there had to be a better way. With modern web
                  technologies, we could build a tool that processes everything
                  locally, respects privacy, and delivers professional
                  results—all for free.
                </p>
                <p>
                  What started as a simple prototype quickly gained traction.
                  Designers, marketers, and developers around the world began
                  using Screensplit daily. Their feedback helped us refine the
                  tool into what it is today.
                </p>
                <p className="text-foreground font-medium">
                  Today, Screensplit has helped create over 10,000 before &
                  after comparisons, and we're just getting started.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/50 p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm font-bold">
                    01
                  </div>
                  <div>
                    <div className="mb-1 font-semibold">The Problem</div>
                    <p className="text-sm text-muted-foreground">
                      Existing tools were complicated, required uploads, or cost
                      money
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm font-bold">
                    02
                  </div>
                  <div>
                    <div className="mb-1 font-semibold">The Solution</div>
                    <p className="text-sm text-muted-foreground">
                      Build a privacy-first, browser-based tool that's free and
                      instant
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm font-bold">
                    03
                  </div>
                  <div>
                    <div className="mb-1 font-semibold">The Result</div>
                    <p className="text-sm text-muted-foreground">
                      10K+ images created by creators who value simplicity and
                      privacy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
          <div>
            <div className="text-center">
              <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                Ready to create?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Join thousands of creators using Screensplit
              </p>
              <Link href="/app">
                <Button size="lg" className="gap-2 rounded-full text-base">
                  Launch Screensplit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

      <Footer />
    </div>
  );
}
