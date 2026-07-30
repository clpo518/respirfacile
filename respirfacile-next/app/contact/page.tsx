import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ContactForm } from "./ContactForm";
import { absoluteUrl, contactEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Me contacter",
  description:
    "Une question sur l'abonnement, un problème technique, un retour terrain : écrivez directement au fondateur de Respirfacile. Réponse sous 24 heures ouvrées.",
  openGraph: {
    title: "Contacter Respirfacile",
    description: `Une question ? Je réponds sous 24 heures ouvrées. ${contactEmail}`,
    url: absoluteUrl("/contact"),
  },
  alternates: { canonical: absoluteUrl("/contact") },
};

export default function ContactPage() {
  return (
    <div className="w-full">
      <Navbar />
      <main className="w-full">
        {/* Hero */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-beige-200 bg-texture">
          <div className="max-w-2xl mx-auto">
            <p className="text-copper-500 text-sm font-semibold uppercase tracking-widest mb-4">Contact</p>
            <h1 className="font-display text-5xl font-bold text-forest-800 mb-4">
              Une question ? Je réponds sous 24 heures.
            </h1>
            <p className="text-lg text-forest-600">
              Un partenariat, un retour terrain, un problème technique : c&apos;est moi qui lis, et c&apos;est moi qui
              réponds.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-beige-300">
          <div className="max-w-2xl mx-auto space-y-12">

            {/* Formulaire */}
            <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
              <h2 className="font-semibold text-lg text-forest-800 mb-6">Envoyez-moi un message</h2>
              <ContactForm />
            </div>

            {/* Info directe */}
            <div className="space-y-4">
              <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
                <p className="text-xs font-semibold text-copper-500 uppercase tracking-widest mb-3">Courriel</p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-forest-800 hover:text-forest-600 font-semibold text-lg transition-colors"
                >
                  {contactEmail}
                </a>
                <p className="text-sm text-forest-600 mt-3">
                  Utilisez cette adresse si vous préférez écrire directement.
                </p>
              </div>

              {/* CTA praticiens */}
              <div className="bg-forest-500/10 border border-forest-500/20 rounded-3xl p-8">
                <p className="font-semibold text-forest-800 mb-3">
                  Orthophonistes et kinésithérapeutes
                </p>
                <p className="text-forest-600 text-sm leading-relaxed mb-4">
                  Vous souhaitez tester Respirfacile avec vos patients ? Commencez l&apos;essai gratuit de 30 jours
                  directement : aucune démarche administrative, aucune carte bancaire demandée.
                </p>
                <Link
                  href="/auth?mode=signup&role=therapist"
                  className="inline-block rounded-full bg-forest-500 px-6 py-2 font-semibold text-beige-100 hover:bg-forest-600 transition-colors text-sm"
                >
                  Démarrer l&apos;essai gratuit →
                </Link>
              </div>
            </div>

            {/* FAQ rapide */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-forest-800">Questions fréquentes</h3>
              <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-6">
                <p className="font-semibold text-forest-800 mb-2">Quel est le délai de réponse ?</p>
                <p className="text-sm text-forest-600">
                  Je réponds à tous les messages sous 24 heures, en semaine. Les messages reçus le week-end sont traités
                  le lundi.
                </p>
              </div>
              <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-6">
                <p className="font-semibold text-forest-800 mb-2">Puis-je appeler directement ?</p>
                <p className="text-sm text-forest-600">
                  Pour l&apos;instant, tout passe par le courriel. Si votre sujet est urgent, dites-le dans votre
                  message : je vous rappelle.
                </p>
              </div>
              <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-6">
                <p className="font-semibold text-forest-800 mb-2">Comment signaler un bug ?</p>
                <p className="text-sm text-forest-600">
                  Décrivez-le dans le formulaire, catégorie « Autre », ou écrivez à {contactEmail} avec les détails :
                  navigateur, appareil, et étapes pour le reproduire.
                </p>
              </div>
              <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-6">
                <p className="font-semibold text-forest-800 mb-2">J&apos;ai une urgence médicale</p>
                <p className="text-sm text-forest-600">
                  Respirfacile n&apos;est pas un service de soins. En cas d&apos;urgence, appelez le 15, ou le 112 depuis
                  un téléphone portable. Pour toute question sur votre traitement, adressez-vous à votre médecin.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
