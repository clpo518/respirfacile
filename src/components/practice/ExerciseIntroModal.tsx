import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CategoryIntro {
  icon: string;
  title: string;
  goal: string;
  steps: { emoji: string; text: string }[];
  tip: string;
}

const categoryIntros: Record<string, CategoryIntro> = {
  "slow-reading": {
    icon: "🌱",
    title: "Ralentissement",
    goal: "Apprendre à ralentir votre débit en lisant des textes à voix haute, à un rythme guidé.",
    steps: [
      { emoji: "🎯", text: "Choisissez une vitesse cible" },
      { emoji: "📖", text: "Suivez le texte surligné mot par mot" },
      { emoji: "🎤", text: "Lisez à voix haute en suivant le rythme" },
      { emoji: "🎧", text: "Le retour se met en place après quelques mots — parlez naturellement" },
    ],
    tip: "Le mode guidé vous accompagne — laissez-vous porter par le rythme !",
  },
  "daily-life": {
    icon: "🏠",
    title: "Vie quotidienne",
    goal: "Pratiquer avec des textes du quotidien pour appliquer un débit contrôlé dans des situations réalistes.",
    steps: [
      { emoji: "📖", text: "Lisez le texte de la vie courante" },
      { emoji: "🎤", text: "Enregistrez votre lecture" },
      { emoji: "📊", text: "Observez votre débit en temps réel" },
      { emoji: "🎧", text: "Le retour se met en place après quelques mots — parlez naturellement" },
    ],
    tip: "Imaginez que vous racontez cette histoire à un ami.",
  },
  "articulation": {
    icon: "👄",
    title: "Défis d'articulation",
    goal: "Travailler la précision articulatoire avec des virelangues et des phrases complexes.",
    steps: [
      { emoji: "👀", text: "Lisez d'abord le texte silencieusement" },
      { emoji: "🐢", text: "Commencez lentement, puis accélérez" },
      { emoji: "🎯", text: "Visez la clarté, pas la vitesse" },
    ],
    tip: "La précision est plus importante que la rapidité.",
  },
  "clinical-texts": {
    icon: "🏥",
    title: "Textes Cliniques",
    goal: "Textes standardisés utilisés en orthophonie pour évaluer et suivre vos progrès.",
    steps: [
      { emoji: "📋", text: "Textes étalonnés scientifiquement" },
      { emoji: "🎤", text: "Lisez naturellement à voix haute" },
      { emoji: "📊", text: "Comparez vos résultats dans le temps" },
    ],
    tip: "Lisez comme vous le feriez en consultation.",
  },
  "warmup": {
    icon: "🤸",
    title: "Gymnastique Articulatoire",
    goal: "Échauffer les muscles de la parole avant une séance ou une prise de parole importante.",
    steps: [
      { emoji: "⏱️", text: "Exercices courts et ciblés" },
      { emoji: "🔁", text: "Répétez chaque mouvement plusieurs fois" },
      { emoji: "💪", text: "Sentez les muscles de votre bouche travailler" },
    ],
    tip: "Comme un sportif, un bon échauffement améliore la performance.",
  },
  "improvisation": {
    icon: "💬",
    title: "Improvisation Guidée",
    goal: "Parler librement sur un sujet donné tout en contrôlant votre débit — sans texte à lire.",
    steps: [
      { emoji: "🎲", text: "Un sujet vous est proposé" },
      { emoji: "🎤", text: "Parlez librement pendant 1 à 2 minutes" },
      { emoji: "📊", text: "Votre débit est mesuré en temps réel" },
      { emoji: "🎧", text: "Le retour se met en place après quelques mots — parlez naturellement" },
    ],
    tip: "Il n'y a pas de bonne ou mauvaise réponse — exprimez-vous !",
  },
  "motor-challenges": {
    icon: "⚡",
    title: "Défis Moteurs",
    goal: "Tester votre agilité articulatoire avec des exercices de diadococinésie (répétitions rapides).",
    steps: [
      { emoji: "🔁", text: "Répétez des syllabes le plus vite possible" },
      { emoji: "🎯", text: "Gardez la régularité du rythme" },
      { emoji: "📈", text: "Mesurez votre vitesse articulatoire" },
    ],
    tip: "Régularité > Vitesse. Gardez un rythme stable.",
  },
  "breath-control": {
    icon: "🌬️",
    title: "Gestion du Souffle",
    goal: "Apprendre à gérer votre respiration pour soutenir une parole fluide et posée.",
    steps: [
      { emoji: "🫁", text: "Travaillez l'inspiration abdominale" },
      { emoji: "📖", text: "Lisez de longs passages sur un souffle" },
      { emoji: "⏸️", text: "Marquez les pauses respiratoires" },
    ],
    tip: "Le souffle est le carburant de la parole.",
  },
  "silence-training": {
    icon: "🧘",
    title: "Tolérance au Silence",
    goal: "Apprendre à accepter les pauses en conversation. Deux modes : classique (silence avant de parler) ou interruption (pause imposée en plein discours).",
    steps: [
      { emoji: "🎲", text: "Choisissez un thème et un mode" },
      { emoji: "🤫", text: "Tenez le silence imposé" },
      { emoji: "🗣️", text: "Répondez librement quand c'est votre tour" },
      { emoji: "⚡", text: "Mode interruption : la pause arrive pendant que vous parlez !" },
    ],
    tip: "Une pause de 3 à 5 secondes est perçue comme naturelle par votre interlocuteur.",
  },
  "cognitive-traps": {
    icon: "🧠",
    title: "Pièges Cognitifs",
    goal: "Entraîner votre cerveau à résister à l'accélération face à des textes complexes.",
    steps: [
      { emoji: "🪤", text: "Textes conçus pour vous faire accélérer" },
      { emoji: "🎯", text: "Maintenez votre vitesse cible" },
      { emoji: "💡", text: "Repérez les moments où vous accélérez" },
    ],
    tip: "Le piège est dans la complexité — restez concentré sur le rythme.",
  },
  "auto-controle": {
    icon: "🪞",
    title: "Auto-Contrôle",
    goal: "Développer votre capacité à vous auto-évaluer et corriger votre débit en temps réel.",
    steps: [
      { emoji: "👂", text: "Écoutez-vous parler attentivement" },
      { emoji: "🔄", text: "Ajustez votre débit en direct" },
      { emoji: "📊", text: "Comparez votre perception et les mesures" },
    ],
    tip: "L'objectif est de devenir votre propre coach.",
  },
  "rebus-enfant": {
    icon: "🧒",
    title: "Mode Rébus",
    goal: "Un mode ludique avec des images pour travailler la parole en s'amusant.",
    steps: [
      { emoji: "🖼️", text: "Regardez les images qui forment le mot" },
      { emoji: "🗣️", text: "Dites le mot à voix haute" },
      { emoji: "⭐", text: "Gagnez des étoiles pour chaque réussite" },
    ],
    tip: "Amusez-vous ! Le jeu est le meilleur apprentissage.",
  },
  "teen-life": {
    icon: "🎒",
    title: "Situations Ado",
    goal: "Des textes sur la vie d'ado pour s'entraîner sur des sujets qui vous parlent.",
    steps: [
      { emoji: "📱", text: "Thèmes du quotidien ado" },
      { emoji: "🎤", text: "Lisez à votre rythme" },
      { emoji: "📊", text: "Suivez votre progression" },
    ],
    tip: "C'est votre entraînement, allez-y à votre rythme.",
  },
  "retelling": {
    icon: "📖",
    title: "Récit Résumé",
    goal: "Écouter une histoire, puis la raconter de mémoire. Travaillez la synthèse et la structure du discours.",
    steps: [
      { emoji: "👂", text: "Écoutez attentivement l'histoire" },
      { emoji: "🎤", text: "Racontez-la de mémoire avec vos mots" },
      { emoji: "✅", text: "Un algorithme vérifie si les points clés sont mentionnés" },
    ],
    tip: "Pas besoin de tout retenir — l'essentiel suffit !",
  },
  "dialogue": {
    icon: "💬",
    title: "Mode Dialogue",
    goal: "Parlez librement en conversation tout en surveillant votre débit grâce à un retour visuel discret.",
    steps: [
      { emoji: "⏱️", text: "Choisissez une durée et une vitesse cible" },
      { emoji: "🗣️", text: "Parlez naturellement, comme en conversation" },
      { emoji: "😊", text: "Un émoji vous indique votre rythme en temps réel" },
      { emoji: "🎧", text: "Le retour se met en place après quelques mots — parlez naturellement" },
    ],
    tip: "Le débit est lissé automatiquement pour un retour stable et sans stress.",
  },
  "dialogue-lab": {
    icon: "🔬",
    title: "Labo Dialogue",
    goal: "Analysez votre débit par paquets de mots pour un feedback ultra-précis sur votre rythme.",
    steps: [
      { emoji: "📦", text: "Choisissez la taille du paquet (5, 10, 15 ou 20 mots)" },
      { emoji: "🎤", text: "Parlez librement" },
      { emoji: "📊", text: "Chaque paquet est analysé individuellement" },
    ],
    tip: "Un outil expérimental pour les curieux du détail.",
  },
  "neuro-projection": {
    icon: "📢",
    title: "Projection Vocale",
    goal: "Entraîner l'intensité de votre voix. Essentiel pour les patients Parkinson dont le volume diminue progressivement (hypophonie).",
    steps: [
      { emoji: "🎤", text: "5 secondes de calibration : parlez normalement" },
      { emoji: "📊", text: "Une jauge mesure votre volume en temps réel" },
      { emoji: "📢", text: "Projetez votre voix — visez la zone verte ou bleue" },
      { emoji: "🔁", text: "Maintenez le volume tout au long du texte" },
    ],
    tip: "Imaginez que vous parlez à quelqu'un à 5 mètres. La jauge vous dit si vous êtes entendu !",
  },
  "neuro-articulation": {
    icon: "👄",
    title: "Articulation Exagérée",
    goal: "Travailler la précision des mouvements articulatoires. Adapté à la dysarthrie : exagérez chaque consonne pour renforcer la musculature.",
    steps: [
      { emoji: "👀", text: "Lisez le texte à voix haute, très lentement" },
      { emoji: "👄", text: "Exagérez l'ouverture de la bouche sur chaque syllabe" },
      { emoji: "📢", text: "La jauge de volume vous aide à ne pas murmurer" },
      { emoji: "🔁", text: "Répétez : la précision prime sur la vitesse" },
    ],
    tip: "Le test PA-TA-KA mesure votre coordination motrice — régularité > vitesse.",
  },
  "latence": {
    icon: "⏳",
    title: "Temps de Latence",
    goal: "Apprendre à ne pas se précipiter : imposez-vous une pause de 3 secondes avant de répondre à chaque question.",
    steps: [
      { emoji: "🎯", text: "Choisissez votre vitesse cible avant de démarrer" },
      { emoji: "❓", text: "Une question s'affiche à l'écran" },
      { emoji: "🤫", text: "Attendez au moins 3 secondes avant de parler" },
      { emoji: "🗣️", text: "Répondez librement — votre débit est mesuré en direct" },
      { emoji: "📊", text: "Le bilan affiche vos temps d'attente et votre débit moyen" },
    ],
    tip: "La pause avant de parler est un réflexe à entraîner. Même 3 secondes changent tout !",
  },
  "neuro-coherence": {
    icon: "🧩",
    title: "Cohérence Narrative",
    goal: "Écoutez une histoire courte, puis résumez-la de mémoire. Cet exercice travaille la mémoire de travail, la structuration du discours et la fluence narrative.",
    steps: [
      { emoji: "👂", text: "Écoutez attentivement l'histoire (synthèse vocale)" },
      { emoji: "🔁", text: "Réécoutez si nécessaire" },
      { emoji: "🎤", text: "Résumez avec vos propres mots" },
      { emoji: "✅", text: "L'analyse vérifie les points clés restitués" },
    ],
    tip: "Pas besoin de tout retenir mot à mot — l'essentiel est de retrouver les idées principales dans le bon ordre.",
  },
};

const STORAGE_KEY = "exercise-intro-seen";

function getSeenCategories(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markCategorySeen(categoryId: string) {
  const seen = getSeenCategories();
  seen.add(categoryId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
}

interface ExerciseIntroModalProps {
  categoryId: string | null;
  onDismiss: () => void;
  forceOpen?: boolean;
}

const ExerciseIntroModal = ({ categoryId, onDismiss, forceOpen }: ExerciseIntroModalProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!categoryId) return;
    if (forceOpen) {
      setOpen(true);
      return;
    }
    const seen = getSeenCategories();
    if (!seen.has(categoryId) && categoryIntros[categoryId]) {
      setOpen(true);
    }
  }, [categoryId, forceOpen]);

  const handleClose = () => {
    if (categoryId) markCategorySeen(categoryId);
    setOpen(false);
    onDismiss();
  };

  if (!categoryId || !categoryIntros[categoryId]) return null;

  const intro = categoryIntros[categoryId];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 gap-0">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 pt-8 pb-5 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
            className="text-5xl mb-3"
          >
            {intro.icon}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl font-bold text-foreground"
          >
            {intro.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-sm text-muted-foreground mt-2 leading-relaxed"
          >
            {intro.goal}
          </motion.p>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Comment ça marche
          </p>
          {intro.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50"
            >
              <span className="text-xl flex-shrink-0">{step.emoji}</span>
              <span className="text-sm text-foreground">{step.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Tip + CTA */}
        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
            <span className="text-sm">💡</span>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{intro.tip}</p>
          </div>
          <Button onClick={handleClose} size="lg" className="w-full gap-2">
            C'est parti !
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseIntroModal;
