import type { Metadata } from "next";
import {
  Heart,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { cacheLife } from "next/cache";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { AboutAuthCtas } from "@/components/about/about-auth-ctas";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Screensplit's mission to make visual comparisons effortless. Built for creators, by creators. Privacy-first, simple, and always free.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Screensplit",
    description:
      "Learn about our mission to make visual comparisons effortless. Built for creators, by creators.",
    url: absoluteUrl("/about"),
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "About Screensplit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Screensplit",
    description:
      "Learn about our mission to make visual comparisons effortless. Built for creators, by creators.",
    images: [absoluteUrl("/twitter-image")],
  },
};

const stats = [
  {
    label: "Comparisons created",
    value: "10K+",
    detail: "Used daily by creators, marketers, and teams worldwide.",
  },
  {
    label: "Privacy model",
    value: "100%",
    detail: "Private-by-default workflows with clear sharing controls.",
  },
  {
    label: "Core promise",
    value: "Always free",
    detail: "No paywall between your work and professional exports.",
  },
];

const values = [
  {
    title: "Privacy First",
    description:
      "Your comparisons stay under your control. Sharing is intentional, not automatic.",
    icon: Shield,
    points: ["Private by default", "No public feed"],
  },
  {
    title: "Simplicity",
    description:
      "A focused editor that gets out of your way so you can publish faster.",
    icon: Zap,
    points: ["Fast setup", "Clear workflow"],
  },
  {
    title: "Quality",
    description:
      "Professional output quality with polished presentation built into every export.",
    icon: Sparkles,
    points: ["Crisp exports", "Clean visual system"],
  },
  {
    title: "Accessibility",
    description:
      "Screensplit is built to be useful for solo creators and small teams from day one.",
    icon: Users,
    points: ["Always free", "No steep learning curve"],
  },
];

const storyTimeline = [
  {
    title: "The problem",
    detail:
      "Before/after workflows felt fragmented, heavy, and slower than they should be.",
  },
  {
    title: "The approach",
    detail:
      "Build a focused comparison tool with strong defaults and minimal friction.",
  },
  {
    title: "The result",
    detail:
      "A cleaner workflow that helps creators ship professional visuals quickly.",
  },
  {
    title: "What is next",
    detail:
      "Keep refining export quality, speed, and collaboration while staying simple.",
  },
];

export default async function AboutPage() {
  "use cache";
  cacheLife("max");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <Header />

      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-7xl divide-y divide-border border-x border-border">
          <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center dark:hidden">
              <div className="h-[60vh] w-[70vw] rounded-full bg-primary/10 blur-[130px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/45 px-4 py-1.5 text-sm font-medium text-muted-foreground">
                <Heart className="h-4 w-4 text-primary" />
                Built for creators, by creators
              </div>

              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Making visual comparisons effortless
              </h1>

              <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Screensplit exists to make before/after publishing clean, fast, and reliable
                without sacrificing quality.
              </p>
            </div>

            <div className="relative z-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-border/50 bg-card/70 p-5 backdrop-blur-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="px-4 py-14 sm:px-6 md:py-20">
            <div className="grid gap-6 lg:grid-cols-5">
              <article className="rounded-[2rem] border border-border/50 bg-card/70 p-8 backdrop-blur-sm lg:col-span-3">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border/50 bg-muted/45">
                  <Target className="h-6 w-6 text-primary" />
                </div>

                <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Our mission</h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  We are building the most straightforward way to create trusted before/after
                  visuals. The goal is simple: help you move from raw images to polished output
                  without unnecessary friction.
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  Every feature is judged against the same standard: does it make your workflow
                  faster, cleaner, and more reliable?
                </p>
              </article>

              <div className="grid gap-6 lg:col-span-2">
                <article className="rounded-[2rem] border border-border/50 bg-card/70 p-7 backdrop-blur-sm">
                  <h3 className="mb-3 text-xl font-semibold tracking-tight">What we optimize for</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>Fast first result with minimal setup</li>
                    <li>Consistent output quality across formats</li>
                    <li>Clear sharing controls for client work</li>
                  </ul>
                </article>

                <article className="rounded-[2rem] border border-border/50 bg-card/70 p-7 backdrop-blur-sm">
                  <h3 className="mb-3 text-xl font-semibold tracking-tight">Who it serves</h3>
                  <p className="text-sm text-muted-foreground">
                    Freelancers, agencies, product teams, and creators who need clean visual
                    comparisons without tool complexity.
                  </p>
                </article>
              </div>
            </div>
          </section>

          <section className="px-4 py-14 sm:px-6 md:py-20">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">Our values</h2>
              <p className="text-lg text-muted-foreground">
                Principles that shape product decisions and roadmap priorities.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <article
                    key={value.title}
                    className="rounded-[2rem] border border-border/50 bg-card/70 p-8 backdrop-blur-sm"
                  >
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-muted/45">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-3 text-2xl font-semibold tracking-tight">{value.title}</h3>
                    <p className="mb-6 leading-relaxed text-muted-foreground">{value.description}</p>
                    <div className="flex flex-wrap gap-2.5">
                      {value.points.map((point) => (
                        <span
                          key={point}
                          className="rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {point}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="px-4 py-14 sm:px-6 md:py-20">
            <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <h2 className="mb-5 text-3xl font-bold tracking-tight md:text-5xl">Our story</h2>
                <div className="space-y-4 leading-relaxed text-muted-foreground">
                  <p>
                    Screensplit started with a simple observation: presenting change should be
                    easier. Teams were spending too much time arranging image pairs and too little
                    time publishing.
                  </p>
                  <p>
                    We focused on the essentials first - alignment, export clarity, and dependable
                    sharing controls - then built from there.
                  </p>
                  <p>
                    Today, Screensplit is shaped by real creator workflows and continues to evolve
                    around speed, trust, and output quality.
                  </p>
                </div>
              </div>

              <article className="rounded-[2rem] border border-border/50 bg-card/70 p-7 backdrop-blur-sm">
                <h3 className="mb-5 text-xl font-semibold tracking-tight">Milestones</h3>
                <div className="space-y-4">
                  {storyTimeline.map((item, index) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 rounded-xl border border-border/40 bg-background/65 p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/50 text-xs font-bold">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-semibold capitalize">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section className="px-4 py-16 sm:px-6 md:py-20">
            <article className="rounded-[2rem] border border-border/50 bg-card/70 px-6 py-12 text-center backdrop-blur-sm sm:px-10">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                Ready to create with Screensplit?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                Launch the editor and publish your next before/after in minutes.
              </p>
              <AboutAuthCtas />
            </article>
          </section>
        </div>
      </main>

      <div className="mx-auto w-full max-w-7xl border-x border-border">
        <Footer />
      </div>
    </div>
  );
}
