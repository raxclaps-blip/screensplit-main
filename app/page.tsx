import { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { SocialProofStrip } from "@/components/landing/SocialProofStrip";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrustPrivacy } from "@/components/landing/TrustPrivacy";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Screensplit — Before & After Photo Combiner",
  description: "Upload two images and align them. Export a high-quality split image or interactive swipe slider for your social media in under a minute.",
  openGraph: {
    title: "Screensplit — Before & After Photo Combiner",
    description: "Upload two images and align them. Export a high-quality split image or interactive swipe slider for your social media in under a minute.",
    type: "website",
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <Header />
      <main className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-7xl divide-y divide-border border-x border-border">
          <Hero />
          <SocialProofStrip />
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
  );
}
