import { createFileRoute } from "@tanstack/react-router"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero"
import { LogosSection } from "@/components/logos-section"
import { PricingSection } from "@/components/pricing-section"
import { TeamSection } from "@/components/team-section"
import { MetricsSection } from "@/components/metrics-section"
import { InfrastructureSection } from "@/components/infrastructure-section"
import { NewsSection } from "@/components/news-section"
import { CtaSection } from "@/components/cta-section"
import { SupportSection } from "@/components/support-section"
import { Footer } from "@/components/footer"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <LogosSection />
        <MetricsSection />
        <TeamSection />
        <InfrastructureSection />
        <NewsSection />
        <PricingSection />
        <SupportSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
