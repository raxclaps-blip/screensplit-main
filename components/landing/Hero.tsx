"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Lock, Sparkles, Layers, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function Hero() {
    const { data: session, isPending } = authClient.useSession();
    const isAuthenticated = !isPending && Boolean(session?.user);
    const primaryCtaHref = isAuthenticated ? "/apps/dashboard" : "/auth/signup";
    const primaryCtaLabel = isAuthenticated ? "Go to Dashboard" : "Create a Comparison";
    const secondaryCtaHref = isAuthenticated ? "/apps/screensplit" : "#demo";
    const secondaryCtaLabel = isAuthenticated ? "Open Editor" : "See a Demo";

    const scrollToDemo = (e: React.MouseEvent<HTMLElement>) => {
        if (isAuthenticated) {
            return;
        }
        e.preventDefault();
        const demoEl = document.getElementById("demo");
        if (demoEl) {
            demoEl.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden mx-auto container px-4 sm:px-6">
            {/* No Background decorations (Removed gradients) */}

            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                {/* Text Content */}
                <div className="flex-1 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span>Before & After Maker</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                        Before & after photos made simple.
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Upload two images. Export a stunning comparison in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-4">
                        <Button size="lg" className="w-full sm:w-auto text-base h-14 px-8 rounded-full" asChild>
                            <Link href={primaryCtaHref}>
                                {primaryCtaLabel}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-8 rounded-full bg-background/50 backdrop-blur-sm" onClick={scrollToDemo} asChild>
                            <Link href={secondaryCtaHref}>
                                {secondaryCtaLabel}
                                {isAuthenticated ? (
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                ) : (
                                    <Play className="w-4 h-4 ml-2" />
                                )}
                            </Link>
                        </Button>
                    </div>

                    <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground/80 mt-6">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Private by default. Delete anytime.</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-10">
                        <Badge icon={<Layers className="w-3.5 h-3.5" />} text="Split Image" />
                        <Badge icon={<ImageIcon className="w-3.5 h-3.5" />} text="Swipe Slider" />
                        <Badge icon={<Play className="w-3.5 h-3.5" />} text="Reels-ready Exports" />
                    </div>
                </div>

                {/* Visual / Demo */}
                <div className="flex-1 w-full max-w-2xl mx-auto lg:mr-0 relative z-10 animate-in fade-in lg:slide-in-from-right-8 duration-700 delay-200 fill-mode-both">
                    <div className="relative rounded-2xl border bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden p-2 sm:p-4 flex items-center justify-center">
                        <div className="w-full relative shadow-inner ring-1 ring-border/50 rounded-xl overflow-hidden bg-muted">
                            <Image
                                src="/app-preview-lightmode.png"
                                alt="Screensplit App Preview - Light Mode"
                                width={1200}
                                height={900}
                                className="w-full h-auto object-cover dark:hidden"
                                priority
                            />
                            <Image
                                src="/app-preview-darkmode.png"
                                alt="Screensplit App Preview - Dark Mode"
                                width={1200}
                                height={900}
                                className="w-full h-auto object-cover hidden dark:block"
                                priority
                            />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-secondary/30 text-secondary-foreground border border-secondary/20">
            {icon}
            {text}
        </div>
    );
}
