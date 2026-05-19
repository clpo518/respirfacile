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
    answer: "Non, RespirFacile est un outil complémentaire pour s'entraîner entre les séances. Il est prescrit et suivi par votre orthophoniste. L'application ne pose pas de diagnostic et ne remplace pas un suivi professionnel."
  },
  {
    question: "C'est quoi le SAOS ?",
    answer: "Le SAOS (Syndrome d'Apnées Obstructives du Sommeil) est un trouble respiratoire nocturne caractérisé par des pauses de la respiration pendant le sommeil. Il peut provoquer une fatigue chronique, des ronflements et une baisse de la qualité de vie. La rééducation myofonctionnelle — notamment des exercices bucco-faciaux et de respiration nasale — est une approche complémentaire efficace, souvent prescrite par les orthophonistes."
  },
  {
    question: "À quoi servent les exercices myofonctionnels ?",
    answer: "Les exercices myofonctionnels visent à renforcer les muscles de la langue, des lèvres et du voile du palais. Ils améliorent la respiration nasale, réduisent les ronflements et favorisent une meilleure posture linguale au repos. Prescrits par votre orthophoniste, ils complètent idéalement un traitement orthopédique ou une prise en charge SAOS."
  },
  {
    question: "L'application convient-elle aux enfants ?",
    answer: "Oui ! Les exercices peuvent être adaptés aux enfants dès 6 ans, notamment pour la rééducation de la déglutition atypique, la respiration nasale et les troubles myofonctionnels. Votre orthophoniste vous indiquera les exercices appropriés à l'âge et aux besoins de votre enfant."
  },
  {
    question: "Combien de temps faut-il s'entraîner ?",
    answer: "5 à 10 minutes par jour suffisent pour observer des progrès. La régularité est plus importante que la durée. Votre orthophoniste vous indiquera la fréquence recommandée selon votre programme personnalisé."
  },
  {
    question: "L'application fonctionne-t-elle hors connexion ?",
    answer: "Non, une connexion internet est nécessaire pour accéder à vos exercices prescrits et sauvegarder vos séances. Vos données sont stockées de manière sécurisée sur des serveurs hébergés en Europe."
  },
  {
    question: "Mes données sont-elles confidentielles ?",
    answer: "Oui, absolument. Vos données de santé sont chiffrées et accessibles uniquement par vous et votre orthophoniste. Elles sont hébergées en France et ne sont jamais transmises à des tiers ni utilisées à des fins commerciales."
  },
  {
    question: "Comment obtenir un accès à l'application ?",
    answer: "L'accès à RespirFacile se fait via votre orthophoniste. Il ou elle vous remet un code personnel lors de votre suivi. Si votre orthophoniste ne connaît pas encore l'application, nous pouvons le contacter pour vous."
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
            Tout ce que vous devez savoir sur RespirFacile et la rééducation respiratoire.
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
