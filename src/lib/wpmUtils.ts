/**
 * WPM Utility functions for smoothing and interpretation
 * Now with SPS (Syllables Per Second) support
 */

import { wpmToSps } from "@/lib/spsUtils";

// Maximum realistic WPM for a human speaker
export const MAX_REALISTIC_WPM = 350;

// Rolling buffer size for smoothing
export const WPM_BUFFER_SIZE = 5;

/**
 * Smooth WPM calculation using a rolling buffer
 */
export function smoothWPM(buffer: number[]): number {
  if (buffer.length === 0) return 0;
  
  // Filter out unrealistic spikes
  const validReadings = buffer.filter(wpm => wpm <= MAX_REALISTIC_WPM && wpm >= 0);
  
  if (validReadings.length === 0) return 0;
  
  const sum = validReadings.reduce((a, b) => a + b, 0);
  return Math.round(sum / validReadings.length);
}

/**
 * Calculate max WPM with spike protection
 * Only accept a new max if it stays high for > 2 readings
 */
export function calculateSafeMaxWPM(history: number[]): number {
  if (history.length === 0) return 0;
  
  // Filter unrealistic values
  const validHistory = history.filter(wpm => wpm <= MAX_REALISTIC_WPM && wpm > 0);
  
  if (validHistory.length === 0) return 0;
  
  // Find the highest value that appears at least 2 times in a 3-reading window
  let safeMax = 0;
  
  for (let i = 0; i < validHistory.length; i++) {
    const wpm = validHistory[i];
    
    // Check if this value (or close to it) appears in nearby readings
    let sustainedCount = 1;
    const tolerance = 20; // 20 WPM tolerance
    
    // Check previous 2 readings
    for (let j = Math.max(0, i - 2); j < i; j++) {
      if (Math.abs(validHistory[j] - wpm) <= tolerance) {
        sustainedCount++;
      }
    }
    
    // Check next 2 readings
    for (let j = i + 1; j <= Math.min(validHistory.length - 1, i + 2); j++) {
      if (Math.abs(validHistory[j] - wpm) <= tolerance) {
        sustainedCount++;
      }
    }
    
    // Only count as max if sustained for at least 2 readings
    if (sustainedCount >= 2 && wpm > safeMax) {
      safeMax = wpm;
    }
  }
  
  // Fallback to simple max if no sustained peak found
  if (safeMax === 0) {
    safeMax = Math.max(...validHistory);
  }
  
  return safeMax;
}

/**
 * Get feedback interpretation based on average WPM (displayed as SPS)
 */
export function getSpeedFeedback(avgWpm: number): {
  title: string;
  description: string;
  emoji: string;
  colorClass: string;
} {
  const sps = wpmToSps(avgWpm);
  
  if (avgWpm === 0) {
    return {
      title: "Séance trop courte",
      description: "Nous n'avons pas capté assez de parole. Réessayez en parlant un peu plus fort.",
      emoji: "⏸️",
      colorClass: "text-muted-foreground"
    };
  }
  
  if (sps < 3.5) {
    return {
      title: "Rythme posé",
      description: "Vous prenez bien votre temps — idéal pour travailler l'articulation.",
      emoji: "🐢",
      colorClass: "text-emerald-600"
    };
  }
  
  if (sps <= 5.5) {
    return {
      title: "Rythme confortable ✨",
      description: "Votre débit est fluide et agréable à écouter. Continuez comme ça !",
      emoji: "✨",
      colorClass: "text-green-600"
    };
  }
  
  if (sps <= 6.5) {
    return {
      title: "Un peu rapide",
      description: "Vous accélérez légèrement — pensez à marquer une pause entre les phrases.",
      emoji: "⚡",
      colorClass: "text-orange-600"
    };
  }
  
  return {
    title: "On ralentit ensemble",
    description: "Votre débit est élevé. Essayez de respirer entre les phrases et d'allonger les pauses.",
    emoji: "🌬️",
    colorClass: "text-red-600"
  };
}

/**
 * Coach Feedback Interface for enriched session analysis
 */
export interface CoachFeedback {
  verdict: {
    title: string;
    description: string;
    emoji: string;
    colorClass: string;
  };
  stability: {
    score: 'excellent' | 'good' | 'warning';
    title: string;
    description: string;
    emoji: string;
  };
  contextualTip: string;
  exerciseReminder?: string;
}

/**
 * Get contextual tip based on exercise category
 */
function getContextualTip(categoryId?: string): string {
  switch (categoryId) {
    case 'slow-reading':
      return "Vous posez de bonnes bases. Les phrases courtes sont vos alliées pour garder un rythme régulier.";
    case 'daily-life':
      return "Essayez d'appliquer ce rythme dans une vraie conversation demain — c'est là que les progrès se consolident.";
    case 'articulation':
    case 'motor-challenges':
      return "La précision prime sur la vitesse. N'hésitez pas à recommencer plus lentement si besoin.";
    case 'improvisation':
      return "Une idée = une phrase. Marquez bien les transitions, et laissez-vous le temps de réfléchir.";
    case 'warmup':
      return "Bon échauffement ! Enchaînez avec un exercice de lecture pour consolider vos acquis.";
    case 'clinical-texts':
      return "Ce texte de référence vous aide à mesurer votre progression au fil du temps.";
    default:
      return "Respirez profondément entre les phrases — c'est le meilleur réflexe pour garder le contrôle.";
  }
}

/**
 * Analyze stability based on avg vs max WPM difference
 */
function getStabilityAnalysis(avgWpm: number, maxWpm: number): CoachFeedback['stability'] {
  if (avgWpm === 0 || maxWpm === 0) {
    return {
      score: 'warning',
      title: "Pas assez de données",
      description: "La séance était trop courte pour évaluer la régularité. Réessayez avec un texte plus long.",
      emoji: "📊"
    };
  }

  const variance = ((maxWpm - avgWpm) / avgWpm) * 100;

  if (variance < 20) {
    return {
      score: 'excellent',
      title: "Rythme très stable 🎯",
      description: `Seulement ${Math.round(variance)}% d'écart — vous gardez bien le contrôle tout au long de la séance.`,
      emoji: "🎯"
    };
  }

  if (variance < 40) {
    return {
      score: 'good',
      title: "Bonne régularité",
      description: `Quelques accélérations détectées (${Math.round(variance)}% d'écart), mais le rythme reste globalement stable.`,
      emoji: "📈"
    };
  }

  return {
    score: 'warning',
    title: "Rythme variable",
    description: `${Math.round(variance)}% d'écart entre votre moyenne et vos pics. Les exercices de respiration peuvent vous aider à stabiliser.`,
    emoji: "🌬️"
  };
}

/**
 * Generate comprehensive coach feedback for a session
 */
export function generateCoachFeedback(
  avgWpm: number,
  maxWpm: number,
  targetWpm?: number,
  categoryId?: string,
  exerciseTip?: string
): CoachFeedback {
  // Get base verdict from existing function
  const baseVerdict = getSpeedFeedback(avgWpm);
  const avgSps = wpmToSps(avgWpm);
  const targetSps = targetWpm ? wpmToSps(targetWpm) : null;
  
  // Enrich verdict with target comparison if available
  let verdictDescription = baseVerdict.description;
  if (targetSps && avgSps > 0) {
    const diff = Math.round((avgSps - targetSps) * 10) / 10;
    if (Math.abs(diff) <= 0.3) {
      verdictDescription = `Objectif atteint ! Vous visiez ${targetSps} syll/sec et avez fait ${avgSps} syll/sec. ${baseVerdict.description}`;
    } else if (diff < 0) {
      verdictDescription = `Vous êtes ${Math.abs(diff)} syll/sec sous votre cible de ${targetSps} syll/sec. ${baseVerdict.description}`;
    } else {
      verdictDescription = `Vous êtes ${diff} syll/sec au-dessus de votre cible de ${targetSps} syll/sec. Essayez de ralentir davantage.`;
    }
  }

  return {
    verdict: {
      ...baseVerdict,
      description: verdictDescription
    },
    stability: getStabilityAnalysis(avgWpm, maxWpm),
    contextualTip: getContextualTip(categoryId),
    exerciseReminder: exerciseTip
  };
}
