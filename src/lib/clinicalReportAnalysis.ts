/**
 * Clinical Report Analysis Module
 * 
 * Aggregates patient data and generates intelligent clinical summaries
 * for the PDF report generator.
 */

import { wpmToSps, SPS_THRESHOLDS } from "./spsUtils";

export interface SessionData {
  id: string;
  created_at: string;
  duration_seconds: number;
  avg_wpm: number;
  max_wpm: number;
  exercise_type?: string | null;
}

export interface PatientProfile {
  id: string;
  full_name: string | null;
  current_streak: number;
  longest_streak: number;
  today_minutes: number;
  target_wpm: number | null;
  created_at: string;
  birth_year?: number | null;
}

export interface ExerciseStats {
  min: number;
  max: number;
  avg: number;
  count: number;
}

export interface ReportOptions {
  recipientDoctor?: string;
  therapistNotes?: string;
  includeEvolutionChart?: boolean;
}

export interface ClinicalAnalysis {
  // Patient Info
  patientName: string;
  patientAge?: number | null;
  followUpSince: string;
  
  // Aggregated Metrics
  totalSessions: number;
  totalPracticeMinutes: number;
  
  // SPS Analysis
  avgSPS: number;
  maxSPS: number;
  minSPS: number;
  
  // Stats by exercise type
  readingStats: ExerciseStats;
  improvisationStats: ExerciseStats;
  warmupStats: ExerciseStats;
  repetitionStats: ExerciseStats;
  liveSessionStats: ExerciseStats;
  neuroProjectionStats: ExerciseStats;
  retellingStats: ExerciseStats;
  
  // Variability
  variabilityScore: number;
  
  // Fluency Analysis
  fluencyRatio: number; // % of sessions below target
  articulatoryRate: number; // Estimated articulation rate (without pauses)
  
  // Trend Analysis
  trendPercentage: number;
  trendDirection: "improving" | "stable" | "regressing";
  
  // Engagement Metrics
  currentStreak: number;
  longestStreak: number;
  weeklyMinutes: number;
  
  // Exercise Breakdown
  readingSessions: number;
  improvisationSessions: number;
  
  // Clinical Interpretations (AI-generated text)
  mainDiagnosis: string;
  fluencyInterpretation: string;
  trendInterpretation: string;
  recommendation: string;
  
  // Report options (from modal)
  recipientDoctor?: string;
  therapistNotes?: string;
  includeEvolutionChart: boolean;
  
  // For chart
  evolutionData: {
    date: string;
    sps: number;
    target: number;
  }[];
}

/**
 * Calculate standard deviation for variability score
 */
function calculateStdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate stats for a specific exercise type
 */
function calculateExerciseStats(sessions: SessionData[], exerciseType: string): ExerciseStats {
  const filtered = sessions.filter(s => 
    exerciseType === "reading" 
      ? (s.exercise_type === "reading" || !s.exercise_type)
      : s.exercise_type === exerciseType
  );
  
  if (filtered.length === 0) {
    return { min: 0, max: 0, avg: 0, count: 0 };
  }
  
  const spsValues = filtered.map(s => wpmToSps(s.avg_wpm));
  const avg = Math.round((spsValues.reduce((a, b) => a + b, 0) / spsValues.length) * 100) / 100;
  
  return {
    min: Math.round(Math.min(...spsValues) * 100) / 100,
    max: Math.round(Math.max(...spsValues) * 100) / 100,
    avg,
    count: filtered.length,
  };
}

/**
 * Generates clinical interpretation text based on SPS thresholds
 */
function generateMainDiagnosis(avgSPS: number, readingStats: ExerciseStats, improvisationStats: ExerciseStats): string {
  if (avgSPS === 0) {
    return "Données insuffisantes pour établir un diagnostic de débit.";
  }
  
  const parts: string[] = [];
  
  if (avgSPS < 3.5) {
    parts.push("Débit articulatoire contrôlé, inférieur à la norme conversationnelle.");
  } else if (avgSPS <= 5.5) {
    parts.push("Débit articulatoire normo-fluent, dans les limites de la norme conversationnelle française (3.5-5.5 syll/s).");
  } else if (avgSPS <= 6.5) {
    parts.push("Débit spontané rapide (> 5.5 syll/s), caractéristique d'une tendance à l'accélération.");
  } else {
    parts.push("Débit spontané caractéristique d'un bredouillement/tachylalie (> 6.5 syll/s).");
  }
  
  // Add range information if available
  if (improvisationStats.count > 0) {
    parts.push(`En parole spontanée : moyenne de ${improvisationStats.avg.toFixed(2)} syll/s, fluctuant entre ${improvisationStats.min.toFixed(2)} et ${improvisationStats.max.toFixed(2)}.`);
  }
  
  if (readingStats.count > 0 && improvisationStats.count > 0) {
    const diff = improvisationStats.avg - readingStats.avg;
    if (Math.abs(diff) > 0.5) {
      if (diff > 0) {
        parts.push("Le débit en improvisation est significativement plus rapide qu'en lecture.");
      } else {
        parts.push("Le débit est paradoxalement plus lent en improvisation qu'en lecture.");
      }
    }
  }
  
  return parts.join(" ");
}

/**
 * Generates fluency interpretation
 */
function generateFluencyInterpretation(fluencyRatio: number, avgSPS: number, variabilityScore: number): string {
  const parts: string[] = [];
  
  if (fluencyRatio >= 80) {
    parts.push(`Excellent contrôle du débit : ${fluencyRatio}% des sessions dans la zone cible.`);
  } else if (fluencyRatio >= 50) {
    parts.push(`Régularité en progression : ${fluencyRatio}% des sessions atteignent l'objectif.`);
  } else if (avgSPS > 5.0) {
    parts.push(`Respiration insuffisante : seulement ${fluencyRatio}% des sessions dans la cible.`);
  } else {
    parts.push(`Variabilité importante du débit : ${fluencyRatio}% de sessions conformes.`);
  }
  
  // Add variability interpretation
  if (variabilityScore > 1.0) {
    parts.push(`Instabilité marquée du débit (écart-type = ${variabilityScore.toFixed(2)} syll/s).`);
  } else if (variabilityScore > 0.5) {
    parts.push(`Variabilité modérée du débit (écart-type = ${variabilityScore.toFixed(2)} syll/s).`);
  } else if (variabilityScore > 0) {
    parts.push(`Bonne stabilité du débit (écart-type = ${variabilityScore.toFixed(2)} syll/s).`);
  }
  
  return parts.join(" ");
}

/**
 * Generates trend interpretation
 */
function generateTrendInterpretation(
  trendDirection: "improving" | "stable" | "regressing",
  trendPercentage: number,
  totalSessions: number
): string {
  if (totalSessions < 4) {
    return "Nombre de sessions insuffisant pour établir une tendance significative.";
  }
  
  if (trendDirection === "improving") {
    return `Progression encourageante avec une régularisation du débit articulatoire de ${Math.abs(trendPercentage).toFixed(0)}% sur la période analysée. Le patron de parole se stabilise progressivement.`;
  }
  
  if (trendDirection === "stable") {
    return "Stabilité du débit articulatoire sur la période analysée. Patron de parole consolidé, maintien des acquis observé.";
  }
  
  return `Légère régression du débit (+${Math.abs(trendPercentage).toFixed(0)}%). Renforcement des techniques de ralentissement et révision des acquis recommandés.`;
}

/**
 * Generates recommendation based on analysis
 */
function generateRecommendation(avgSPS: number, trendDirection: string, fluencyRatio: number, readingStats: ExerciseStats, improvisationStats: ExerciseStats): string {
  const recommendations: string[] = [];
  
  if (avgSPS > 5.0) {
    recommendations.push("Intensifier le travail sur les pauses respiratoires inter-phrastiques et le ralentissement volontaire");
  }
  
  if (avgSPS > 5.5) {
    recommendations.push("Exercices de ralentissement avec retour auditif différé (DAF) recommandés");
  }
  
  if (fluencyRatio < 50) {
    recommendations.push("Augmenter la fréquence des exercices de lecture à voix haute avec métronome interne");
  }
  
  if (trendDirection === "regressing") {
    recommendations.push("Réviser les objectifs thérapeutiques et consolider les acquis avant nouvelle progression");
  }
  
  if (trendDirection === "improving" && fluencyRatio >= 70) {
    recommendations.push("Passage progressif à des exercices d'improvisation et de parole spontanée");
  }
  
  // Specific recommendations based on exercise type differences
  if (readingStats.count > 0 && improvisationStats.count > 0) {
    const diff = improvisationStats.avg - readingStats.avg;
    if (diff > 1.0) {
      recommendations.push("Travail spécifique sur le transfert des acquis de lecture vers la parole spontanée");
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Poursuivre le protocole actuel avec maintien des acquis et généralisation progressive");
  }
  
  return recommendations.join(". ") + ".";
}

/**
 * Main analysis function - aggregates all patient data
 */
export function analyzePatientData(
  sessions: SessionData[],
  profile: PatientProfile,
  options: ReportOptions = {}
): ClinicalAnalysis {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  // Basic counts
  const totalSessions = sortedSessions.length;
  const totalPracticeMinutes = Math.round(
    sortedSessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60
  );
  
  // SPS calculations
  const spsValues = sortedSessions.map(s => wpmToSps(s.avg_wpm));
  const avgSPS = totalSessions > 0 
    ? Math.round((spsValues.reduce((a, b) => a + b, 0) / totalSessions) * 100) / 100
    : 0;
  const maxSPS = totalSessions > 0 ? Math.round(Math.max(...spsValues) * 100) / 100 : 0;
  const minSPS = totalSessions > 0 ? Math.round(Math.min(...spsValues.filter(s => s > 0)) * 100) / 100 : 0;
  
  // Calculate stats by exercise type
  const readingStats = calculateExerciseStats(sortedSessions, "reading");
  const improvisationStats = calculateExerciseStats(sortedSessions, "improvisation");
  const warmupStats = calculateExerciseStats(sortedSessions, "warmup");
  const repetitionStats = calculateExerciseStats(sortedSessions, "repetition");
  const liveSessionStats = calculateExerciseStats(sortedSessions, "live_session");
  const neuroProjectionStats = calculateExerciseStats(sortedSessions, "neuro_projection");
  const retellingStats = calculateExerciseStats(sortedSessions, "retelling");
  
  // Variability score (standard deviation)
  const variabilityScore = Math.round(calculateStdDev(spsValues) * 100) / 100;
  
  // Target threshold (default 4.5 SPS = ~150 WPM)
  const targetSPS = profile.target_wpm ? wpmToSps(profile.target_wpm) : 4.5;
  
  // Fluency ratio (% of sessions at or below target)
  const sessionsInTarget = sortedSessions.filter(s => wpmToSps(s.avg_wpm) <= targetSPS).length;
  const fluencyRatio = totalSessions > 0 
    ? Math.round((sessionsInTarget / totalSessions) * 100)
    : 0;
  
  // Estimated articulatory rate (without pauses) - typically 1.2x the speaking rate
  const articulatoryRate = Math.round(avgSPS * 1.2 * 100) / 100;
  
  // Trend analysis (compare first third vs last third)
  let trendPercentage = 0;
  let trendDirection: "improving" | "stable" | "regressing" = "stable";
  
  if (sortedSessions.length >= 4) {
    const thirdLength = Math.floor(sortedSessions.length / 3);
    const firstThird = sortedSessions.slice(0, thirdLength);
    const lastThird = sortedSessions.slice(-thirdLength);
    
    const firstThirdAvg = firstThird.reduce((acc, s) => acc + s.avg_wpm, 0) / firstThird.length;
    const lastThirdAvg = lastThird.reduce((acc, s) => acc + s.avg_wpm, 0) / lastThird.length;
    
    const firstSPS = wpmToSps(firstThirdAvg);
    const lastSPS = wpmToSps(lastThirdAvg);
    
    trendPercentage = firstSPS > 0 
      ? ((firstSPS - lastSPS) / firstSPS) * 100 
      : 0;
    
    if (trendPercentage > 5) {
      trendDirection = "improving"; // Lower SPS = improvement
    } else if (trendPercentage < -5) {
      trendDirection = "regressing";
    }
  }
  
  // Exercise breakdown
  const readingSessions = readingStats.count;
  const improvisationSessions = improvisationStats.count;
  
  // Weekly minutes (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyMinutes = Math.round(
    sortedSessions
      .filter(s => new Date(s.created_at) >= oneWeekAgo)
      .reduce((acc, s) => acc + s.duration_seconds, 0) / 60
  );
  
  // Evolution data for chart (last 10 sessions)
  const recentSessions = sortedSessions.slice(-10);
  const evolutionData = recentSessions.map(s => ({
    date: new Date(s.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    sps: wpmToSps(s.avg_wpm),
    target: targetSPS,
  }));
  
  // Calculate patient age
  const patientAge = profile.birth_year 
    ? new Date().getFullYear() - profile.birth_year
    : null;
  
  // Generate interpretations
  const mainDiagnosis = generateMainDiagnosis(avgSPS, readingStats, improvisationStats);
  const fluencyInterpretation = generateFluencyInterpretation(fluencyRatio, avgSPS, variabilityScore);
  const trendInterpretation = generateTrendInterpretation(trendDirection, trendPercentage, totalSessions);
  const recommendation = generateRecommendation(avgSPS, trendDirection, fluencyRatio, readingStats, improvisationStats);
  
  return {
    patientName: profile.full_name || "Patient",
    patientAge,
    followUpSince: new Date(profile.created_at).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    totalSessions,
    totalPracticeMinutes,
    avgSPS,
    maxSPS,
    minSPS,
    readingStats,
    improvisationStats,
    warmupStats,
    repetitionStats,
    liveSessionStats,
    neuroProjectionStats,
    retellingStats,
    variabilityScore,
    fluencyRatio,
    articulatoryRate,
    trendPercentage,
    trendDirection,
    currentStreak: profile.current_streak,
    longestStreak: profile.longest_streak,
    weeklyMinutes,
    readingSessions,
    improvisationSessions,
    mainDiagnosis,
    fluencyInterpretation,
    trendInterpretation,
    recommendation,
    recipientDoctor: options.recipientDoctor,
    therapistNotes: options.therapistNotes,
    includeEvolutionChart: options.includeEvolutionChart ?? true,
    evolutionData,
  };
}

/**
 * Get color for SPS value (for PDF styling)
 */
export function getSPSColor(sps: number): "green" | "orange" | "red" | "gray" {
  if (sps === 0) return "gray";
  if (sps <= SPS_THRESHOLDS.optimal) return "green";
  if (sps <= SPS_THRESHOLDS.tachylalia) return "orange";
  return "red";
}

/**
 * Get interpretation label
 */
export function getSPSInterpretation(sps: number): string {
  if (sps === 0) return "—";
  if (sps < 3.5) return "Lent (contrôlé)";
  if (sps <= 5.5) return "Normo-fluent";
  if (sps <= 6.5) return "Rapide";
  return "Tachylalie";
}

/**
 * Generate a plain text report from the clinical analysis
 */
export function generateTextReport(analysis: ClinicalAnalysis, therapistName?: string): string {
  const lines: string[] = [];
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const divider = "─".repeat(52);
  const doubleDivider = "═".repeat(52);

  // Header
  lines.push(doubleDivider);
  lines.push("");
  lines.push("    BILAN DE SUIVI ORTHOPHONIQUE");
  lines.push("    Analyse instrumentale du débit articulatoire");
  lines.push("");
  lines.push(doubleDivider);
  lines.push("");
  lines.push(`  Date du bilan     ${date}`);
  if (therapistName) {
    lines.push(`  Praticien          ${therapistName}`);
  }
  if (analysis.recipientDoctor) {
    lines.push(`  Destinataire       Dr ${analysis.recipientDoctor}`);
  }
  lines.push("");

  // Section 1: Patient Info
  lines.push(divider);
  lines.push("  1 · INFORMATIONS PATIENT");
  lines.push(divider);
  lines.push("");
  lines.push(`  Patient            ${analysis.patientName}`);
  if (analysis.patientAge) {
    lines.push(`  Âge                ${analysis.patientAge} ans`);
  }
  lines.push(`  Suivi depuis       ${analysis.followUpSince}`);
  lines.push("");

  // Section 2: Summary - Key metrics in a clean grid
  lines.push(divider);
  lines.push("  2 · RÉSUMÉ DU SUIVI");
  lines.push(divider);
  lines.push("");
  lines.push(`  ┌────────────────────────┬────────────────────────┐`);
  lines.push(`  │  Sessions              │  ${String(analysis.totalSessions).padEnd(20)} │`);
  lines.push(`  │  Minutes de pratique   │  ${String(analysis.totalPracticeMinutes).padEnd(20)} │`);
  lines.push(`  │  Série en cours        │  ${String(analysis.currentStreak + " jours").padEnd(20)} │`);
  lines.push(`  │  Sessions dans cible   │  ${String(analysis.fluencyRatio + "%").padEnd(20)} │`);
  lines.push(`  └────────────────────────┴────────────────────────┘`);
  lines.push("");

  // Section 3: Articulation Rate Measurements
  lines.push(divider);
  lines.push("  3 · MESURES DU DÉBIT ARTICULATOIRE");
  lines.push(divider);
  lines.push("");
  lines.push("  Situation                  Min      Moy      Max      Norme");
  lines.push("  ·························  ·····    ·····    ·····    ·········");

  const exerciseRows: { stats: ExerciseStats; label: string; norm: string }[] = [
    { stats: analysis.readingStats, label: "Lecture", norm: "3.5 – 5.5" },
    { stats: analysis.improvisationStats, label: "Parole spontanée", norm: "4.0 – 6.0" },
    { stats: analysis.warmupStats, label: "Échauffement", norm: "3.5 – 5.5" },
    { stats: analysis.repetitionStats, label: "Répétition", norm: "3.5 – 5.5" },
    { stats: analysis.retellingStats, label: "Récit résumé", norm: "4.0 – 5.5" },
    { stats: analysis.liveSessionStats, label: "Session en séance", norm: "4.0 – 6.0" },
    { stats: analysis.neuroProjectionStats, label: "Projection vocale", norm: "—" },
  ];

  for (const row of exerciseRows) {
    if (row.stats.count > 0) {
      const padLabel = `${row.label} (${String(row.stats.count).padStart(2)})`.padEnd(28);
      lines.push(`  ${padLabel} ${row.stats.min.toFixed(2).padStart(5)}    ${row.stats.avg.toFixed(2).padStart(5)}    ${row.stats.max.toFixed(2).padStart(5)}    ${row.norm}`);
    }
  }

  lines.push("");
  lines.push(`  Vitesse d'articulation*    ${analysis.articulatoryRate.toFixed(2)} syll/s   (norme : 5.0 – 6.5)`);
  lines.push("  * Estimée selon Van Zaalen (débit hors pauses)");
  lines.push("");

  // Section 4: Regularity Analysis
  lines.push(divider);
  lines.push("  4 · ANALYSE DE LA RÉGULARITÉ");
  lines.push(divider);
  lines.push("");
  // Wrap long text with indentation
  wrapText(analysis.mainDiagnosis, 48).forEach(l => lines.push(`  ${l}`));
  lines.push("");
  wrapText(analysis.fluencyInterpretation, 48).forEach(l => lines.push(`  ${l}`));
  lines.push("");

  // Section 5: Evolution
  lines.push(divider);
  lines.push("  5 · ÉVOLUTION");
  lines.push(divider);
  lines.push("");
  wrapText(analysis.trendInterpretation, 48).forEach(l => lines.push(`  ${l}`));
  lines.push("");

  // Section 6: Therapist Notes
  let nextSection = 6;
  if (analysis.therapistNotes) {
    lines.push(divider);
    lines.push(`  ${nextSection} · OBSERVATIONS DU PRATICIEN`);
    lines.push(divider);
    lines.push("");
    wrapText(analysis.therapistNotes, 48).forEach(l => lines.push(`  ${l}`));
    lines.push("");
    nextSection++;
  }

  // Recommendations
  lines.push(divider);
  lines.push(`  ${nextSection} · PISTES DE TRAVAIL SUGGÉRÉES`);
  lines.push(divider);
  lines.push("");
  const recommendations = analysis.recommendation.split(". ");
  recommendations.forEach(rec => {
    if (rec.trim()) {
      const text = `${rec.trim()}${rec.endsWith(".") ? "" : "."}`;
      const wrapped = wrapText(text, 46);
      lines.push(`  → ${wrapped[0]}`);
      wrapped.slice(1).forEach(l => lines.push(`    ${l}`));
    }
  });
  lines.push("");

  // Footer
  lines.push(doubleDivider);
  lines.push("");
  lines.push("  Ce document constitue une aide instrumentale à");
  lines.push("  la mesure du débit articulatoire. Il ne se");
  lines.push("  substitue pas au diagnostic clinique.");
  lines.push("");
  lines.push("  Généré via ParlerMoinsVite.fr");
  lines.push("");
  lines.push(doubleDivider);

  return lines.join("\n");
}

/**
 * Wrap text to a maximum width
 */
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
