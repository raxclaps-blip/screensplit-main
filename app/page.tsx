import type { Metadata } from "next"
import type {
  FAQPage,
  Organization,
  SoftwareApplication,
  WebSite,
  WithContext,
} from "schema-dts"
import { Header } from "@/components/landing/Header"
import { Hero } from "@/components/landing/Hero"
import { SocialProofStrip } from "@/components/landing/SocialProofStrip"
import { CommunityFeatured } from "@/components/landing/CommunityFeatured"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { TrustPrivacy } from "@/components/landing/TrustPrivacy"
import { FAQ, landingFaqs } from "@/components/landing/FAQ"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { Footer } from "@/components/landing/Footer"
import { serializeJsonLd } from "@/lib/seo/json-ld"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, absoluteUrl } from "@/lib/seo/site"

const landingTitle = "Before and After Photo Combiner"
const landingDescription =
  "Upload two images, align them quickly, and export professional before-and-after visuals for social media, campaigns, and client reports."

const organizationJsonLd: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: absoluteUrl("/"),
  logo: absoluteUrl("/icon"),
  description: SITE_DESCRIPTION,
  email: "hello@screensplit.com",
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@screensplit.com",
      availableLanguage: ["English"],
    },
  ],
}

const websiteJsonLd: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: absoluteUrl("/"),
  description: SITE_DESCRIPTION,
  inLanguage: "en-ZA",
}

const softwareApplicationJsonLd: WithContext<SoftwareApplication> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  url: absoluteUrl("/"),
  description: SITE_DESCRIPTION,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Before and after image composition",
    "Custom labels, overlays, and branding",
    "Export-ready visuals for social platforms",
    "Private sharing with link controls",
  ],
}

const faqJsonLd: WithContext<FAQPage> = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: landingFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export const metadata: Metadata = {
  title: landingTitle,
  description: landingDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: landingDescription,
    url: absoluteUrl("/"),
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Screensplit landing page preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: landingDescription,
    images: [absoluteUrl("/twitter-image")],
  },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <Header />
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-7xl divide-y divide-border border-x border-border">
          <Hero />
          <SocialProofStrip />
          <CommunityFeatured />
          <FeaturesGrid />
          <HowItWorks />
          <TrustPrivacy />
          <FAQ />
          <FinalCTA />
        </div>
      </main>
      <div className="mx-auto w-full max-w-7xl border-x border-border">
        <Footer />
      </div>
    </div>
  )
}

