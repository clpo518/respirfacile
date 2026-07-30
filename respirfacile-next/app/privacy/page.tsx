import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { absoluteUrl, contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment Respirfacile traite vos données : hébergement en France, cloisonnement patient par patient, aucune revente, droits d'accès et de suppression.",
  alternates: { canonical: absoluteUrl("/privacy") },
};

const SECTIONS = [
  {
    title: "Données collectées",
    content:
      "Respirfacile collecte le strict nécessaire au fonctionnement du service : adresse électronique, nom, rôle (patient ou praticien), profil clinique renseigné par le praticien, et données de séances (exercices réalisés, durées, scores, ressenti). Aucune donnée n'est vendue ni utilisée à des fins publicitaires.",
  },
  {
    title: "Hébergement et sécurité",
    content:
      "Les données sont hébergées en France, région Paris, et chiffrées en transit et au repos. Le cloisonnement est appliqué directement dans la base de données : un patient ne peut lire que ses propres données, un praticien uniquement celles des patients qui lui sont rattachés.",
  },
  {
    title: "Qui voit quoi",
    content:
      "Votre praticien voit vos séances, vos scores et les entrées de journal que vous partagez avec lui. Ses notes cliniques privées ne vous sont pas visibles. Aucun autre patient n'a accès à vos données, et aucune donnée n'est transmise à un assureur, un employeur ou un tiers commercial.",
  },
  {
    title: "Durée de conservation",
    content:
      "Vos données sont conservées tant que votre compte existe. Elles ne sont pas supprimées automatiquement à la fin de l'abonnement de votre praticien : vous pouvez à tout moment en demander l'export ou la suppression définitive.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="w-full">
      <Navbar />
      <main className="w-full">
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-200 bg-texture">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-forest-800 mb-3">
              Politique de confidentialité
            </h1>
            <p className="text-forest-500 text-sm">Dernière mise à jour : juillet 2026</p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-beige-300">
          <div className="max-w-3xl mx-auto space-y-4">
            {SECTIONS.map((s) => (
              <div key={s.title} className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
                <h2 className="font-semibold text-xl text-forest-800 mb-3">{s.title}</h2>
                <p className="text-forest-600 leading-relaxed text-sm">{s.content}</p>
              </div>
            ))}

            <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
              <h2 className="font-semibold text-xl text-forest-800 mb-3">Vos droits (RGPD)</h2>
              <p className="text-forest-600 leading-relaxed text-sm">
                Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation,
                d&apos;opposition et de portabilité sur vos données. Écrivez à{" "}
                <a href={`mailto:${contactEmail}`} className="text-forest-800 font-medium hover:underline">
                  {contactEmail}
                </a>{" "}
                : je traite les demandes sous 30 jours. Le détail de l&apos;éditeur et des sous-traitants figure dans
                les{" "}
                <Link href="/mentions-legales" className="text-forest-800 font-medium hover:underline">
                  mentions légales
                </Link>
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
