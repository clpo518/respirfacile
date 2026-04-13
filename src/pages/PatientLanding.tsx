import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { MethodSection } from "@/components/landing/MethodSection";
import { ExerciseDemoSection } from "@/components/landing/ExerciseDemoSection";
import { LibraryShowcase } from "@/components/landing/LibraryShowcase";
import { FounderStorySection } from "@/components/landing/FounderStorySection";
import { TherapistSection } from "@/components/landing/TherapistSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, ArrowRight } from "lucide-react";

const PatientLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Bandeau CTA diagnostic vocal */}
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="container px-4 md:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-foreground font-medium truncate">
                <span className="hidden sm:inline">Parlez-vous trop vite ? </span>Faites le test vocal gratuit en 30 secondes
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link to="/diagnostic">
                Tester ma vitesse
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        <HeroSection />
        <TrustSection />
        <ProblemSection />
        <MethodSection />
        <div id="exercises">
          <ExerciseDemoSection />
        </div>
        <LibraryShowcase />
        <FounderStorySection />
        <TherapistSection />
        <TestimonialsSection />
        <PricingTeaser />
        <AudienceSection />
      </main>
      <Footer />
    </div>
  );
};

export default PatientLanding;
