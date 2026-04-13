/**
 * Per-exercise-type bilan configuration.
 * Controls what's shown / hidden on the SessionDetail page.
 *
 * Copywriting rules:
 *  – Vouvoiement formel ("vous") dans tous les conseils
 *  – Ton encourageant, cliniquement exact mais accessible
 *  – "Mots d'appui" (jamais "mots parasites")
 *  – "Séance" (jamais "session")
 *  – "Oral libre" (jamais "improvisation")
 */

export interface ExerciseBilanConfig {
  emoji: string;
  label: string;
  /** Sous-titre affiché sous le badge — une phrase courte */
  subtitle: string;
  /** Show average speed KPI card */
  showSpeedKPI: boolean;
  /** Show max acceleration KPI card */
  showMaxSpeedKPI: boolean;
  /** Show word count KPI card */
  showWordCount: boolean;
  /** Show speed compliance bar */
  showCompliance: boolean;
  /** Show filler card */
  showFillers: boolean;
  /** Show disfluency heatmap / toggle */
  showDisfluency: boolean;
  /** Show coach bilan (AI feedback) */
  showCoachBilan: boolean;
  /** Custom pedagogical tip shown at bottom */
  tip: string;
  /** Completion message for non-speed exercises */
  completionMessage?: string;
}

const configs: Record<string, ExerciseBilanConfig> = {
  reading: {
    emoji: "📖",
    label: "Lecture",
    subtitle: "Contrôle du débit en lecture à voix haute",
    showSpeedKPI: true,
    showMaxSpeedKPI: true,
    showWordCount: true,
    showCompliance: true,
    showFillers: true,
    showDisfluency: true,
    showCoachBilan: true,
    tip: "Relire le même texte plusieurs fois permet d'automatiser un débit régulier. Observez votre courbe : elle devrait s'aplatir au fil des passages.",
  },
  improvisation: {
    emoji: "🎤",
    label: "Oral libre",
    subtitle: "Parole spontanée sans support de lecture",
    showSpeedKPI: true,
    showMaxSpeedKPI: true,
    showWordCount: true,
    showCompliance: true,
    showFillers: true,
    showDisfluency: true,
    showCoachBilan: true,
    tip: "En parole spontanée, les mots d'appui (euh, ben, en fait…) sont naturels. L'objectif est de les réduire progressivement, pas de les supprimer.",
  },
  warmup: {
    emoji: "🫁",
    label: "Échauffement",
    subtitle: "Préparation vocale et articulatoire",
    showSpeedKPI: true,
    showMaxSpeedKPI: false,
    showWordCount: false,
    showCompliance: false,
    showFillers: false,
    showDisfluency: false,
    showCoachBilan: true,
    tip: "2 minutes d'échauffement avant une prise de parole importante suffisent à détendre votre appareil vocal et poser votre débit.",
  },
  repetition: {
    emoji: "🔁",
    label: "Répétition",
    subtitle: "Ancrage des automatismes par la reprise",
    showSpeedKPI: true,
    showMaxSpeedKPI: true,
    showWordCount: true,
    showCompliance: true,
    showFillers: false,
    showDisfluency: true,
    showCoachBilan: true,
    tip: "Chaque passage renforce les circuits du débit maîtrisé. Comparez vos résultats d'un passage à l'autre pour mesurer vos progrès.",
  },
  rebus: {
    emoji: "🧩",
    label: "Rébus",
    subtitle: "Travail des pauses grâce aux emojis",
    showSpeedKPI: true,
    showMaxSpeedKPI: false,
    showWordCount: false,
    showCompliance: true,
    showFillers: false,
    showDisfluency: false,
    showCoachBilan: true,
    tip: "Chaque emoji est une invitation à marquer une vraie pause respiratoire. Avec le temps, ces pauses deviendront naturelles dans votre parole quotidienne.",
  },
  neurologie: {
    emoji: "🧠",
    label: "Cohérence narrative",
    subtitle: "Rééducation neurologique avec biofeedback",
    showSpeedKPI: true,
    showMaxSpeedKPI: true,
    showWordCount: true,
    showCompliance: true,
    showFillers: true,
    showDisfluency: true,
    showCoachBilan: true,
    tip: "Maintenir un débit régulier renforce les connexions entre pensée et parole. Concentrez-vous sur la clarté plutôt que sur la rapidité.",
  },
  proprioception: {
    emoji: "🧘",
    label: "Tolérance au silence",
    subtitle: "Apprivoiser les pauses et le silence",
    showSpeedKPI: false,
    showMaxSpeedKPI: false,
    showWordCount: false,
    showCompliance: false,
    showFillers: false,
    showDisfluency: false,
    showCoachBilan: false,
    tip: "Le silence n'est pas un vide, c'est un outil. Il permet à votre cerveau de structurer vos idées et réduit la précipitation.",
    completionMessage: "Vous avez appris à accueillir le silence. C'est un pas important vers une parole plus posée.",
  },
  silence: {
    emoji: "🧘",
    label: "Tolérance au silence",
    subtitle: "Apprivoiser les pauses et le silence",
    showSpeedKPI: false,
    showMaxSpeedKPI: false,
    showWordCount: false,
    showCompliance: false,
    showFillers: false,
    showDisfluency: false,
    showCoachBilan: false,
    tip: "Le silence n'est pas un vide, c'est un outil. Il permet à votre cerveau de structurer vos idées et réduit la précipitation.",
    completionMessage: "Vous avez appris à accueillir le silence. C'est un pas important vers une parole plus posée.",
  },
  live_session: {
    emoji: "📡",
    label: "Séance en cabinet",
    subtitle: "Enregistrement réalisé avec votre orthophoniste",
    showSpeedKPI: true,
    showMaxSpeedKPI: true,
    showWordCount: true,
    showCompliance: true,
    showFillers: true,
    showDisfluency: true,
    showCoachBilan: false,
    tip: "Les données de cette séance sont partagées avec votre orthophoniste. Elles enrichissent votre suivi clinique.",
  },
  dialogue: {
    emoji: "💬",
    label: "Dialogue",
    subtitle: "Entraînement conversationnel guidé",
    showSpeedKPI: true,
    showMaxSpeedKPI: true,
    showWordCount: true,
    showCompliance: true,
    showFillers: true,
    showDisfluency: true,
    showCoachBilan: true,
    tip: "Le dialogue est l'exercice le plus proche de la vie réelle. Appliquer un débit maîtrisé ici, c'est le transférer au quotidien.",
  },
  // retelling and latence are handled separately with their own full custom bilans
};

const defaultConfig: ExerciseBilanConfig = configs.reading;

export function getExerciseBilanConfig(exerciseType: string | null | undefined): ExerciseBilanConfig {
  if (exerciseType && exerciseType in configs) {
    return configs[exerciseType];
  }
  return defaultConfig;
}
