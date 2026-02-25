"use client";

import { motion } from "framer-motion";
import {
  Crop,
  ImagePlus,
  Link2,
  MoveHorizontal,
  Smartphone,
} from "lucide-react";

const sectionShellClass =
  "relative overflow-hidden bg-background py-28 text-foreground";

const cardShellClass =
  "group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-border/30 bg-gradient-to-b from-card via-card to-background/90 p-7 shadow-2xl transition-all duration-700 hover:-translate-y-0.5 hover:border-border/60 hover:shadow-2xl dark:bg-none dark:bg-card";

const gridOverlayClass =
  "absolute inset-0 z-0 text-border opacity-[0.14] [background-size:24px_24px] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_60%,transparent_100%)]";

const featurePillClass =
  "rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground";

const features = [
  {
    icon: Crop,
    title: "Auto-Align That Actually Works",
    description: "Match framing so every comparison feels fair, clean, and professional.",
    points: ["Smart crop", "Face/subject alignment", "Manual fine-tune"],
    span: "lg:col-span-7",
    tone: "from-primary/30 to-transparent",
  },
  {
    icon: MoveHorizontal,
    title: "Multiple Comparison Styles",
    description: "Switch between layouts instantly based on the story you want to tell.",
    points: ["Split", "Slider", "Side-by-side"],
    span: "lg:col-span-5",
    tone: "from-primary/24 to-transparent",
  },
  {
    icon: Smartphone,
    title: "Preset Exports",
    description: "Ready-made dimensions for social platforms and client presentations.",
    points: ["1:1 Post", "4:5 Portrait", "9:16 Story", "16:9 Video"],
    span: "lg:col-span-4",
    tone: "from-primary/20 to-transparent",
  },
  {
    icon: ImagePlus,
    title: "Brand Styling",
    description: "Keep every before/after asset visually consistent with your visual identity.",
    points: ["Custom fonts", "Brand colors", "Watermarks"],
    span: "lg:col-span-4",
    tone: "from-primary/20 to-transparent",
  },
  {
    icon: Link2,
    title: "Secure Share Links",
    description: "Publish polished comparisons with optional privacy controls for client review.",
    points: ["Unlisted links", "Password protection", "View analytics"],
    span: "lg:col-span-4",
    tone: "from-primary/20 to-transparent",
  },
];

export function FeaturesGrid() {
  return (
    <section className={sectionShellClass} id="features">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[72vh] w-[72vw] rounded-full bg-primary/15 blur-[130px] dark:hidden" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Feature System
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Everything you need to ship trusted before/after visuals.
          </h2>
          <p className="text-lg text-muted-foreground">
            Built for speed, precision, and clean publishing workflows from first upload to final
            share link.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.08 * index }}
                className={`${cardShellClass} ${feature.span}`}
              >
                <div className={gridOverlayClass} />
                <div
                  className={`pointer-events-none absolute right-6 top-6 h-36 w-36 rounded-full bg-gradient-to-b ${feature.tone} blur-[60px] transition-opacity duration-500 group-hover:opacity-90 dark:hidden`}
                />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/40 bg-muted/50 shadow-sm">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground">{feature.title}</h3>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>

                  <div className="mt-auto flex flex-wrap gap-2.5">
                    {feature.points.map((point) => (
                      <span key={point} className={featurePillClass}>
                        {point}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 h-px w-full bg-gradient-to-r from-border/90 via-border/40 to-transparent dark:bg-none dark:bg-border/50" />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
