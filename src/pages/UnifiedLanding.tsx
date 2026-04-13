import { Navbar } from "@/components/landing/Navbar";
import { UnifiedHeroSection } from "@/components/landing/UnifiedHeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { MethodSection } from "@/components/landing/MethodSection";
import { ExerciseDemoSection } from "@/components/landing/ExerciseDemoSection";
import { LibraryShowcase } from "@/components/landing/LibraryShowcase";
import { PricingTeaser } from "@/components/landing/PricingTeaser";
import { ProSections } from "@/components/landing/ProSections";
import { FounderStorySection } from "@/components/landing/FounderStorySection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { UnifiedFAQ } from "@/components/landing/UnifiedFAQ";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Stethoscope, Heart } from "lucide-react";

const UnifiedLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <UnifiedHeroSection />

        {/* Sections patients */}
        <ProblemSection />
        <MethodSection />
        <ExerciseDemoSection />
        <LibraryShowcase />

        {/* Pricing — gratuit pour patients */}
        <PricingTeaser />

        {/* Section Orthophonistes */}
        <div id="orthophonistes">
          <section className="py-12 md:py-16">
            <div className="container px-4 md:px-6">
              <motion.div
                className="flex items-center justify-center gap-3 mb-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Pour les orthophonistes
                </h2>
              </motion.div>
              <motion.p
                className="text-center text-lg text-muted-foreground max-w-2xl mx-auto mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Prolongez l'efficacité de vos séances entre les rendez-vous.
              </motion.p>
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/15 px-4 py-1.5 text-sm text-muted-foreground">
                  <Heart className="w-3.5 h-3.5 text-primary" />
                  Membre de l'Association Parole Bégaiement (APB)
                </span>
              </motion.div>
            </div>
          </section>
          <ProSections />
        </div>

        {/* Founder + social proof */}
        <FounderStorySection />
        <TestimonialsSection />
        <UnifiedFAQ />
      </main>
      <Footer />
    </div>
  );
};

export default UnifiedLanding;
