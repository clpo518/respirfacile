import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { absoluteUrl, contactEmail, legalEntity, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales de Respirfacile : éditeur, directeur de publication, hébergement, propriété intellectuelle et statut de l'application au regard de la réglementation sur les dispositifs médicaux.",
  alternates: { canonical: absoluteUrl("/mentions-legales") },
};

const SECTIONS = [
  {
    title: "Éditeur du site",
    body: [
      `${siteName} est édité par ${legalEntity.name}, société par actions simplifiée.`,
      `Siège social : ${legalEntity.address}.`,
      `${legalEntity.rcs}. ${legalEntity.vat}.`,
      `Directeur de la publication : ${legalEntity.publicationDirector}.`,
      `Contact : ${contactEmail}.`,
    ],
  },
  {
    title: "Hébergement",
    body: [
      "Interface web : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.",
      "Base de données, authentification et fichiers : Supabase, infrastructure Amazon Web Services, région Paris (eu-west-3), France.",
      "Les données de santé transitant par le service sont hébergées dans l'Union européenne.",
    ],
  },
  {
    title: "Statut de l'application",
    body: [
      "Respirfacile n'est pas un dispositif médical au sens du règlement (UE) 2017/745. L'application ne pose aucun diagnostic, ne délivre aucune prescription et ne pilote aucun traitement.",
      "Les scores et courbes affichés sont des indicateurs de suivi destinés à soutenir le travail entre le patient et son praticien. Ils n'ont aucune valeur diagnostique.",
      "Respirfacile ne remplace ni un avis médical, ni un traitement en cours tel que la pression positive continue, une orthèse d'avancée mandibulaire ou une intervention chirurgicale. Aucune modification de traitement ne doit être décidée sans l'avis du médecin.",
      "En cas d'urgence, appelez le 15, ou le 112 depuis un téléphone portable.",
    ],
  },
  {
    title: "Données personnelles",
    body: [
      "Les traitements de données réalisés par Respirfacile relèvent du règlement (UE) 2016/679 (RGPD). Le praticien abonné est responsable des données de suivi de ses patients ; l'éditeur agit en qualité de sous-traitant.",
      "Chaque utilisateur dispose d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur ses données.",
      `Ces droits s'exercent par courriel à ${contactEmail}. Une réclamation peut être adressée à la CNIL.`,
    ],
  },
  {
    title: "Propriété intellectuelle",
    body: [
      "L'ensemble des contenus du site et de l'application, y compris le catalogue d'exercices, les textes, les visuels et le code, est protégé par le droit d'auteur. Toute reproduction ou réutilisation sans autorisation écrite est interdite.",
      "Les références scientifiques citées restent la propriété de leurs auteurs et éditeurs respectifs ; elles sont mentionnées à titre de citation.",
    ],
  },
  {
    title: "Signalement",
    body: [
      `Pour signaler un contenu inexact, une erreur clinique ou un dysfonctionnement, écrivez à ${contactEmail}. Les signalements portant sur la sécurité des patients sont traités en priorité.`,
    ],
  },
];

export default function MentionsLegalesPage() {
  return (
    <div className="w-full">
      <Navbar />
      <main className="w-full">
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-200 bg-texture">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-forest-800 mb-3">Mentions légales</h1>
            <p className="text-forest-500 text-sm">Dernière mise à jour : juillet 2026</p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-beige-300">
          <div className="max-w-3xl mx-auto space-y-4">
            {SECTIONS.map((section) => (
              <div key={section.title} className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
                <h2 className="font-semibold text-xl text-forest-800 mb-3">{section.title}</h2>
                <div className="space-y-2">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-forest-600 leading-relaxed text-sm">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
