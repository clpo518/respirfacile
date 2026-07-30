import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { AppPreview } from "@/components/landing/AppPreview";
import { ScreeningQuiz } from "@/components/landing/ScreeningQuiz";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { MethodSection } from "@/components/landing/MethodSection";
import { ProSection } from "@/components/landing/ProSection";
import { FounderSection } from "@/components/landing/FounderSection";
import { EvidenceSection } from "@/components/landing/EvidenceSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { faqJsonLd } from "@/lib/content/faq";
import { absoluteUrl, contactEmail, legalEntity, siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Respirfacile, rééducation respiratoire pour l'apnée du sommeil",
  description:
    "Application de rééducation myofonctionnelle prescrite par les orthophonistes et kinésithérapeutes. Exercices guidés, Pause Contrôlée, cohérence cardiaque, suivi du praticien entre les séances. Essai 30 jours sans carte bancaire.",
  openGraph: {
    title: "Respirfacile, rééducation respiratoire pour l'apnée du sommeil",
    description:
      "Exercices myofonctionnels guidés, Pause Contrôlée, cohérence cardiaque. Prescrit par les orthophonistes et kinésithérapeutes. Essai 30 jours sans carte bancaire.",
    url: siteUrl,
    type: "website",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: siteName }],
  },
  alternates: { canonical: siteUrl },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: siteUrl,
      name: siteName,
      description: "Application de rééducation respiratoire pour l'apnée du sommeil",
      inLanguage: "fr-FR",
    },
    {
      "@type": "SoftwareApplication",
      "@id": absoluteUrl("/#app"),
      name: siteName,
      applicationCategory: "HealthApplication",
      operatingSystem: "Web, iOS, Android",
      description:
        "Application de thérapie myofonctionnelle orofaciale prescrite par les orthophonistes et les kinésithérapeutes. Complément aux soins, ne remplace pas un traitement médical.",
      offers: {
        "@type": "Offer",
        price: "15",
        priceCurrency: "EUR",
        description: "Abonnement mensuel praticien, à partir de",
      },
      publisher: {
        "@type": "Organization",
        name: legalEntity.name,
        url: siteUrl,
      },
    },
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#org"),
      name: siteName,
      url: siteUrl,
      logo: absoluteUrl("/icon-512.png"),
      contactPoint: {
        "@type": "ContactPoint",
        email: contactEmail,
        contactType: "customer service",
        availableLanguage: "French",
      },
    },
    faqJsonLd(),
  ],
};

export default function HomePage() {
  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="w-full">
        <HeroSection />

        {/* MODULE 1 : MINI TEST */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-beige-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-forest-500/10 border border-forest-500/20 px-4 py-2 text-sm font-medium text-forest-700 mb-5">
                1 minute
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-forest-800 mb-4 text-balance">
                Respirfacile est-il fait pour vous ?
              </h2>
              <p className="text-forest-500 max-w-xl mx-auto">
                5 questions pour le savoir. Ce test ne pose aucun diagnostic.
              </p>
            </div>
            <ScreeningQuiz />
          </div>
        </section>

        {/* MODULE 2 : APP PREVIEW */}
        <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-forest-800">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-copper-500/20 border border-copper-500/30 px-4 py-2 text-sm font-medium text-copper-300 mb-6">
                  Application
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-beige-100 mb-5 leading-tight">
                  Tout ce dont vous avez besoin,<br />
                  en un seul endroit.
                </h2>
                <div className="space-y-4 mb-8">
                  {[
                    { emoji: "🎯", title: "Exercices guidés étape par étape", desc: "Un timer, des instructions claires, votre score enregistré automatiquement après chaque séance." },
                    { emoji: "📈", title: "Votre progression en un coup d'œil", desc: "Graphiques, scores, séances réalisées : vous voyez concrètement ce qui évolue." },
                    { emoji: "📄", title: "Votre praticien suit votre évolution", desc: "Votre orthophoniste ou votre kinésithérapeute voit vos résultats et ajuste votre programme." },
                    { emoji: "💬", title: "Vos messages de suivi", desc: "Votre praticien vous laisse des encouragements et des conseils personnalisés directement dans l'application." },
                  ].map((f) => (
                    <div key={f.title} className="flex gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">{f.emoji}</span>
                      <div>
                        <p className="font-semibold text-beige-100 text-sm">{f.title}</p>
                        <p className="text-sm text-beige-300 mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <AppPreview />
            </div>
          </div>
        </section>

        <ProblemSection />
        <MethodSection />
        <ProSection />
        <FounderSection />
        <EvidenceSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
