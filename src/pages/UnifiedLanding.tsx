import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { UnifiedHeroSection } from '@/components/landing/UnifiedHeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { MethodSection } from '@/components/landing/MethodSection';
import { UnifiedFAQ } from '@/components/landing/UnifiedFAQ';
import { ProSections } from '@/components/landing/ProSections';
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

      {/* For professionals section */}
      <section className="relative w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Pour les orthophonistes et kinésithérapeutes
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Respirfacile est basée sur 9 études cliniques — avec la méta-analyse Stanford 2015, n=120 participants. Une approche scientifiquement validée pour la rééducation myofonctionnelle.
              </p>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-start gap-3">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Suivi d'observance en temps réel</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Bilan PDF exportable pour le médecin du sommeil</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>30 exercices validés cliniquement</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Essai 30 jours gratuit, sans carte bancaire</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Patients accèdent gratuitement via votre code</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 text-gray-900">
              <div className="space-y-6">
                <div className="border-l-4 border-teal-500 pl-4">
                  <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider">
                    Validé scientifiquement
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    -50% IAH en moyenne
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Méta-analyse Camacho et al. 2015
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                    Facile d'utilisation
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    2 min pour prescrire
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Code généralisé automatiquement
                  </p>
                </div>
                <div className="border-l-4 border-emerald-500 pl-4">
                  <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">
                    Conformité
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    RGPD · Hébergement France
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Données médicales protégées
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProSections />
      <FounderStorySection />
      <UnifiedFAQ />
      <CTA />
    </main>
    <Footer />
    </div>
  );
}
