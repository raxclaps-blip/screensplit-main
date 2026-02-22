import AuthProvider from "@/components/providers/session-provider"
import HeroSection from "@/components/landing/Hero"
import { Navbar } from "@/components/common/Navbar"
import { LandingSocialProof } from "@/components/landing/LandingSocialProof"
import { LandingFeatures } from "@/components/landing/LandingFeatures"
import { LandingProof } from "@/components/landing/LandingProof"
import { LandingPricing } from "@/components/landing/LandingPricing"
import { LandingTestimonials } from "@/components/landing/LandingTestimonials"
import { LandingCTA } from "@/components/landing/LandingCTA"
import { LandingFooter } from "@/components/landing/LandingFooter"

export default async function LandingPage() {
  "use cache"

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Navbar />
        <HeroSection />
        <LandingSocialProof />
        <LandingFeatures />
        <LandingProof />
        <LandingPricing />
        <LandingTestimonials />
        <LandingCTA />
        <LandingFooter />
      </div>
    </AuthProvider>
  )
}
