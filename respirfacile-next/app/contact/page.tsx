import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Nous contacter | Respirfacile",
  description:
    "Contactez Respirfacile pour toute question sur l'abonnement, un problème technique ou un partenariat. Réponse sous 24h ouvrées. Email : contact@respirfacile.fr",
  openGraph: {
    title: "Contacter Respirfacile",
    description: "Une question ? Nous répondons sous 24h. contact@respirfacile.fr",
    url: "https://respirfacile.fr/contact",
  },
  alternates: { canonical: "https://respirfacile.fr/contact" },
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
              Une question ? On vous repond sous 24h.
            </h1>
            <p className="text-lg text-forest-600">
              Un partenariat, un retour terrain, un probleme technique - nous sommes la pour vous.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-beige-300">
          <div className="max-w-2xl mx-auto space-y-12">

            {/* Formulaire */}
            <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
              <h2 className="font-semibold text-lg text-forest-800 mb-6">Envoyez-nous un message</h2>
              <ContactForm />
            </div>

            {/* Info directe */}
            <div className="space-y-4">
              <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-8">
                <p className="text-xs font-semibold text-copper-500 uppercase tracking-widest mb-3">Email</p>
                <a
                  href="mailto:contact@respirfacile.fr"
                  className="text-forest-800 hover:text-forest-600 font-semibold text-lg transition-colors"
                >
                  contact@respirfacile.fr
                </a>
                <p className="text-sm text-forest-600 mt-3">
                  Utilisez cette adresse pour les urgences ou si vous preferez ecrire directement.
                </p>
              </div>

              {/* CTA pour orthos */}
              <div className="bg-forest-500/10 border border-forest-500/20 rounded-3xl p-8">
                <p className="font-semibold text-forest-800 mb-3">
                  Orthophonistes & Kinesitherapeutes
                </p>
                <p className="text-forest-600 text-sm leading-relaxed mb-4">
                  Vous souhaitez tester Respirfacile avec vos patients ? Commencez l'essai gratuit 30 jours directement - aucune demarche administrative, pas de carte bancaire demandee.
                </p>
                <Link
                  href="/auth?mode=signup&role=therapist"
                  className="inline-block rounded-full bg-forest-500 px-6 py-2 font-semibold text-beige-100 hover:bg-forest-600 transition-colors text-sm"
                >
                  Demarrer l'essai gratuit -&gt;
                </Link>
              </div>
            </div>

            {/* FAQ rapide */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-forest-800">Questions frequentes</h3>
              <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-6">
                <p className="font-semibold text-forest-800 mb-2">Quel est le delai de reponse ?</p>
                <p className="text-sm text-forest-600">
                  Nous repondons a tous les messages sous 24h, en semaine. Les messages recus le weekend sont traites le lundi.
                </p>
              </div>
              <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-6">
                <p className="font-semibold text-forest-800 mb-2">Puis-je appeler directement ?</p>
                <p className="text-sm text-forest-600">
                  Actuellement, nous repondons par email. Pour une urgence metier, mentionnez-le dans votre message et nous vous recontacterons rapidement.
                </p>
              </div>
              <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-6">
                <p className="font-semibold text-forest-800 mb-2">Comment signaler un bug ?</p>
                <p className="text-sm text-forest-600">
                  Decrivez-le dans le formulaire (type "Autre") ou ecrivez a contact@respirfacile.fr avec les details : navigateur, appareil, et etapes pour reproduire.
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
