import Link from "next/link"
import { Mail, MessageSquare, Send, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/components/common/Navbar"
import { Footer } from "@/components/common/Footer"
import AuthProvider from "@/components/providers/session-provider"

export default async function ContactPage() {
  "use cache"

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Navbar />

      {/* Hero Section */}
      <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>We'd love to hear from you</span>
          </div>
          <h1 className="mb-6 max-w-4xl mx-auto text-balance text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Get in Touch
          </h1>
          <p className="mb-10 max-w-2xl mx-auto text-pretty text-lg text-muted-foreground md:text-xl">
            Have questions, feedback, or just want to say hi? We're here to help.
          </p>
        </div>
      </div>
      </section>

      {/* Contact Section - Bento Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Contact Form - Spans 2 columns */}
          <div className="rounded-2xl border border-border bg-card p-8 md:col-span-2">
            <h2 className="mb-6 text-2xl font-bold">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">
                    Name
                  </label>
                  <Input id="name" placeholder="Your name" className="bg-secondary/50 border-border" />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="bg-secondary/50 border-border"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                  Subject
                </label>
                <Input id="subject" placeholder="What's this about?" className="bg-secondary/50 border-border" />
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell us more..."
                  rows={6}
                  className="bg-secondary/50 border-border resize-none"
                />
              </div>
              <Button size="lg" className="w-full gap-2 rounded-full">
                Send Message
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Contact Info - Spans 1 column */}
          <div className="space-y-6">
            {/* Email Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Email Us</h3>
              <p className="text-sm text-muted-foreground mb-3">For general inquiries and support</p>
              <a href="mailto:hello@screensplit.com" className="text-sm font-medium hover:underline">
                hello@screensplit.com
              </a>
            </div>

            {/* Response Time Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Response Time</h3>
              <p className="text-sm text-muted-foreground">We typically respond within 24 hours during business days</p>
            </div>

            {/* Location Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Location</h3>
              <p className="text-sm text-muted-foreground">Remote-first team serving creators worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
        <div>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Quick answers to common questions</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">Is Screensplit really free?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Yes! Screensplit is completely free to use with no hidden costs, subscriptions, or feature limitations.
                We believe powerful tools should be accessible to everyone.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">Do you store my images?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No. All image processing happens locally in your browser. Your images never leave your device, ensuring
                complete privacy and security for your work.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">What image formats are supported?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Screensplit supports all common image formats including JPG, PNG, WebP, and more. You can export your
                final comparison as either PNG or JPEG.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">Can I use Screensplit for commercial projects?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You're free to use Screensplit for personal or commercial projects. The images you create are yours to
                use however you'd like.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">Do I need to create an account?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nope! Screensplit works instantly without any signup or account creation. Just visit the app and start
                creating.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-3 text-lg font-semibold">How can I report a bug or request a feature?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We'd love to hear from you! Use the contact form above to report bugs or suggest features. Your feedback
                helps us make Screensplit better for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Still have questions?</h2>
          <p className="mb-8 text-muted-foreground">
            Can't find what you're looking for? Send us a message and we'll get back to you soon.
          </p>
          <Button size="lg" className="gap-2 rounded-full text-base">
            Contact Support
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </section>

        <Footer />
      </div>
    </AuthProvider>
  )
}
