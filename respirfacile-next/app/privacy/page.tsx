import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Respirfacile",
};

export default function PrivacyPage() {
  const sections = [
    {
      title: "Données collectées",
      content: "Respirfacile collecte les données nécessaires au fonctionnement du service : email, nom, rôle (patient/thérapeute), données de séances (métriques d'exercices, durées, scores). Aucune donnée n'est vendue à des tiers.",
    },
    {
      title: "Hébergement et sécurité",
      content: "Toutes les données sont hébergées en France via Supabase (région EU West). Les données médicales sont protégées par Row Level Security, chaque patient ne voit que ses propres données.",
    },
    {
      title: "Vos droits (RGPD)",
      content: null,
    },
  ];

  return (
    <div className="w-full">
      <Navbar />
      <main className="w-full">
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-200 bg-texture">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-forest-800 mb-3">
              Politique de confidentialité
            </h1>
            <p className="text-forest-500 text-sm">Dernière mise à jour : avril 2026</p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-beige-300">
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                title: "Données collectées",
                content: "Respirfacile collecte les données nécessaires au fonctionnement du service : email, nom, rôle (patient/thérapeute), données de séances (métriques d'exercices, durées, scores). Aucune donnée n'est vendue à des tiers.",
              },
              {
                title: "Hébergement et sécurité",
                content: "Toutes les données sont hébergées en France via Supabase (région EU West). Les données médicales sont protégées par Row Level Security, chaque patient ne voit que ses propres données.",
              },
            ].map((s) => (
              <div key={s.title} className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
                <h2 className="font-semibold text-xl text-forest-800 mb-3">{s.title}</h2>
                <p className="text-forest-600 leading-relaxed text-sm">{s.content}</p>
              </div>
            ))}

            <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
              <h2 className="font-semibold text-xl text-forest-800 mb-3">Vos droits (RGPD)</h2>
              <p className="text-forest-600 leading-relaxed text-sm">
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de
                rectification et de suppression de vos données. Contactez-nous à{" "}
                <a href="mailto:clement@respirfacile.fr" className="text-forest-800 font-medium hover:underline">
                  clement@respirfacile.fr
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
