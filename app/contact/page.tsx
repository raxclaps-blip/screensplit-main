import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import {
  Clock3,
  Globe,
  Mail,
  MessageSquare,
  Send,
  Shield,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContactAuthCtas } from "@/components/contact/contact-auth-ctas";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Screensplit for support, product feedback, or collaboration inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Screensplit",
    description:
      "Reach the Screensplit team for support, feedback, and partnership conversations.",
    url: absoluteUrl("/contact"),
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Contact Screensplit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Screensplit",
    description:
      "Reach the Screensplit team for support, feedback, and partnership conversations.",
    images: [absoluteUrl("/twitter-image")],
  },
};

const supportCards = [
  {
    title: "Email Support",
    body: "For product questions, bug reports, and account issues.",
    value: "hello@screensplit.com",
    href: "mailto:hello@screensplit.com",
    icon: Mail,
  },
  {
    title: "Response Window",
    body: "Most inquiries receive a response within one business day.",
    value: "Within 24 hours",
    icon: Clock3,
  },
  {
    title: "Coverage",
    body: "Remote-first team supporting creators and teams globally.",
    value: "Worldwide",
    icon: Globe,
  },
];

const quickAnswers = [
  {
    question: "Is Screensplit free to use?",
    answer:
      "Yes. Screensplit is free and focused on giving creators a fast way to build clean before/after visuals.",
  },
  {
    question: "Do I need an account to start?",
    answer:
      "No. You can begin immediately and create an account later if you want to organize projects.",
  },
  {
    question: "How private are my projects?",
    answer:
      "Projects and sharing controls are designed to be private by default with intentional publishing options.",
  },
  {
    question: "Can I request features?",
    answer:
      "Yes. Send your workflow details and expected outcome so we can prioritize requests effectively.",
  },
  {
    question: "What formats are supported?",
    answer:
      "Screensplit supports standard image formats used by creators, including common web and mobile outputs.",
  },
  {
    question: "How do I report a bug?",
    answer:
      "Use the form below with clear reproduction steps and, if possible, screenshots of the issue.",
  },
];

export default async function ContactPage() {
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
                <MessageSquare className="h-4 w-4 text-primary" />
                We would love to hear from you
              </div>

              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Contact the Screensplit team
              </h1>

              <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                Questions, feedback, or partnership ideas. Send a note and we will follow up
                quickly.
              </p>
            </div>
          </section>

          <section className="px-4 py-14 sm:px-6 md:py-20">
            <div className="grid gap-6 lg:grid-cols-5">
              <article className="rounded-[2rem] border border-border/50 bg-card/70 p-8 backdrop-blur-sm lg:col-span-3">
                <div className="mb-6 flex items-center gap-2">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-muted/45">
                    <Send className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Send us a message</h2>
                </div>

                <form className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium">
                        Name
                      </label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        className="border-border/60 bg-background/80"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        className="border-border/60 bg-background/80"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      className="border-border/60 bg-background/80"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      rows={7}
                      placeholder="Share details, links, and context so we can help effectively."
                      className="resize-none border-border/60 bg-background/80"
                    />
                  </div>

                  <Button className="h-12 w-full rounded-full text-base" size="lg">
                    Send message
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </article>

              <div className="grid gap-6 lg:col-span-2">
                {supportCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <article
                      key={card.title}
                      className="rounded-[2rem] border border-border/50 bg-card/70 p-7 backdrop-blur-sm"
                    >
                      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-muted/45">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>

                      <h3 className="mb-2 text-lg font-semibold tracking-tight">{card.title}</h3>
                      <p className="mb-3 text-sm text-muted-foreground">{card.body}</p>

                      {card.href ? (
                        <a
                          href={card.href}
                          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {card.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-foreground">{card.value}</p>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="px-4 py-14 sm:px-6 md:py-20">
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/45 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Quick answers
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                Frequently asked questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Common questions from creators and teams using Screensplit.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {quickAnswers.map((item) => (
                <article
                  key={item.question}
                  className="rounded-[1.6rem] border border-border/50 bg-card/70 p-6 backdrop-blur-sm"
                >
                  <h3 className="mb-3 text-lg font-semibold tracking-tight">{item.question}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="px-4 py-16 sm:px-6 md:py-20">
            <article className="rounded-[2rem] border border-border/50 bg-card/70 px-6 py-12 text-center backdrop-blur-sm sm:px-10">
              <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border/50 bg-muted/45">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                Need immediate help?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                Open the app and continue creating while we handle your request in parallel.
              </p>
              <ContactAuthCtas />
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
