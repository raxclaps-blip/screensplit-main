import { AnimatedGroup } from "@/components/ui/animated-group"
import { TextEffect } from "@/components/ui/text-effect"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

const features = [
    "Unlimited local exports",
    "High resolution MP4 and Images",
    "No watermarks",
    "Custom branding options",
    "Access to personal gallery",
    "Community support"
]

export function PricingSection() {
    return (
        <section id="pricing" className="py-24 sm:py-32 relative">
            <div className="absolute inset-0 bg-background" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl text-center mb-16 sm:mb-20">
                    <TextEffect as="h2" preset="fade-in-blur" className="text-base/7 font-semibold text-primary">
                        Pricing
                    </TextEffect>
                    <TextEffect
                        as="p"
                        preset="fade-in-blur"
                        delay={0.2}
                        className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-foreground"
                    >
                        Simple, transparent pricing
                    </TextEffect>
                    <TextEffect
                        as="p"
                        preset="fade-in-blur"
                        delay={0.4}
                        className="mt-6 text-lg/8 text-muted-foreground"
                    >
                        ScreenSplit is currently entirely free to use while we are in Beta.
                        Sign up to get full access to all features immediately.
                    </TextEffect>
                </div>

                <div className="mx-auto max-w-lg">
                    <AnimatedGroup
                        variants={{
                            container: { visible: { transition: { delayChildren: 0.6 } } },
                            item: { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } } }
                        }}
                    >
                        <Card className="rounded-3xl p-8 sm:p-10 ring-1 ring-border/50 bg-card shadow-2xl overflow-hidden relative group">
                            {/* Subtle accent glow */}
                            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative z-10">
                                <h3 className="text-2xl font-semibold text-foreground">Beta Access</h3>
                                <div className="mt-4 flex items-baseline text-5xl font-extrabold tracking-tight text-foreground">
                                    $0
                                    <span className="ml-1 text-xl font-medium text-muted-foreground">/ forever</span>
                                </div>
                                <p className="mt-6 text-base text-muted-foreground">
                                    For early adopters. All features included, forever.
                                </p>
                                <ul className="mt-8 space-y-4 text-sm leading-6 text-muted-foreground">
                                    {features.map((feature) => (
                                        <li key={feature} className="flex gap-x-3">
                                            <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8">
                                    <Button asChild size="lg" className="w-full rounded-xl text-base shadow-lg shadow-primary/20">
                                        <Link href="/auth/signup">Get Started Free</Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </AnimatedGroup>
                </div>
            </div>
        </section>
    )
}
