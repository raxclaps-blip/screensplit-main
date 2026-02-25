"use client";

import { motion } from "framer-motion";
import { Check, GlobeLock, ShieldCheck, Trash2 } from "lucide-react";

const sectionShellClass =
  "relative overflow-hidden bg-background py-28 text-foreground";

const cardShellClass =
  "group relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-border/30 bg-gradient-to-b from-card via-card to-background/90 shadow-2xl transition-all duration-700 hover:border-border/60 hover:shadow-2xl dark:bg-none dark:bg-card";

const gridOverlayClass =
  "absolute inset-0 z-0 text-border opacity-[0.14] [background-size:24px_24px] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,#000_55%,transparent_100%)]";

const privacyPrinciples = [
  {
    title: "Immediate deletion",
    description:
      "Remove any project in one action. Deleted comparisons are removed from your workspace and storage.",
    icon: Trash2,
    accent: "text-primary",
  },
  {
    title: "Unlisted + password links",
    description:
      "Share client work with optional password protection and controlled link distribution.",
    icon: GlobeLock,
    accent: "text-primary",
  },
];

const guarantees = [
  "We don't sell your images.",
  "Export without ever publishing anything online.",
];

export function TrustPrivacy() {
  return (
    <section className={sectionShellClass} id="privacy">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[72vh] w-[72vw] rounded-full bg-primary/15 blur-[135px] dark:hidden" />
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
            Trust & Privacy
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Private by default. You control what gets shared.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Screensplit is built for client work and confidential visuals. Publish only when you
            decide.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className={`${cardShellClass} lg:col-span-2`}
          >
            <div className={gridOverlayClass} />
            <div className="relative z-10 flex h-full flex-col p-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border/40 bg-muted/50 shadow-sm">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-foreground md:text-[2rem]">
                  Security controls designed for creative teams.
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Whether you're preparing before-and-after work for a single client or a full
                  campaign, privacy settings are fast, clear, and always under your control.
                </p>
              </div>

              <div className="mt-10 rounded-2xl border border-border/40 bg-muted/45 p-5 backdrop-blur-md">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70" />
                  Quick Snapshot
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border/40 bg-background/70 p-3">
                    <p className="text-xs text-muted-foreground">Default visibility</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">Private</p>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/70 p-3">
                    <p className="text-xs text-muted-foreground">Share mode</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">Unlisted Link</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.article>

          <div className="grid grid-cols-1 gap-6 lg:col-span-3">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {privacyPrinciples.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.title}
                    initial={{ opacity: 0, y: 26 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.1 + index * 0.08 }}
                    className={cardShellClass}
                  >
                    <div className={gridOverlayClass} />
                    <div className="relative z-10 flex h-full flex-col p-6">
                      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border/40 bg-muted/50 shadow-sm">
                        <Icon className={`h-5 w-5 ${item.accent}`} />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                      <div className="mt-auto pt-6">
                        <div className="h-px w-full bg-gradient-to-r from-border/90 via-border/40 to-transparent dark:bg-none dark:bg-border/50" />
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <motion.article
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={cardShellClass}
            >
              <div className={gridOverlayClass} />
              <div className="relative z-10 p-7 md:p-8">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Our guarantee
                </div>
                <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {guarantees.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 rounded-xl border border-border/40 bg-muted/45 p-3.5 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          </div>
        </div>
      </div>
    </section>
  );
}
