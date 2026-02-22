import { AnimatedGroup } from "@/components/ui/animated-group"
import { TextEffect } from "@/components/ui/text-effect"
import { Card } from "@/components/ui/card"
import { ShieldCheck, Zap, Image as ImageIcon, History } from "lucide-react"

const features = [
    {
        title: "100% Client-Side",
        description: "Your images never leave your browser. All processing happens locally for ultimate privacy and security.",
        icon: ShieldCheck,
    },
    {
        title: "Lightning Fast",
        description: "Generate beautiful split-screen exports in under 5 seconds. No server latency, no waiting.",
        icon: Zap,
    },
    {
        title: "Interactive Sliders",
        description: "Create pixel-perfect before and after comparisons with smooth, draggable handles and custom branding.",
        icon: ImageIcon,
    },
    {
        title: "Personal Gallery",
        description: "Keep track of all your exports. Access and manage your previous creations effortlessly in your dashboard.",
        icon: History,
    }
]

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 sm:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0%,transparent_50%)] opacity-[0.03] dark:opacity-[0.05]" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl lg:text-center mb-16 sm:mb-20">
                    <TextEffect
                        as="h2"
                        preset="fade-in-blur"
                        className="text-base/7 font-semibold text-primary"
                    >
                        Capabilities
                    </TextEffect>
                    <TextEffect
                        as="p"
                        preset="fade-in-blur"
                        delay={0.2}
                        className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-foreground text-balance"
                    >
                        Everything you need for perfect comparisons
                    </TextEffect>
                    <TextEffect
                        as="p"
                        preset="fade-in-blur"
                        delay={0.4}
                        className="mt-6 text-lg/8 text-muted-foreground text-balance"
                    >
                        We built ScreenSplit to be fast, private, and exceptionally beautiful.
                        No complex settings, just drop your images and get instant results.
                    </TextEffect>
                </div>

                <AnimatedGroup
                    className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4"
                    variants={{
                        container: {
                            visible: { transition: { staggerChildren: 0.1 } }
                        },
                        item: {
                            hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
                            visible: {
                                opacity: 1,
                                y: 0,
                                filter: "blur(0px)",
                                transition: { type: "spring", stiffness: 100, damping: 15 }
                            }
                        }
                    }}
                >
                    {features.map((feature, index) => (
                        <Card key={index} className="flex flex-col relative overflow-hidden border-border/50 bg-card p-8 h-full transition-all">
                            <div className="mb-6 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-background border border-primary/40 shadow-sm ring-1 ring-primary/20 transition-all duration-300">
                                <feature.icon className="h-6 w-6 text-primary transition-colors" aria-hidden="true" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </AnimatedGroup>
            </div>
        </section>
    )
}
