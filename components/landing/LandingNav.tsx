import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Logo from "@/components/common/Logo"

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Proof", href: "#proof" },
  { label: "Pricing", href: "#pricing" },
  { label: "Reviews", href: "#reviews" },
]

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="ScreenSplit home" className="flex items-center gap-2">
          <Logo />
          <span className="text-sm font-semibold tracking-tight">ScreenSplit</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/auth/signup" className="inline-flex items-center gap-1.5">
              Start free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
