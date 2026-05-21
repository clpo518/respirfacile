import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation | Respirfacile",
  description:
    "CGU Respirfacile — conditions d'abonnement pour orthophonistes et kinésithérapeutes, droits et obligations, résiliation, données personnelles. Éditeur : POCLE SAS, Paris.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://respirfacile.fr/terms" },
};

const sections = [
  {
    num: "1",
    title: "Objet du service",
    content: "Respirfacile est une application de rééducation respiratoire à destination des patients souffrant d'apnée du sommeil (SAOS) et de troubles myofonctionnels orofaciaux (TMOF). Le service est prescrit par des professionnels de santé (orthophonistes, kinésithérapeutes).",
  },
  {
    num: "2",
    title: "Avertissement médical",
    content: "Respirfacile est un outil de rééducation complémentaire. Il ne remplace pas le diagnostic médical, la consultation d'un médecin du sommeil ou le traitement CPAP prescrit. Toute modification de traitement doit être discutée avec votre médecin.",
  },
  {
    num: "3",
    title: "Abonnement et résiliation",
    content: "L'abonnement orthophoniste est mensuel ou annuel. La résiliation est possible à tout moment depuis l'espace paramètres. Aucun remboursement partiel du mois en cours.",
  },
];

export default function TermsPage() {
  return (
    <div className="w-full">
      <Navbar />
      <main className="w-full">
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-200 bg-texture">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-forest-800 mb-3">
              Conditions générales d&apos;utilisation
            </h1>
            <p className="text-forest-500 text-sm">Dernière mise à jour : avril 2026</p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-beige-300">
          <div className="max-w-3xl mx-auto space-y-4">
            {sections.map((s) => (
              <div key={s.num} className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
                <div className="flex items-start gap-4">
                  <span className="text-xs font-bold text-copper-400 font-display mt-1">{s.num}.</span>
                  <div>
                    <h2 className="font-semibold text-lg text-forest-800 mb-2">{s.title}</h2>
                    <p className="text-forest-600 leading-relaxed text-sm">{s.content}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
              <div className="flex items-start gap-4">
                <span className="text-xs font-bold text-copper-400 font-display mt-1">4.</span>
                <div>
                  <h2 className="font-semibold text-lg text-forest-800 mb-2">Contact</h2>
                  <p className="text-forest-600 text-sm">
                    Respirfacile, Clément Pontegnier, Annecy, France.{" "}
                    <a href="mailto:clement@respirfacile.fr" className="text-forest-800 font-medium hover:underline">
                      clement@respirfacile.fr
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
