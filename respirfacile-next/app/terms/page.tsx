import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { absoluteUrl, contactEmail, legalEntity } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description:
    "Conditions d'abonnement Respirfacile pour orthophonistes et kinésithérapeutes : objet du service, avertissement médical, résiliation, données personnelles.",
  alternates: { canonical: absoluteUrl("/terms") },
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
    content: "Respirfacile n'est pas un dispositif médical. L'application ne pose aucun diagnostic, ne délivre aucune prescription et ne remplace ni la consultation d'un médecin du sommeil, ni un traitement prescrit (pression positive continue, orthèse d'avancée mandibulaire, chirurgie). Les mesures affichées sont indicatives. Toute modification de traitement doit être décidée avec votre médecin.",
  },
  {
    num: "3",
    title: "Abonnement et résiliation",
    content: "L'abonnement du praticien est mensuel. La résiliation est possible à tout moment depuis l'espace paramètres et prend effet à la fin de la période en cours. Aucun remboursement partiel du mois entamé. L'accès des patients rattachés cesse à la fin de l'abonnement du praticien.",
  },
  {
    num: "4",
    title: "Responsabilité du praticien",
    content: "Le praticien reste seul responsable de l'indication, du contenu et du volume du programme qu'il prescrit, ainsi que du suivi de ses patients. Respirfacile fournit un outil d'exécution et de mesure, pas un avis clinique.",
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
                <span className="text-xs font-bold text-copper-400 font-display mt-1">5.</span>
                <div>
                  <h2 className="font-semibold text-lg text-forest-800 mb-2">Éditeur et contact</h2>
                  <p className="text-forest-600 text-sm">
                    Respirfacile est édité par {legalEntity.name}, {legalEntity.address}. {legalEntity.rcs}.{" "}
                    <a href={`mailto:${contactEmail}`} className="text-forest-800 font-medium hover:underline">
                      {contactEmail}
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
