import Link from "next/link"
import { ArrowRight, Film, Images, LayoutGrid, Palette, Settings, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const primaryTools = [
  {
    title: "Screensplit",
    description: "Create polished before/after comparisons with full visual control.",
    href: "/apps/screensplit",
    icon: LayoutGrid,
    accent: "text-blue-500 dark:text-blue-400",
  },
  {
    title: "Videosplit",
    description: "Compose side-by-side video comparisons for social and product demos.",
    href: "/apps/videosplit",
    icon: Film,
    accent: "text-rose-500 dark:text-rose-400",
    beta: true,
  },
  {
    title: "Designer",
    description: "Build branded exports with text overlays, saved logos, and custom layouts.",
    href: "/apps/designer",
    icon: Palette,
    accent: "text-violet-500 dark:text-violet-400",
  },
]

const utilityTools = [
  {
    title: "Image Tools",
    description: "Optimize, convert, and prep images before publishing.",
    href: "/apps/image-tools",
    icon: Wand2,
  },
  {
    title: "Gallery",
    description: "Browse and share your saved exports.",
    href: "/apps/gallery",
    icon: Images,
  },
  {
    title: "Settings",
    description: "Manage your account profile and preferences.",
    href: "/apps/settings",
    icon: Settings,
  },
]

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sky-500/12 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-violet-500/12 blur-3xl" />

        <div className="relative">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Workspace Dashboard
          </p>
          <h1 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back. Pick a workflow and start creating.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Everything you need for comparison visuals, video splits, branded image design, and export management.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/apps/designer">
                Open Designer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/apps/screensplit">Go to Screensplit</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {primaryTools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href} className="group">
              <Card className="h-full border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md">
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background">
                    <Icon className={`h-5 w-5 ${tool.accent}`} />
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold">{tool.title}</p>
                    {tool.beta ? (
                      <Badge
                        variant="secondary"
                        className="border-amber-500/40 bg-amber-500/15 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400"
                      >
                        Beta
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-foreground/90">
                  Open
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Card>
            </Link>
          )
        })}
      </section>

      <section className="mt-6 rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
        <p className="text-sm font-semibold">Utilities</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {utilityTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-xl border border-border/70 bg-background/60 px-3 py-3 transition-colors hover:bg-background"
              >
                <div className="mb-1 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{tool.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
