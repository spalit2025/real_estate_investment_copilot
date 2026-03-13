import {
  Header,
  Hero,
  ProblemSection,
  SolutionSection,
  HowItWorks,
  Features,
  OutputPreview,
  FAQ,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <Features />
        <OutputPreview />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
