import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";
import {
  Database,
  Eye,
  Globe2,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how Screensplit handles your data, privacy rights, and security practices.",
  openGraph: {
    title: "Privacy Policy - Screensplit",
    description:
      "Understand what data Screensplit collects, how it is used, and your privacy choices.",
  },
  twitter: {
    title: "Privacy Policy - Screensplit",
    description:
      "Understand what data Screensplit collects, how it is used, and your privacy choices.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const principles = [
  {
    title: "Privacy by default",
    description:
      "Core editing workflows are designed to minimize data exposure and keep control with you.",
    icon: Lock,
  },
  {
    title: "Minimal collection",
    description:
      "We collect only the data needed to operate, secure, and improve Screensplit.",
    icon: Database,
  },
  {
    title: "No data sales",
    description:
      "We do not sell personal data or share your content with advertising brokers.",
    icon: Eye,
  },
];

const policySections = [
  {
    id: "data-we-collect",
    title: "1. Data we collect",
    content: [
      "If you create an account, we collect account details such as your email and authentication metadata needed to operate sign-in and account recovery.",
      "If you choose to save projects, associated files and project metadata are stored in managed infrastructure so you can access your work later.",
      "We may process operational telemetry (for example, performance diagnostics and error logs) to maintain reliability and security.",
    ],
    bullets: [
      "Account email and authentication records",
      "Project files and metadata when explicitly saved",
      "Security and reliability logs",
    ],
  },
  {
    id: "how-we-use-data",
    title: "2. How we use data",
    content: [
      "We use data strictly to provide product functionality, secure the service, respond to support requests, and improve product quality.",
      "We do not use private customer content to train advertising systems.",
    ],
    bullets: [
      "Deliver core product functionality",
      "Prevent abuse and secure accounts",
      "Diagnose incidents and improve performance",
      "Respond to support and legal obligations",
    ],
  },
  {
    id: "sharing-and-processors",
    title: "3. Sharing and subprocessors",
    content: [
      "We rely on trusted infrastructure and service providers to host the application, store data when required, and operate authentication and analytics.",
      "Vendors are selected with security and contractual safeguards, and are expected to process data only for service delivery.",
    ],
    bullets: [
      "Hosting and application delivery providers",
      "Cloud storage and database providers",
      "Security and operations tools",
    ],
  },
  {
    id: "retention-security",
    title: "4. Retention and security",
    content: [
      "We retain data for as long as needed to provide the service, meet legal requirements, and resolve disputes.",
      "We use security controls such as encrypted transport, access restrictions, and infrastructure-level protections to reduce risk.",
    ],
    bullets: [
      "Encryption in transit",
      "Access controls and least-privilege principles",
      "Periodic review of logs and security posture",
    ],
  },
  {
    id: "your-rights",
    title: "5. Your rights and choices",
    content: [
      "Subject to applicable law, you may request access, correction, export, or deletion of your personal data.",
      "You can also manage some information directly in product settings when available.",
    ],
    bullets: [
      "Access and correction requests",
      "Deletion and export requests",
      "Account controls and preference settings",
    ],
  },
  {
    id: "children-and-international",
    title: "6. Children and international transfers",
    content: [
      "Screensplit is not directed to children under 13, and we do not knowingly collect personal data from children under 13.",
      "If you access the service from outside the United States, your information may be processed in countries where our providers operate, subject to appropriate safeguards.",
    ],
  },
  {
    id: "changes",
    title: "7. Policy updates",
    content: [
      "We may update this Privacy Policy to reflect product, legal, or operational changes.",
      "When material updates are made, we will update the effective date and post the updated version on this page.",
    ],
  },
];

export default async function PrivacyPage() {
  "use cache";
  cacheLife("max");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/30">
      <Header />

      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-7xl divide-y divide-border border-x border-border">
          <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 md:pb-28 md:pt-40">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center dark:hidden">
              <div className="h-[60vh] w-[70vw] rounded-full bg-primary/10 blur-[130px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/45 px-4 py-1.5 text-sm font-medium text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                Effective date: January 1, 2025
              </div>
              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Privacy Policy
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                This policy explains what data Screensplit processes, why it is used, and the
                choices you have.
              </p>
            </div>
          </section>

          <section className="px-4 py-14 sm:px-6 md:py-20">
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/45 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Core principles
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">How we approach privacy</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {principles.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-[2rem] border border-border/50 bg-card/70 p-7 backdrop-blur-sm"
                  >
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-muted/45">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold tracking-tight">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="px-4 py-14 sm:px-6 md:py-20">
            <div className="grid gap-6 lg:grid-cols-[0.34fr_0.66fr]">
              <aside className="rounded-[2rem] border border-border/50 bg-card/70 p-6 backdrop-blur-sm lg:sticky lg:top-24 lg:h-fit">
                <h2 className="mb-4 text-xl font-semibold tracking-tight">On this page</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {policySections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className="hover:text-foreground transition-colors">
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>

              <div className="space-y-6">
                {policySections.map((section) => (
                  <article
                    key={section.id}
                    id={section.id}
                    className="rounded-[2rem] border border-border/50 bg-card/70 p-8 backdrop-blur-sm scroll-mt-28"
                  >
                    <h3 className="mb-4 text-2xl font-bold tracking-tight">{section.title}</h3>
                    <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                      {section.content.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    {section.bullets ? (
                      <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 py-16 sm:px-6 md:py-20">
            <article className="rounded-[2rem] border border-border/50 bg-card/70 px-6 py-12 text-center backdrop-blur-sm sm:px-10">
              <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-muted/45">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                Questions about privacy?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                Reach out to our team for data requests, clarifications, or privacy-related support.
              </p>

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="h-12 rounded-full px-8 text-base" asChild>
                  <a href="mailto:privacy@screensplit.com">
                    <Mail className="mr-2 h-4 w-4" />
                    privacy@screensplit.com
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-border/60 px-8 text-base"
                  asChild
                >
                  <Link href="/contact">
                    Contact page
                    <Globe2 className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
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
