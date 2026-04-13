import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Trash2, Cookie } from "lucide-react";
import { motion } from "framer-motion";

const Privacy = () => {
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
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-display font-bold">Confidentialité</span>
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
              Politique de Confidentialité
            </h1>
            <p className="text-muted-foreground">
              Mise à jour : Janvier 2026
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-10">
            <p className="text-foreground/90 leading-relaxed">
              Chez <strong>ParlerMoinsVite</strong>, la protection de vos données personnelles est une priorité absolue. 
              Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons 
              vos informations, en particulier vos <strong>enregistrements vocaux</strong>, conformément au Règlement Général 
              sur la Protection des Données (RGPD).
            </p>
          </div>

          {/* Legal Content */}
          <div className="space-y-10 text-foreground/90 leading-relaxed">
            
            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  1. Collecte des Données
                </h2>
              </div>
              <p className="mb-4">
                Dans le cadre de l'utilisation de notre application, nous collectons les données suivantes :
              </p>
              <ul className="space-y-3 list-none pl-0">
                <li className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong>Données d'identification :</strong> Adresse email et nom (pour la création et la gestion de votre compte).
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong>Enregistrements vocaux :</strong> Fichiers audio créés lors des exercices d'entraînement actifs.
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <strong>Données de progression :</strong> Statistiques de vitesse (MPM), durée des sessions, historique d'entraînement.
                  </div>
                </li>
              </ul>
              
              <div className="mt-6 bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700 rounded-xl p-4">
                <p className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Engagement de confidentialité
                </p>
                <p className="text-green-900 dark:text-green-200 mt-2">
                  Vos enregistrements vocaux sont stockés de manière sécurisée et ne sont <strong>JAMAIS</strong> utilisés 
                  à des fins publicitaires, de marketing, ou de revente à des tiers. Ils ne servent qu'à votre entraînement personnel.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  2. Usage des Données Vocales
                </h2>
              </div>
              <p className="mb-4">
                Vos fichiers audio sont utilisés <strong>exclusivement</strong> pour les finalités suivantes :
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-semibold mb-2">Feedback visuel</h3>
                  <p className="text-sm text-muted-foreground">
                    Générer la forme d'onde et l'analyse spectrale pour visualiser votre débit.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎧</span>
                  </div>
                  <h3 className="font-semibold mb-2">Réécoute personnelle</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous permettre de réécouter vos sessions pour analyser votre progression.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">👩‍⚕️</span>
                  </div>
                  <h3 className="font-semibold mb-2">Suivi orthophonique</h3>
                  <p className="text-sm text-muted-foreground">
                    Permettre l'écoute par votre orthophoniste lié (si vous avez entré un Code Pro).
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground italic">
                Note : Seul l'orthophoniste que vous avez explicitement lié via un Code Pro peut accéder à vos enregistrements. 
                Aucun autre professionnel ou employé de POCLE n'y a accès.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  3. Partage des Données
                </h2>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl p-4 mb-4">
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  🔒 Nous ne vendons JAMAIS vos données.
                </p>
              </div>
              <p className="mb-4">
                Le partage de données est strictement limité aux cas suivants :
              </p>
              <ul className="space-y-2 list-disc pl-6">
                <li>
                  <strong>Sous-traitants techniques :</strong> Nos partenaires d'hébergement (Supabase, hébergé en Europe) 
                  qui respectent le RGPD et garantissent la sécurité des données.
                </li>
                <li>
                  <strong>Obligations légales :</strong> En cas de demande d'une autorité judiciaire compétente.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  4. Vos Droits (RGPD)
                </h2>
              </div>
              <p className="mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">✅ Droit d'accès</h3>
                  <p className="text-sm text-muted-foreground">
                    Demander une copie de toutes les données que nous détenons sur vous.
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">✅ Droit de rectification</h3>
                  <p className="text-sm text-muted-foreground">
                    Modifier ou corriger vos informations personnelles.
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">✅ Droit à l'effacement</h3>
                  <p className="text-sm text-muted-foreground">
                    Demander la suppression intégrale de votre compte et de vos enregistrements.
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">✅ Droit à la portabilité</h3>
                  <p className="text-sm text-muted-foreground">
                    Recevoir vos données dans un format structuré et lisible.
                  </p>
                </div>
              </div>
              <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p>
                  Pour exercer vos droits, contactez-nous à : 
                  <a href="mailto:contact@parlermoinsvite.fr" className="text-primary font-semibold hover:underline ml-1">
                    contact@parlermoinsvite.fr
                  </a>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Nous répondrons à votre demande dans un délai maximum de 30 jours.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-serif font-semibold text-foreground">
                  5. Cookies
                </h2>
              </div>
              <p className="mb-4">
                Notre application utilise uniquement les cookies suivants :
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-3 text-left font-semibold">Type</th>
                      <th className="border border-border p-3 text-left font-semibold">Finalité</th>
                      <th className="border border-border p-3 text-left font-semibold">Durée</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3">Cookies de session</td>
                      <td className="border border-border p-3">Maintenir votre connexion active</td>
                      <td className="border border-border p-3">Session</td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="border border-border p-3">Cookies d'authentification</td>
                      <td className="border border-border p-3">Sécuriser votre compte</td>
                      <td className="border border-border p-3">30 jours</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Cookies de préférences</td>
                      <td className="border border-border p-3">Mémoriser vos réglages (thème, langue)</td>
                      <td className="border border-border p-3">1 an</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Nous n'utilisons pas de cookies publicitaires ou de tracking marketing.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                6. Sécurité des Données
              </h2>
              <p className="mb-4">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
              </p>
              <ul className="space-y-2 list-disc pl-6">
                <li><strong>Chiffrement :</strong> Toutes les données sont chiffrées en transit (HTTPS/TLS) et au repos.</li>
                <li><strong>Accès restreint :</strong> Seuls les systèmes automatisés accèdent aux enregistrements pour le traitement.</li>
                <li><strong>Hébergement européen :</strong> Vos données sont hébergées dans l'Union Européenne.</li>
                <li><strong>Sauvegardes :</strong> Des sauvegardes régulières garantissent la disponibilité de vos données.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-serif font-semibold mb-4 text-foreground">
                7. Contact
              </h2>
              <p className="mb-4">
                Pour toute question relative à cette politique de confidentialité ou à vos données personnelles, 
                vous pouvez nous contacter :
              </p>
              <div className="bg-card border border-border rounded-xl p-6">
                <p><strong>POCLE SAS</strong></p>
                <p>21 B RUE DU SIMPLON, 75018 PARIS</p>
                <p className="mt-2">
                  Email : <a href="mailto:contact@parlermoinsvite.fr" className="text-primary hover:underline">contact@parlermoinsvite.fr</a>
                </p>
              </div>
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

export default Privacy;
