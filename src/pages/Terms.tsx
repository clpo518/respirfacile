import { Link } from "react-router-dom";
import { ArrowLeft, Scale, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour à l'accueil</span>
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Mentions Légales</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">
              Conditions Générales de Vente et d'Utilisation (CGV/CGU)
            </h1>
            <p className="text-muted-foreground">
              Mise à jour : Janvier 2026
            </p>
          </div>

          {/* Legal Content */}
          <div className="space-y-10 text-foreground/90 leading-relaxed">
            
            {/* Article 1 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                1. Mentions Légales
              </h2>
              <p className="mb-4">
                Le site et l'application <strong>ParlerMoinsVite</strong> sont édités par la société <strong>POCLE</strong>, Société par Actions Simplifiée (SAS) au capital de <strong>1 500 euros</strong>.
              </p>
              <ul className="space-y-2 list-none pl-0">
                <li><strong>Siège social :</strong> 21 B RUE DU SIMPLON, 75018 PARIS</li>
                <li><strong>Immatriculation :</strong> RCS de PARIS sous le numéro <strong>847 536 711</strong></li>
                <li><strong>N° de TVA Intracommunautaire :</strong> FR70847536711</li>
                <li><strong>Directeur de la publication :</strong> Clément P.</li>
                <li><strong>Hébergeur :</strong> Supabase / Vercel</li>
                <li><strong>Contact :</strong> <a href="mailto:contact@parlermoinsvite.fr" className="text-primary hover:underline">contact@parlermoinsvite.fr</a></li>
              </ul>
            </section>

            {/* Article 2 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                2. Objet et Champ d'Application
              </h2>
              <p>
                Les présentes CGV régissent la vente d'abonnements et l'utilisation de l'application "ParlerMoinsVite". Elles s'appliquent à tout professionnel de santé souscripteur (l'"Orthophoniste" ou "Abonné") ainsi qu'à toute personne bénéficiant d'un accès via un Code Pro (le "Patient"). L'utilisation de l'application vaut acceptation sans réserve des présentes conditions.
              </p>
            </section>

            {/* Article 3 - CRITICAL WARNING BOX */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                3. AVERTISSEMENT IMPORTANT (NON-RESPONSABILITÉ MÉDICALE)
              </h2>
              <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-400 dark:border-red-700 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <p className="font-semibold text-red-800 dark:text-red-300">
                    L'application ParlerMoinsVite est un outil d'entraînement vocal et de régulation du débit. CE N'EST PAS UN DISPOSITIF MÉDICAL.
                  </p>
                </div>
                <ul className="space-y-3 text-red-900 dark:text-red-200 ml-9">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span>L'application ne fournit aucun diagnostic, ni prescription médicale.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span>L'utilisation de l'application ne saurait se substituer à une consultation chez un orthophoniste, un médecin ORL ou tout autre spécialiste de santé.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span>La société POCLE décline toute responsabilité en cas d'absence de progrès ou d'aggravation des troubles. L'utilisateur est seul responsable de l'interprétation des données fournies (graphiques, vitesse) qui ne sont données qu'à titre indicatif.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Article 4 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                4. Services, Accès et Modèle d'Abonnement
              </h2>
              <p className="mb-4">
                L'application fonctionne selon deux modèles complémentaires :
              </p>
              
              <h3 className="text-lg font-semibold mb-3 text-foreground">4.1 — Modèle Professionnel (B2B)</h3>
              <ul className="space-y-2 list-disc pl-6 mb-6">
                <li><strong>L'Orthophoniste</strong> souscrit un abonnement payant et dispose d'un "Code Pro" unique qu'il transmet à ses patients.</li>
                <li><strong>Le Patient</strong> bénéficie d'un accès gratuit à l'ensemble des fonctionnalités (exercices, analyse spectrale, suivi de progression) grâce au Code Pro fourni par son orthophoniste.</li>
                <li>L'abonnement de l'Orthophoniste inclut un nombre de "comptes patients actifs" (sièges). L'Orthophoniste peut archiver un patient pour libérer un siège.</li>
                <li>En cas de résiliation de l'abonnement par l'Orthophoniste, les patients associés perdent l'accès aux exercices et aux données de suivi.</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3 text-foreground">4.2 — Abonnement Patient Autonome (B2C)</h3>
              <ul className="space-y-2 list-disc pl-6 mb-4">
                <li>Toute personne peut s'inscrire sans Code Pro et bénéficier d'un <strong>essai gratuit de 7 jours</strong> donnant accès à l'intégralité des fonctionnalités.</li>
                <li>À l'issue de l'essai, l'utilisateur peut souscrire un abonnement mensuel au tarif en vigueur (actuellement <strong>9 € TTC / mois</strong>) pour conserver l'accès.</li>
                <li>L'utilisateur autonome peut, à tout moment, rattacher son compte à un orthophoniste via un Code Pro dans les Réglages, ce qui le bascule vers le modèle B2B.</li>
                <li>En cas de non-renouvellement, l'accès aux exercices et aux données de suivi est suspendu.</li>
              </ul>
            </section>

            {/* Article 5 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                5. Prix et Modalités de Paiement
              </h2>
              <p className="mb-4">
                Les prix sont indiqués en Euros (€) toutes taxes comprises (TTC).
              </p>
              <ul className="space-y-3 list-disc pl-6">
                <li>
                  <strong>Abonnement Professionnel (B2B) :</strong> L'Orthophoniste souscrit un abonnement mensuel. Le paiement est exigible immédiatement à la commande, avec reconduction tacite sauf résiliation avant la date d'échéance.
                </li>
                <li>
                  <strong>Abonnement Patient Autonome (B2C) :</strong> Le patient sans Code Pro peut souscrire un abonnement mensuel (actuellement 9 € TTC / mois) après la période d'essai gratuit de 7 jours. L'abonnement est reconduit tacitement chaque mois.
                </li>
                <li>
                  <strong>Sécurisation :</strong> Les transactions sont sécurisées par notre prestataire de paiement certifié PCI-DSS. POCLE ne conserve aucune coordonnée bancaire.
                </li>
              </ul>
            </section>

            {/* Article 6 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                6. Renoncement au Droit de Rétractation
              </h2>
              <p className="mb-4">
                Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats de fourniture d'un contenu numérique non fourni sur un support matériel, dont l'exécution a commencé après accord préalable exprès du consommateur et renoncement exprès à son droit de rétractation.
              </p>
              <p className="font-semibold bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4 text-amber-900 dark:text-amber-200">
                En souscrivant à l'abonnement professionnel et en accédant immédiatement aux fonctionnalités, l'Orthophoniste renonce expressément à son droit de rétractation.
              </p>
            </section>

            {/* Article 7 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                7. Données Personnelles et Santé (RGPD)
              </h2>
              <p className="mb-4">
                La société POCLE attache une importance capitale à la protection de vos données.
              </p>
              <ul className="space-y-2 list-disc pl-6">
                <li>
                  <strong>Enregistrements :</strong> Vos fichiers audio ne sont écoutés par personne d'autre que vous-même et, le cas échéant, votre orthophoniste lié par Code Pro.
                </li>
                <li>
                  <strong>Sécurité :</strong> Les données sont chiffrées en transit et au repos.
                </li>
              </ul>
            </section>

            {/* Article 8 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                8. Responsabilité et Force Majeure
              </h2>
              <p>
                La responsabilité de POCLE ne saurait être engagée en cas de dysfonctionnement du réseau internet, de bugs informatiques ou d'incompatibilité matérielle. En tout état de cause, la responsabilité de la société est limitée au montant payé par le client pour le service sur les 12 derniers mois.
              </p>
            </section>

            {/* Article 9 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                9. Propriété Intellectuelle
              </h2>
              <p>
                Tous les éléments de l'application (textes, codes, graphiques sonores, algorithmes de détection) sont la propriété exclusive de POCLE. Toute reproduction ou rétro-ingénierie est strictement interdite.
              </p>
            </section>

            {/* Article 10 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                10. Droit Applicable et Litiges
              </h2>
              <p>
                Les présentes conditions sont soumises au droit français. En cas de litige, et à défaut d'accord amiable, compétence exclusive est attribuée aux tribunaux du ressort de la Cour d'appel de PARIS.
              </p>
            </section>

          </div>

          {/* Back to Home */}
          <div className="mt-16 text-center border-t border-border pt-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Terms;
