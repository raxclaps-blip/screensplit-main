import AuthProvider from "@/components/providers/session-provider"
import HeroSection from "@/components/landing/Hero"
import { UseCasesSection } from "@/components/landing/UseCases"
import { TestimonialsSection } from "@/components/landing/Testiomonials"
import { CtaSection } from "@/components/landing/CTA"
import { Footer } from "@/components/common/Footer"
import { Navbar } from "@/components/common/Navbar"
import BentoInfo from "@/components/landing/BentoInfo"
import HowItWorksAdvanced from "@/components/landing/HowItWorksAdvanced"
import { FeaturedImages } from "@/components/landing/FeaturedImages"

export default async function LandingPage() {
  "use cache"

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Navbar/>
        <HeroSection />
        <BentoInfo/>
        <FeaturedImages />
        <HowItWorksAdvanced/>
        <UseCasesSection />
        <TestimonialsSection />
        <CtaSection />
        <Footer />
      </div>
    </AuthProvider>
  )
}
