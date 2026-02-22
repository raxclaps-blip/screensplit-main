import AuthProvider from "@/components/providers/session-provider"
import HeroSection from "@/components/landing/Hero"
import { Navbar } from "@/components/common/Navbar"
import { FeaturesSection } from "@/components/landing/Features"
import { HowItWorksSection } from "@/components/landing/HowItWorks"
import { PricingSection } from "@/components/landing/Pricing"
import { CtaSection } from "@/components/landing/CtaSection"
import { LandingFooter } from "@/components/landing/LandingFooter"

export default async function LandingPage() {
  "use cache"

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground overflow-x-hidden selection:bg-primary/30">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <PricingSection />
          <CtaSection />
        </main>
        <LandingFooter />
      </div>
    </AuthProvider>
  )
}
