import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    name: "Starter",
    price: "Free",
    audience: "Solo creators getting started",
    features: ["Core editor", "Basic exports", "Gallery access"],
    cta: "Create account",
    href: "/auth/signup",
  },
  {
    name: "Pro",
    price: "$12/mo",
    audience: "Freelancers and small teams",
    features: ["Brand presets", "Advanced exports", "Priority support"],
    cta: "Start Pro",
    href: "/auth/signup",
    highlight: true,
  },
  {
    name: "Team",
    price: "$29/mo",
    audience: "Studios and in-house teams",
    features: ["Shared workspace", "Role controls", "Usage analytics"],
    cta: "Contact sales",
    href: "/contact",
  },
]

export function LandingPricing() {
  return (
    <section id="pricing" className="border-b border-border scroll-mt-24">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Straightforward plans that scale with your workflow.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold">{plan.name}</h3>
                {plan.highlight ? <Badge>Most popular</Badge> : null}
              </div>
              <p className="text-2xl font-semibold">{plan.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{plan.audience}</p>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button asChild className="mt-5 w-full" variant={plan.highlight ? "default" : "outline"}>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
