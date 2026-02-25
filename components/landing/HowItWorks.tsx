"use client";

import { motion } from "framer-motion";
import { Info, Scaling, Share2, UploadCloud } from "lucide-react";

const sectionShellClass =
  "relative overflow-hidden bg-background py-28 text-foreground";

const cardShellClass =
  "group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-border/30 bg-gradient-to-b from-card via-card to-background/90 p-8 shadow-2xl transition-all duration-700 hover:border-border/60 hover:shadow-2xl dark:bg-none dark:bg-card";

const gridOverlayClass =
  "absolute inset-0 text-border opacity-[0.14] [background-size:24px_24px] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_55%,transparent_100%)]";

const stepIconShellClass =
  "relative mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/40 bg-muted/50 text-foreground shadow-sm";

const stepBadgeClass =
  "absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 bg-primary text-xs font-bold text-primary-foreground shadow-md";

export function HowItWorks() {
  const steps = [
    {
      title: "Upload Before + After",
      description:
        "Drop in your images. We support JPG, PNG, WEBP, and HEIC formats directly from your phone.",
      icon: UploadCloud,
    },
    {
      title: "Align in seconds",
      description:
        "Use our smart alignment tools to match the framing perfectly, or fine-tune it manually.",
      icon: Scaling,
    },
    {
      title: "Export or share",
      description:
        "Download a static image in any aspect ratio, or generate a link to share the interactive slider.",
      icon: Share2,
    },
  ];

  return (
    <section id="how-it-works" className={sectionShellClass}>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[70vh] w-[70vw] rounded-full bg-primary/15 blur-[130px] dark:hidden" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl">How it works</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Stop messing with heavy design software just to place two images next to each other.
          </p>

          <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/45 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-md">
            <Info className="h-4 w-4 text-primary" />
            No account required to test. Create one later to save your templates.
          </div>
        </motion.div>

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-7 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-[4rem] -z-0 hidden h-px bg-gradient-to-r from-transparent via-border/90 to-transparent md:block dark:bg-none dark:bg-border/50" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.12 }}
                className={cardShellClass}
              >
                <div className={gridOverlayClass} />

                <div className="relative z-10 flex h-full flex-col">
                  <div className={stepIconShellClass}>
                    <Icon className="h-8 w-8 text-primary" />
                    <div className={stepBadgeClass}>{index + 1}</div>
                  </div>

                  <h3 className="mb-3 text-2xl font-bold tracking-tight text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>

                  <div className="mt-auto pt-8">
                    <div className="h-px w-full bg-gradient-to-r from-border/90 via-border/40 to-transparent dark:bg-none dark:bg-border/50" />
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70" />
                      Step 0{index + 1}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
