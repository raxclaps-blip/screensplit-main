import { AnimatedGroup } from "@/components/ui/animated-group"
import { TextEffect } from "@/components/ui/text-effect"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CtaSection() {
    return (
        <section className="relative overflow-hidden py-32 sm:py-40 bg-muted/20">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="absolute left-1/2 top-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,var(--color-primary)_0,transparent_50%)] opacity-[0.05] blur-[100px]" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl text-center">
                    <TextEffect
                        as="h2"
                        preset="fade-in-blur"
                        className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground"
                    >
                        Ready to show the comparison?
                    </TextEffect>
                    <TextEffect
                        as="p"
                        preset="fade-in-blur"
                        delay={0.2}
                        className="mx-auto mt-6 max-w-xl text-lg/8 text-muted-foreground"
                    >
                        Join thousands of creators using ScreenSplit to make perfect before and after sliders. Free during beta.
                    </TextEffect>

                    <AnimatedGroup
                        className="mt-10 flex items-center justify-center gap-x-6"
                        variants={{
                            container: { visible: { transition: { delayChildren: 0.4 } } },
                            item: { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }
                        }}
                    >
                        <Button asChild size="lg" className="rounded-xl px-8 h-12 text-base">
                            <Link href="/auth/signup">
                                Start Creating Free
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="lg" className="rounded-xl px-8 h-12 text-base">
                            <Link href="/apps/screensplit">Try Demo</Link>
                        </Button>
                    </AnimatedGroup>
                </div>
            </div>
        </section>
    )
}
