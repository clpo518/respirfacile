import { useNavigate } from "react-router-dom";
import { Wind } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Objet",
    content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de l'application RespirFacile, accessible à l'adresse www.respirfacile.fr, éditée par RespirFacile SAS.`
  },
  {
    title: "2. Accès au service",
    content: `RespirFacile est accessible gratuitement aux patients disposant d'un code PRO fourni par un professionnel de santé, ou en mode autonome. L'accès professionnel (compte PRO) est soumis à un abonnement payant après une période d'essai de 30 jours.`
  },
  {
    title: "3. Compte utilisateur",
    content: `Vous êtes responsable de la confidentialité de vos identifiants. Vous vous engagez à ne pas partager votre compte et à notifier immédiatement toute utilisation non autorisée à contact@respirfacile.fr.`
  },
  {
    title: "4. Usage médical",
    content: `RespirFacile est un outil d'aide à la rééducation respiratoire. Il ne se substitue pas à un avis médical, un diagnostic ou un traitement prescrit par un professionnel de santé qualifié. En cas de doute sur votre état de santé, consultez votre médecin.`
  },
  {
    title: "5. Propriété intellectuelle",
    content: `Tous les contenus de RespirFacile (exercices, textes, graphismes, code) sont la propriété exclusive de RespirFacile SAS et sont protégés par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite.`
  },
  {
    title: "6. Données personnelles",
    content: `Le traitement de vos données personnelles est régi par notre Politique de Confidentialité, accessible à l'adresse /legal/privacy. Conformément au RGPD, vous disposez de droits d'accès, de rectification et de suppression de vos données.`
  },
  {
    title: "7. Responsabilité",
    content: `RespirFacile SAS ne peut être tenue responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service. Le service est fourni "en l'état" sans garantie d'accessibilité permanente.`
  },
  {
    title: "8. Modification des CGU",
    content: `RespirFacile se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront notifiés par email en cas de modification substantielle. L'utilisation continue du service vaut acceptation des CGU modifiées.`
  },
  {
    title: "9. Droit applicable",
    content: `Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux compétents sont ceux du ressort du siège social de RespirFacile SAS.`
  },
];

const Terms = () => {
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
          <h1 className="font-display text-4xl font-semibold text-foreground mb-2">Conditions Générales d'Utilisation</h1>
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
            <p>Pour toute question : <a href="mailto:contact@respirfacile.fr" className="text-primary hover:underline">contact@respirfacile.fr</a></p>
          </div>
        </div>
      </div>

      <footer className="py-8 px-4 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground">© 2025 RespirFacile</p>
      </footer>
    </div>
  );
};

export default Terms;
