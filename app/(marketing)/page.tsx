import { Hero } from "@/components/landing/hero";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";

export default function MarketingPage() {
  return (
    <>
      <div className="relative">
        <Hero />
        <div className="pb-24 px-4 relative z-10">
          <DashboardPreview />
        </div>
      </div>
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
    </>
  );
}
