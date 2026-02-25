"use client";

import { motion } from "framer-motion";
import { Dumbbell, Scissors, Hammer, Droplet, PenTool, Palette } from "lucide-react";

const USE_CASES = [
    { label: "Fitness coaches", icon: <Dumbbell className="w-4 h-4" /> },
    { label: "Salons & barbers", icon: <Scissors className="w-4 h-4" /> },
    { label: "Contractors", icon: <Hammer className="w-4 h-4" /> },
    { label: "Skincare creators", icon: <Droplet className="w-4 h-4" /> },
    { label: "Design teams", icon: <PenTool className="w-4 h-4" /> },
    { label: "Artists", icon: <Palette className="w-4 h-4" /> },
];

export function SocialProofStrip() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-muted/20 via-background to-muted/20 py-12 md:py-16 dark:bg-none dark:bg-background">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center dark:hidden">
                <div className="h-56 w-[65vw] rounded-full bg-primary/10 blur-3xl" />
            </div>
            <div className="container mx-auto px-4 text-center mb-8">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    Made for creators teams who need comparisons that look clean.
                </p>
            </div>

            {/* Infinite scrolling row */}
            <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <motion.div
                    className="flex gap-6 items-center flex-nowrap shrink-0 px-3"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ ease: "linear", duration: 25, repeat: Number.POSITIVE_INFINITY }}
                >
                    {/* Double the array for seamless infinite scroll */}
                    {[...USE_CASES, ...USE_CASES].map((useCase, i) => (
                        <div
                            key={i}
                            className="group flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-card/80 px-6 py-3 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                {useCase.icon}
                            </div>
                            <span className="font-medium text-foreground">{useCase.label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
