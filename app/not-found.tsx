import Link from "next/link"
import { Home, ArrowLeft, Search, Compass, Image, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/common/Navbar"
import { Footer } from "@/components/common/Footer"
import { cacheLife } from "next/cache"

export default async function NotFoundPage() {
  "use cache"
  cacheLife("max")

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Navbar />

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 py-24 md:py-32 border-l border-r border-border">
          <div className="text-center">
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="relative">
                <div className="text-[120px] md:text-[180px] font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent leading-none">
                  404
                </div>
                <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/10 animate-pulse" />
                <div className="absolute -left-8 -bottom-8 h-12 w-12 rounded-full bg-primary/5 animate-pulse delay-75" />
              </div>
            </div>
            <h1 className="mb-6 max-w-2xl mx-auto text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Oops! Page Not Found
            </h1>
            <p className="mb-10 max-w-xl mx-auto text-pretty text-lg text-muted-foreground">
              The page you're looking for seems to have wandered off. Let's get you back on track.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/">
                <Button size="lg" className="gap-2 rounded-full">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/apps">
                <Button size="lg" variant="outline" className="gap-2 rounded-full">
                  <Sparkles className="h-4 w-4" />
                  Try Screensplit
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Helpful Links - Bento Grid */}
        <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">Popular Destinations</h2>
            <p className="text-lg text-muted-foreground">Maybe you were looking for one of these?</p>
          </div>

          <div className="grid gap-4 md:grid-cols-6 md:grid-rows-2">
            {/* Large featured card */}
            <Link 
              href="/apps/screensplit" 
              className="group rounded-2xl border border-border bg-card p-8 md:col-span-3 md:row-span-2 hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-110 transition-transform">
                <Image className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-bold group-hover:text-primary transition-colors">Create Comparisons</h3>
              <p className="text-muted-foreground leading-relaxed">
                Start creating beautiful before & after image comparisons instantly. No signup required, completely free.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                Launch Screensplit
                <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Small cards */}
            <Link 
              href="/apps/videosplit" 
              className="group rounded-2xl border border-border bg-card p-6 md:col-span-3 md:row-span-1 hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors">Videosplit</h3>
              <p className="text-sm text-muted-foreground">Create video comparisons with the same ease</p>
            </Link>

            <Link 
              href="/apps/gallery" 
              className="group rounded-2xl border border-border bg-card p-6 md:col-span-2 md:row-span-1 hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors">Gallery</h3>
              <p className="text-sm text-muted-foreground">Browse community creations</p>
            </Link>

            <Link 
              href="/about" 
              className="group rounded-2xl border border-border bg-card p-6 md:col-span-1 md:row-span-1 hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
                <Compass className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold group-hover:text-primary transition-colors">About Us</h3>
              <p className="text-sm text-muted-foreground">Learn our story</p>
            </Link>
          </div>
        </section>

        {/* Search Suggestions */}
        <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
          <div className="rounded-2xl border border-border bg-card p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <h2 className="mb-4 text-3xl font-bold">Still Lost?</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  That's okay! Here are some tips to help you find what you're looking for:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span>Check the URL for typos or mistakes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span>Use the navigation menu to explore our features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span>Visit our homepage to start fresh</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span>Contact our support team if you need help</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="rounded-2xl border border-border bg-secondary/50 p-8 backdrop-blur">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Homepage</div>
                        <div className="text-sm text-muted-foreground">/</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Image className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Screensplit App</div>
                        <div className="text-sm text-muted-foreground">/apps/screensplit</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Compass className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">About & Contact</div>
                        <div className="text-sm text-muted-foreground">/about, /contact</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -z-10 -right-4 -bottom-4 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Fun Fact Section */}
        <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">💡 Did you know?</p>
            <p className="text-lg font-medium max-w-2xl mx-auto">
              The 404 error code was named after room 404 at CERN, where the World Wide Web was born. 
              Luckily, our tool doesn't require you to navigate complex room numbers!
            </p>
          </div>
        </section>

      <Footer />
    </div>
  )
}
