interface StatsSectionProps {
  user: any | null
}

export function StatsSection({ user }: StatsSectionProps) {
  return (
    <section className="relative border-y border-border overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_80%_at_50%_20%,black,transparent)] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.10),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl border border-border/70 bg-background/60 backdrop-blur-sm p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="border-r border-border pr-8 last:border-r-0">
              <div className="mb-2 text-3xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">10K+</div>
              <div className="text-sm text-muted-foreground">Exports created</div>
            </div>
            <div className="border-r border-border pr-8 last:border-r-0">
              <div className="mb-2 text-3xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">5 sec</div>
              <div className="text-sm text-muted-foreground">Average export time</div>
            </div>
            <div className="border-r border-border pr-8 last:border-r-0">
              <div className="mb-2 text-3xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">100%</div>
              <div className="text-sm text-muted-foreground">Client-side processing</div>
            </div>
            <div className="pr-8">
              <div className="mb-2 text-3xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">Free account</div>
              <div className="text-sm text-muted-foreground">{user ? "Unlimited projects" : "Sign up required"}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
