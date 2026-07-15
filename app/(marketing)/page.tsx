import { Hero } from "@/components/landing/hero";
import dynamic from "next/dynamic";
const DashboardPreview = dynamic(() => import("@/components/landing/dashboard-preview").then(mod => mod.DashboardPreview), {
  ssr: false, // We don't need to server-side render the fake dashboard
});
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
