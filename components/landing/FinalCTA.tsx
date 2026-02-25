"use client";

import Link from "next/link";
import { ArrowRight, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function FinalCTA() {
    const { data: session, isPending } = authClient.useSession();
    const isAuthenticated = !isPending && Boolean(session?.user);
    const primaryCtaHref = isAuthenticated ? "/apps/dashboard" : "/auth/signup";
    const primaryCtaLabel = isAuthenticated ? "Go to Dashboard" : "Create Free Account";

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/20 py-24 md:py-32 dark:bg-none dark:bg-background">
            {/* Decorative BG effects */}
            <div className="pointer-events-none absolute inset-0 text-border opacity-[0.12] [background-size:24px_24px] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]" />
            <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/20 blur-[120px] dark:hidden" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/3 translate-y-1/3 rounded-full bg-secondary/20 blur-[120px] dark:hidden" />

            <div className="container mx-auto px-4 text-center z-10 relative">
                <div className="mb-8 inline-flex items-center justify-center rounded-2xl border border-border/40 bg-card/75 p-3 shadow-md backdrop-blur-sm">
                    <Scissors className="w-8 h-8 text-primary" />
                </div>

                <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
                    Make your next before/after look <span className="text-foreground">legit.</span>
                </h2>

                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
                    Upload two images and export a clean comparison in under a minute.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" className="h-14 w-full rounded-full px-8 text-base shadow-lg transition-all hover:shadow-xl sm:w-auto" asChild>
                        <Link href={primaryCtaHref}>
                            {primaryCtaLabel}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 w-full rounded-full border-border/50 bg-background/50 px-8 text-base backdrop-blur-sm sm:w-auto" asChild>
                        <Link href="#how-it-works">
                            How It Works
                        </Link>
                    </Button>
                </div>

                <p className="mt-6 text-sm text-muted-foreground/80">
                    {isAuthenticated
                        ? "You're signed in. Continue where you left off."
                        : "Completely free. Instant access to the editor."}
                </p>
            </div>
        </section>
    );
}
