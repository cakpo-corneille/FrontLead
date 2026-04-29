import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProofBar } from "@/components/landing/ProofBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { AuthRedirect } from "@/components/auth-redirect";

const SHOW_PRICING = true;

export default function LandingPage() {
  return (
    <AuthRedirect>
      <div className="landing-scrollbar flex min-h-screen w-full flex-col bg-background overflow-x-clip relative scroll-smooth">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <ProofBar />
          <HowItWorks />
          <Features />
          {SHOW_PRICING && <Pricing />}
          <FAQ />
          <CTASection />
        </main>
        <Footer />
      </div>
    </AuthRedirect>
  );
}
