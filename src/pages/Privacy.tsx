import { useNavigate } from "react-router-dom";
import { Wind } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Responsable du traitement",
    content: `RespirFacile SAS est responsable du traitement de vos données personnelles. Contact : contact@respirfacile.fr`
  },
  {
    title: "2. Données collectées",
    content: `Nous collectons : votre adresse email et nom (inscription), votre rôle (patient ou professionnel), vos données de progression (séances réalisées, scores, durées) et votre programme d'exercices. Nous ne collectons pas de données vocales ou audio.`
  },
  {
    title: "3. Finalités du traitement",
    content: `Vos données sont utilisées pour : fournir le service de rééducation respiratoire, permettre le suivi par votre praticien (si applicable), améliorer les exercices et l'expérience utilisateur, et vous envoyer des notifications de progression (avec votre consentement).`
  },
  {
    title: "4. Base légale",
    content: `Le traitement est fondé sur l'exécution du contrat (fourniture du service) et votre consentement pour les communications marketing. Pour les données de santé, le traitement est fondé sur votre consentement explicite lors de l'inscription.`
  },
  {
    title: "5. Hébergement et transfert",
    content: `Vos données sont hébergées en Europe (France) via Supabase. Aucune donnée n'est transférée hors de l'Union Européenne. Nous n'utilisons aucun service d'analyse tiers qui transmettrait vos données personnelles.`
  },
  {
    title: "6. Durée de conservation",
    content: `Vos données sont conservées pendant la durée de votre abonnement ou de votre compte actif, puis 3 ans après la dernière connexion. Vous pouvez demander la suppression immédiate de votre compte à tout moment.`
  },
  {
    title: "7. Vos droits",
    content: `Conformément au RGPD, vous disposez des droits suivants : accès, rectification, suppression ("droit à l'oubli"), portabilité, limitation et opposition au traitement. Pour exercer ces droits : contact@respirfacile.fr`
  },
  {
    title: "8. Cookies",
    content: `Nous utilisons uniquement des cookies strictement nécessaires au fonctionnement du service (session utilisateur) et des cookies analytiques anonymisés (avec votre consentement). Aucun cookie publicitaire.`
  },
  {
    title: "9. Sécurité",
    content: `Les données sont chiffrées en transit (TLS) et au repos. L'accès aux données est restreint selon le principe du moindre privilège. Nous réalisons des audits de sécurité réguliers.`
  },
  {
    title: "10. Contact DPO",
    content: `Pour toute question relative à la protection de vos données : contact@respirfacile.fr. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).`
  },
];

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Wind className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground text-lg">RespirFacile</span>
          </button>
        </div>
      </header>

      <div className="pt-32 pb-24 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">
          <h1 className="font-display text-4xl font-semibold text-foreground mb-2">Politique de Confidentialité</h1>
          <p className="text-sm text-muted-foreground mb-10">Dernière mise à jour : janvier 2025</p>

          <div className="space-y-8">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="font-semibold text-foreground mb-2">{s.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 text-sm text-muted-foreground">
            <p>Questions : <a href="mailto:contact@respirfacile.fr" className="text-primary hover:underline">contact@respirfacile.fr</a></p>
          </div>
        </div>
      </div>

      <footer className="py-8 px-4 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground">© 2025 RespirFacile</p>
      </footer>
    </div>
  );
};

export default Privacy;
