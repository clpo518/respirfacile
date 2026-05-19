import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { UnifiedHeroSection } from '@/components/landing/UnifiedHeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { MethodSection } from '@/components/landing/MethodSection';
import { UnifiedFAQ } from '@/components/landing/UnifiedFAQ';
import { ProSections } from '@/components/landing/ProSections';
import { ProSection } from '@/components/landing/ProSection';
import { FounderStorySection } from '@/components/landing/FounderStorySection';
import { CTA } from '@/components/landing/CTA';

export default function UnifiedLanding() {
  return (
    <div className="w-full">
    <Navbar />
    <main className="w-full">
      <UnifiedHeroSection />
      <ProblemSection />
      <MethodSection />
      <ProSection />
      <ProSections />
      <FounderStorySection />
      <UnifiedFAQ />
      <CTA />
    </main>
    <Footer />
    </div>
  );
}
