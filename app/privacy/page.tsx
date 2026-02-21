import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Eye, Lock, Server, FileCheck, Mail } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import AuthProvider from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read how Screensplit protects your privacy. We process images locally in your browser and never upload your content to our servers.",
  openGraph: {
    title: "Privacy Policy - Screensplit",
    description: "Learn how Screensplit protects your privacy with local processing and no data uploads.",
  },
  twitter: {
    title: "Privacy Policy - Screensplit",
    description: "Learn how Screensplit protects your privacy with local processing and no data uploads.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PrivacyPage() {
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
                <Shield className="h-4 w-4" />
                <span>Effective Date: January 1, 2025</span>
              </div>
              <h1 className="mb-6 max-w-4xl mx-auto text-balance text-5xl font-bold leading-tight tracking-tight md:text-7xl">
                Privacy Policy
              </h1>
              <p className="mb-10 max-w-2xl mx-auto text-pretty text-lg text-muted-foreground md:text-xl">
                Your privacy is our priority. Learn how we protect your data and
                respect your rights.
              </p>
            </div>
          </div>
        </section>

        {/* Key Principles */}
        <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Our Privacy Principles
            </h2>
            <p className="text-lg text-muted-foreground">
              How we handle your information
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Client-Side Processing
              </h3>
              <p className="text-sm text-muted-foreground">
                All image processing happens in your browser. Your files never
                leave your device.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No Tracking</h3>
              <p className="text-sm text-muted-foreground">
                We don't use invasive analytics or track your behavior across
                the web.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Server className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Minimal Data</h3>
              <p className="text-sm text-muted-foreground">
                We only collect what's necessary to provide and improve our
                service.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="mx-auto max-w-7xl px-6 py-12 border-l border-r border-border">
          <div className="space-y-12">
            {/* Introduction */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-4 text-2xl font-bold">Introduction</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Welcome to Screensplit. We respect your privacy and are
                  committed to protecting your personal data. This privacy
                  policy explains how we handle your information when you use
                  our service.
                </p>
                <p>
                  Screensplit is designed with privacy as a core principle.
                  Unlike many online tools, we process your images entirely in
                  your browser, meaning your files never need to be uploaded to
                  our servers.
                </p>
              </div>
            </div>

            {/* Information We Collect */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <FileCheck className="h-6 w-6" />
              </div>
              <h2 className="mb-6 text-2xl font-bold">
                Information We Collect
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    1. Images and Files
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">
                    When you use Screensplit's core functionality without an
                    account:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>
                      Your images are processed entirely in your browser using
                      JavaScript
                    </li>
                    <li>Files are not uploaded to our servers</li>
                    <li>Images are not stored, cached, or transmitted to us</li>
                    <li>
                      When you close the browser tab, all data is immediately
                      discarded
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    If you create an account and choose to save images to your
                    gallery:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>
                      Images are uploaded to secure cloud storage (Cloudflare
                      R2)
                    </li>
                    <li>Images are encrypted in transit and at rest</li>
                    <li>
                      You control which images to save and can delete them at
                      any time
                    </li>
                    <li>
                      Saved images are only accessible to you through your
                      authenticated account
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    2. Account Information
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    If you create an account, we collect:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>
                      Email address (for authentication and account recovery)
                    </li>
                    <li>Display name (optional, for personalization)</li>
                    <li>
                      Password (encrypted using industry-standard bcrypt
                      hashing)
                    </li>
                    <li>Account creation and last login timestamps</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold">3. Usage Data</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We collect minimal, anonymized usage data to improve our
                    service:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Page views and feature usage (anonymized)</li>
                    <li>Error reports and performance metrics</li>
                    <li>
                      Browser type and device information (for compatibility)
                    </li>
                    <li>
                      Approximate geographic location (country-level only)
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    We do <strong>not</strong> use third-party tracking cookies
                    or invasive analytics tools.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    4. Cookies and Local Storage
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies and browser storage only for essential
                    functionality:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Authentication cookies (to keep you logged in)</li>
                    <li>
                      Preference cookies (to remember your settings like theme)
                    </li>
                    <li>Session storage (temporary data while you work)</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-2">
                    You can control cookie settings through your browser
                    preferences.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-6 text-2xl font-bold">
                How We Use Your Information
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Service Delivery:</strong> To provide and maintain
                    Screensplit's functionality
                  </li>
                  <li>
                    <strong>Account Management:</strong> To create and manage
                    your account if you choose to register
                  </li>
                  <li>
                    <strong>Communication:</strong> To send important service
                    updates or respond to your inquiries
                  </li>
                  <li>
                    <strong>Improvement:</strong> To understand how people use
                    Screensplit and improve the experience
                  </li>
                  <li>
                    <strong>Security:</strong> To detect and prevent fraud,
                    abuse, and security incidents
                  </li>
                  <li>
                    <strong>Legal Compliance:</strong> To comply with applicable
                    laws and regulations
                  </li>
                </ul>
                <p className="mt-4">
                  We will <strong>never</strong>:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Sell your personal data to third parties</li>
                  <li>Use your images for training AI models</li>
                  <li>Share your information with advertisers</li>
                  <li>Access your images without explicit permission</li>
                </ul>
              </div>
            </div>

            {/* Data Sharing and Third Parties */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-6 text-2xl font-bold">
                Data Sharing and Third Parties
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We work with a limited number of trusted third-party service
                  providers to deliver Screensplit:
                </p>
                <div className="space-y-4 mt-4">
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <h4 className="font-semibold mb-2">Vercel (Hosting)</h4>
                    <p className="text-sm">
                      Hosts our web application. May collect standard web server
                      logs (IP addresses, request URLs, timestamps).
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <h4 className="font-semibold mb-2">
                      Cloudflare R2 (Storage)
                    </h4>
                    <p className="text-sm">
                      Stores your saved images if you create an account. Images
                      are encrypted and only accessible to you.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <h4 className="font-semibold mb-2">
                      PlanetScale (Database)
                    </h4>
                    <p className="text-sm">
                      Stores account information and metadata. Data is encrypted
                      in transit and at rest.
                    </p>
                  </div>
                </div>
                <p className="mt-4">
                  These providers are contractually bound to protect your data
                  and use it only for providing their services to us. We do not
                  share data with advertising networks, data brokers, or social
                  media platforms.
                </p>
              </div>
            </div>

            {/* Data Security */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-6 text-2xl font-bold">Data Security</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We implement industry-standard security measures to protect
                  your data:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Encryption:</strong> All data is encrypted in
                    transit (TLS/SSL) and at rest
                  </li>
                  <li>
                    <strong>Password Security:</strong> Passwords are hashed
                    using bcrypt with salt
                  </li>
                  <li>
                    <strong>Access Controls:</strong> Strict access controls
                    limit who can access data
                  </li>
                  <li>
                    <strong>Regular Audits:</strong> We regularly review our
                    security practices
                  </li>
                  <li>
                    <strong>Secure Infrastructure:</strong> We use
                    enterprise-grade cloud providers
                  </li>
                </ul>
                <p className="mt-4">
                  While we implement strong security measures, no system is 100%
                  secure. We encourage you to use strong, unique passwords and
                  enable two-factor authentication when available.
                </p>
              </div>
            </div>

            {/* Your Rights and Choices */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-6 text-2xl font-bold">
                Your Rights and Choices
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  You have the following rights regarding your personal data:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Access:</strong> Request a copy of the personal data
                    we hold about you
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct inaccurate
                    information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your account
                    and associated data
                  </li>
                  <li>
                    <strong>Export:</strong> Download your data in a portable
                    format
                  </li>
                  <li>
                    <strong>Opt-out:</strong> Unsubscribe from marketing
                    communications
                  </li>
                  <li>
                    <strong>Object:</strong> Object to certain types of data
                    processing
                  </li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please contact us at{" "}
                  <strong>privacy@screensplit.com</strong>. We will respond to
                  your request within 30 days.
                </p>
                <p className="mt-4">You can also:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Delete your account at any time through account settings
                  </li>
                  <li>Clear browser cookies and local storage</li>
                  <li>
                    Use Screensplit without creating an account (no data
                    collected)
                  </li>
                </ul>
              </div>
            </div>

            {/* Data Retention */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-6 text-2xl font-bold">Data Retention</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We retain your data only as long as necessary:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Account Data:</strong> Retained while your account
                    is active
                  </li>
                  <li>
                    <strong>Saved Images:</strong> Retained until you delete
                    them or close your account
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Anonymized and retained for up
                    to 2 years for analytics
                  </li>
                  <li>
                    <strong>Deleted Accounts:</strong> Permanently deleted
                    within 30 days of deletion request
                  </li>
                </ul>
                <p className="mt-4">
                  Remember: If you use Screensplit without an account, no data
                  is retained on our servers.
                </p>
              </div>
            </div>

            {/* Children's Privacy */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-6 text-2xl font-bold">Children's Privacy</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Screensplit is not intended for children under 13 years of
                  age. We do not knowingly collect personal information from
                  children under 13. If you are a parent or guardian and believe
                  your child has provided us with personal information, please
                  contact us, and we will delete it promptly.
                </p>
              </div>
            </div>

            {/* International Users */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-6 text-2xl font-bold">International Users</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Screensplit is operated from the United States. If you access
                  our service from outside the US, your information may be
                  transferred to, stored, and processed in the US or other
                  countries where our service providers operate.
                </p>
                <p>
                  By using Screensplit, you consent to this transfer. We ensure
                  that any international data transfers comply with applicable
                  data protection laws, including GDPR for European users.
                </p>
              </div>
            </div>

            {/* Changes to This Policy */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-6 text-2xl font-bold">
                Changes to This Policy
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We may update this privacy policy from time to time to reflect
                  changes in our practices or legal requirements. When we make
                  significant changes, we will:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Update the "Effective Date" at the top of this policy</li>
                  <li>Notify you via email if you have an account</li>
                  <li>Display a notice on our website</li>
                </ul>
                <p className="mt-4">
                  We encourage you to review this policy periodically. Your
                  continued use of Screensplit after changes constitutes
                  acceptance of the updated policy.
                </p>
              </div>
            </div>

            {/* Contact Us */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="mb-6 text-2xl font-bold">Contact Us</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  If you have questions, concerns, or requests regarding this
                  privacy policy or how we handle your data, please contact us:
                </p>
                <div className="rounded-lg border border-border bg-secondary/30 p-4 mt-4">
                  <p className="font-medium text-foreground mb-2">
                    Screensplit Privacy Team
                  </p>
                  <p>
                    Email:{" "}
                    <a
                      href="mailto:privacy@screensplit.com"
                      className="text-foreground hover:underline"
                    >
                      privacy@screensplit.com
                    </a>
                  </p>
                  <p>
                    Contact Form:{" "}
                    <Link
                      href="/contact"
                      className="text-foreground hover:underline"
                    >
                      screensplit.com/contact
                    </Link>
                  </p>
                </div>
                <p className="mt-4">
                  We take privacy seriously and will respond to all inquiries
                  within 30 days.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </AuthProvider>
  );
}
