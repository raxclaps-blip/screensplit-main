import { Badge } from "@/components/ui/badge"

const logos = ["PixelForge", "Northstar Studio", "GrowthPath", "Merge Creative"]

export function LandingSocialProof() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="outline" className="mb-3">
            Trusted by teams and solo creators
          </Badge>
          <p className="text-sm text-muted-foreground">
            12,000+ exports delivered in the last 30 days.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-muted-foreground sm:grid-cols-4">
          {logos.map((logo) => (
            <li key={logo} className="font-medium text-foreground/80">
              {logo}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
