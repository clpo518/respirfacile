import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Parlez-vous trop vite ? Comment le savoir ?",
    answer: "Faites notre test vocal gratuit en 30 secondes sur la page Diagnostic. L'application mesure votre débit en Syllabes Par Seconde (SPS) et le compare aux normes cliniques de Van Zaalen adaptées à votre âge.",
  },
  {
    question: "Comment mes patients accèdent-ils à l'application ?",
    answer: "Vos patients créent un compte et entrent votre code Pro unique. Ils apparaissent ensuite dans votre tableau de bord et bénéficient de toutes les fonctionnalités gratuitement.",
  },
  {
    question: "Comment fonctionne l'abonnement Pro ?",
    answer: "Vous bénéficiez de 30 jours d'essai gratuit sans carte bancaire. Ensuite, l'abonnement inclut un nombre de comptes patients actifs (3 ou 5). Vos patients accèdent gratuitement à toutes les fonctionnalités via votre code Pro.",
  },
  {
    question: "L'application est-elle gratuite pour les patients ?",
    answer: "Oui, si votre orthophoniste utilise ParlerMoinsVite, vous accédez gratuitement à toutes les fonctionnalités. Vous pouvez aussi utiliser l'application en autonomie pour 9€/mois.",
  },
  {
    question: "Comment calculez-vous la vitesse de parole ?",
    answer: "Nous utilisons le Taux d'Articulation (SPS) tel que défini par Van Zaalen. Les Syllabes Par Seconde sont calculées en excluant les pauses, ce qui correspond à l'indicateur clinique pertinent pour les troubles de la fluence (bredouillement, tachylalie, bégaiement).",
  },
  {
    question: "L'application aide-t-elle aussi pour le bégaiement ?",
    answer: "Oui ! ParlerMoinsVite est conçu pour l'ensemble des troubles de la fluence. Pour le bégaiement, l'application propose : une analyse de fluence automatique qui détecte les répétitions, blocages et allongements de syllabes ; des exercices de gestion du souffle et de tolérance au silence ; un mode dialogue pour le transfert en situation réelle. L'outil fournit un pourcentage de disfluences et un score de sévérité utilisables en bilan clinique.",
  },
  {
    question: "Les données sont-elles sécurisées ?",
    answer: "Absolument. Toutes les données sont hébergées en Europe, chiffrées, et conformes au RGPD. Seul vous et votre orthophoniste (si lié) avez accès aux enregistrements.",
  },
  {
    question: "Faut-il installer quelque chose ?",
    answer: "Aucune installation n'est nécessaire. ParlerMoinsVite fonctionne directement depuis un navigateur web, sur téléphone, tablette ou ordinateur.",
  },
  {
    question: "Puis-je avoir une démonstration personnalisée ?",
    answer: "Bien sûr ! Envoyez-nous un mail à contact@parlermoinsvite.fr et nous prendrons le temps de vous présenter ParlerMoinsVite en détail.",
  },
];

export const UnifiedFAQ = () => {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Questions fréquentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Tout ce que vous devez savoir sur ParlerMoinsVite
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="text-foreground font-medium">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
