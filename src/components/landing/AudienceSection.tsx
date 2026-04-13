import { motion } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Est-ce que ça remplace un orthophoniste ?",
    answer: "Non, ParlerMoinsVite est un outil complémentaire pour s'entraîner entre les séances. Il est idéalement recommandé et suivi par votre praticien. L'application ne pose pas de diagnostic et ne remplace pas un suivi professionnel."
  },
  {
    question: "C'est quoi le bredouillement ?",
    answer: "Le bredouillement (ou cluttering en anglais) est un trouble de la fluence caractérisé par un débit perçu comme trop rapide et/ou irrégulier, des télescopages de syllabes, et parfois des difficultés à organiser son discours. Contrairement au bégaiement, les personnes qui bredouillent n'en ont souvent pas conscience."
  },
  {
    question: "L'application aide-t-elle aussi pour le bégaiement ?",
    answer: "Oui ! Bien que conçue à l'origine pour le bredouillement, l'application est aussi utile pour travailler la fluence dans le cadre du bégaiement. Les exercices de contrôle du débit, de gestion du souffle et de transfert en dialogue aident à améliorer la fluidité de la parole, en complément d'un suivi orthophonique."
  },
  {
    question: "Pourquoi l'appli me demande mon âge ?",
    answer: "Un enfant, un adolescent et un adulte ne parlent pas à la même vitesse — c'est naturel ! En connaissant votre âge, l'application adapte automatiquement votre objectif de vitesse pour qu'il soit réaliste et personnalisé. Cela évite les \"faux positifs\" frustrants où l'on vous dirait de ralentir alors que vous parlez à une vitesse normale pour votre âge."
  },
  {
    question: "Combien de temps faut-il s'entraîner ?",
    answer: "5 à 10 minutes par jour suffisent pour observer des progrès. La régularité est plus importante que la durée. Nous recommandons des séances courtes mais quotidiennes."
  },
  {
    question: "L'application fonctionne-t-elle hors connexion ?",
    answer: "Non, une connexion internet est nécessaire pour l'analyse vocale en temps réel et la sauvegarde de vos séances. Vos données sont stockées de manière sécurisée."
  },
  {
    question: "Mes enregistrements sont-ils confidentiels ?",
    answer: "Oui, absolument. Vos enregistrements sont chiffrés et accessibles uniquement par vous (et votre orthophoniste si vous le liez à votre compte). Nous ne les utilisons jamais à d'autres fins."
  },
  {
    question: "Mon enfant ne sait pas lire, peut-il utiliser l'appli ?",
    answer: "Oui ! Le mode Rébus utilise des images et des emojis pour guider la parole, sans besoin de lire. Idéal pour les enfants de 4 à 7 ans."
  },
];

export const AudienceSection = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            Questions fréquentes
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Vous avez des questions ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur ParlerMoinsVite et les troubles de la fluence.
          </p>
        </motion.div>
        
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background rounded-xl border border-border/50 px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-left text-lg font-medium hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
