import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Scale, Shield } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import AuthProvider from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read Screensplit's Terms of Service. Learn about your rights, our responsibilities, and how we protect your content and privacy.",
  openGraph: {
    title: "Terms of Service - Screensplit",
    description: "Read Screensplit's Terms of Service. Learn about your rights and our responsibilities.",
  },
  twitter: {
    title: "Terms of Service - Screensplit",
    description: "Read Screensplit's Terms of Service. Learn about your rights and our responsibilities.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TermsPage() {
  "use cache"

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Navbar />

        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Effective Date: January 1, 2025</span>
              </div>
              <h1 className="mb-6 max-w-4xl mx-auto text-balance text-5xl font-bold leading-tight tracking-tight md:text-7xl">
                Terms of Service
              </h1>
              <p className="mb-10 max-w-2xl mx-auto text-pretty text-lg text-muted-foreground md:text-xl">
                Please read these terms carefully before using Screensplit.
              </p>
            </div>
          </div>
        </section>

        {/* Key Points */}
        <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
          <div className="grid gap-4 md:grid-cols-3 mb-12">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Your Rights</h3>
              <p className="text-sm text-muted-foreground">
                You retain all rights to your content. We don't claim ownership.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Free Service</h3>
              <p className="text-sm text-muted-foreground">
                Core features are free with no hidden charges.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Fair Use</h3>
              <p className="text-sm text-muted-foreground">
                Use responsibly and respect others' rights.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
          <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-2xl font-bold">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By using Screensplit, you agree to these Terms. If you disagree,
                please don't use our service. We may update these Terms;
                continued use means acceptance of changes.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-2xl font-bold">
                2. Service Description
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Screensplit provides tools to create image and video
                comparisons. Features include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Before/after image comparisons</li>
                <li>Video comparison tools</li>
                <li>Image processing utilities</li>
                <li>Gallery storage (with account)</li>
                <li>Export functionality</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-2xl font-bold">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                If you create an account:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Provide accurate information</li>
                <li>Must be 13+ years old</li>
                <li>Keep credentials secure</li>
                <li>Responsible for account activity</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-2xl font-bold">4. Your Content</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You own your images. By using Screensplit, you grant us limited
                license to process and store your content solely to provide the
                service. We don't use your content for training AI or marketing.
              </p>
              <p className="text-muted-foreground leading-relaxed font-semibold">
                Prohibited content:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Illegal or infringing content</li>
                <li>Malware or malicious code</li>
                <li>Hate speech or harassment</li>
                <li>Adult content violating policies</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-2xl font-bold">
                5. Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Screensplit owns the service design and code. You own your
                exported content and may use it commercially. Don't use our
                trademarks without permission.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-2xl font-bold">6. Prohibited Conduct</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Illegal activities</li>
                <li>Unauthorized access attempts</li>
                <li>Service disruption</li>
                <li>Automated abuse (bots/scrapers)</li>
                <li>Reverse engineering</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-2xl font-bold">7. Disclaimers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Service provided "AS IS" without warranties. We don't guarantee
                uninterrupted access, accuracy, or error-free operation. Use at
                your own risk.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-2xl font-bold">
                8. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We're not liable for indirect, incidental, or consequential
                damages including lost profits, data loss, or service
                interruption. Maximum liability limited by law.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-2xl font-bold">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may suspend or terminate accounts for Terms violations. You
                may delete your account anytime through settings.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-2xl font-bold">10. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by California law. Disputes resolved in
                San Francisco County courts. Class action waiver applies.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-2xl font-bold">11. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Questions? Contact us at <strong>legal@screensplit.com</strong>{" "}
                or visit{" "}
                <Link
                  href="/contact"
                  className="text-foreground hover:underline"
                >
                  our contact page
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </AuthProvider>
  );
}
