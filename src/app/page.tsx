import {
  Header,
  Hero,
  TrustStrip,
  ProblemSection,
  SolutionSection,
  HowItWorks,
  Features,
  Testimonials,
  OutputPreview,
  Pricing,
  FAQ,
  FinalCTA,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <Features />
        <Testimonials />
        <OutputPreview />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
