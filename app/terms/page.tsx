import type { Metadata } from "next";
import Link from "next/link";
import { cacheLife } from "next/cache";
import {
  FileText,
  Gavel,
  Mail,
  Scale,
  Shield,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read Screensplit's Terms of Service, including acceptable use, ownership, limitations, and legal obligations.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service - Screensplit",
    description:
      "Understand the rules, responsibilities, and legal terms for using Screensplit.",
    url: absoluteUrl("/terms"),
    type: "article",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Screensplit terms of service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - Screensplit",
    description:
      "Understand the rules, responsibilities, and legal terms for using Screensplit.",
    images: [absoluteUrl("/twitter-image")],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const highlights = [
  {
    title: "You own your content",
    description:
      "Your uploaded assets and exports remain yours. We do not claim ownership over your content.",
    icon: Shield,
  },
  {
    title: "Use responsibly",
    description:
      "Do not use the service for illegal activity, abuse, infringement, or platform disruption.",
    icon: UserCheck,
  },
  {
    title: "Clear legal framework",
    description:
      "These terms define responsibilities, limitations, and dispute handling in plain language.",
    icon: Scale,
  },
];

const termsSections = [
  {
    id: "acceptance",
    title: "1. Acceptance of terms",
    content: [
      "By accessing or using Screensplit, you agree to these Terms of Service. If you do not agree, do not use the service.",
      "We may update these terms from time to time. Continued use after updates constitutes acceptance of the revised terms.",
    ],
  },
  {
    id: "service-description",
    title: "2. Service description",
    content: [
      "Screensplit provides tools for before/after visual composition, export, and sharing workflows.",
      "Features may evolve over time, including additions, adjustments, or removals to improve reliability and user experience.",
    ],
  },
  {
    id: "accounts",
    title: "3. Accounts and access",
    content: [
      "Some features may require an account. You are responsible for keeping your account credentials secure and accurate.",
      "You must not share access in a way that compromises account security or violates these terms.",
    ],
    bullets: [
      "Provide accurate registration information",
      "Maintain security of credentials",
      "Notify us if account compromise is suspected",
    ],
  },
  {
    id: "user-content",
    title: "4. User content and license",
    content: [
      "You retain ownership of content you create or upload. To operate the service, you grant us a limited license to process and store content solely for service delivery.",
      "You represent that you have the rights needed to upload, process, and share any content used through Screensplit.",
    ],
    bullets: [
      "No illegal or infringing content",
      "No malware or malicious payloads",
      "No harassment, abuse, or harmful exploitation",
    ],
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable use",
    content: [
      "You agree not to misuse the service, interfere with systems, or attempt unauthorized access.",
      "Automated abuse, scraping at harmful scale, reverse engineering, or actions that degrade service quality are prohibited.",
    ],
  },
  {
    id: "ip-rights",
    title: "6. Intellectual property",
    content: [
      "Screensplit and related platform assets (excluding user content) are protected by intellectual property laws.",
      "You may not copy, redistribute, or create derivative works from proprietary service components without authorization.",
    ],
  },
  {
    id: "disclaimers",
    title: "7. Disclaimers",
    content: [
      "Screensplit is provided on an 'as is' and 'as available' basis to the maximum extent permitted by law.",
      "We do not guarantee uninterrupted operation, complete error elimination, or fitness for every specific use case.",
    ],
  },
  {
    id: "liability",
    title: "8. Limitation of liability",
    content: [
      "To the extent permitted by law, Screensplit and its operators are not liable for indirect, incidental, consequential, or special damages.",
      "Any direct liability is limited to the amount permitted under applicable law.",
    ],
  },
  {
    id: "termination",
    title: "9. Suspension and termination",
    content: [
      "We may suspend or terminate access for violations of these terms, abuse, or security risks.",
      "You may stop using the service at any time and may request account deletion where applicable.",
    ],
  },
  {
    id: "governing-law",
    title: "10. Governing law",
    content: [
      "These terms are governed by the laws of the State of California, without regard to conflict-of-law principles.",
      "Disputes will be handled in the courts located in San Francisco County, California, unless otherwise required by applicable law.",
    ],
  },
];

export default async function TermsPage() {
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
                <FileText className="h-4 w-4 text-primary" />
                Effective date: January 1, 2025
              </div>
              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Terms of Service
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                These terms govern your use of Screensplit and explain rights, obligations, and
                service limitations.
              </p>
            </div>
          </section>

          <section className="px-4 py-14 sm:px-6 md:py-20">
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/45 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Legal highlights
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Quick overview</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {highlights.map((item) => {
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
                <h2 className="mb-4 text-xl font-semibold tracking-tight">Sections</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {termsSections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className="hover:text-foreground transition-colors">
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>

              <div className="space-y-6">
                {termsSections.map((section) => (
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
                <Gavel className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                Questions about these terms?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                Reach out to our legal team for clarification regarding interpretation or requests.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="h-12 rounded-full px-8 text-base" asChild>
                  <a href="mailto:legal@screensplit.com">
                    <Mail className="mr-2 h-4 w-4" />
                    legal@screensplit.com
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
                    <FileText className="ml-2 h-4 w-4" />
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
