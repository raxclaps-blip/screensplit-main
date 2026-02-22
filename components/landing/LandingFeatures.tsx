import { Gauge, ShieldCheck, Share2 } from "lucide-react"

const features = [
  {
    icon: Gauge,
    title: "Fast output",
    description: "Render polished comparisons in seconds, not minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description: "Processing happens in your browser for sensitive work.",
  },
  {
    icon: Share2,
    title: "Publish anywhere",
    description: "Download, post, or embed with one consistent output.",
  },
]

const steps = [
  { title: "1. Upload", description: "Drop your before and after visuals." },
  { title: "2. Style", description: "Tune labels, crop, and layout quickly." },
  { title: "3. Export", description: "Share as image, PDF, or social-ready format." },
]

export function LandingFeatures() {
  return (
    <section id="features" className="border-b border-border scroll-mt-24">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Core features
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need, without the clutter.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-xl border border-border bg-card p-5">
              <feature.icon className="mb-3 h-5 w-5 text-muted-foreground" />
              <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-3 sm:p-5">
          {steps.map((step) => (
            <div key={step.title} className="rounded-lg bg-background p-4">
              <p className="mb-1 text-sm font-semibold">{step.title}</p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
