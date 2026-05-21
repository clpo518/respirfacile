interface WeekData {
  week: string; // "S1", "S2", "S3", "S4"
  sessions: number;
  target: number;
}

/**
 * Calcule les données de progression pour les 4 dernières semaines
 * à partir d'une liste de sessions
 */
export function getWeeklyProgressData(
  sessions: { created_at: string }[]
): WeekData[] {
  const now = new Date();
  const weeks: WeekData[] = [];

  // Parcourir les 4 dernières semaines (actuellement + 3 semaines précédentes)
  for (let i = 3; i >= 0; i--) {
    const weekEndDate = new Date(now);
    weekEndDate.setDate(weekEndDate.getDate() - i * 7);

    const weekStartDate = new Date(weekEndDate);
    weekStartDate.setDate(weekStartDate.getDate() - 6); // 7 jours avant
    weekStartDate.setHours(0, 0, 0, 0);
    weekEndDate.setHours(23, 59, 59, 999);

    // Compter les sessions de cette semaine
    const weekSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.created_at);
      return sessionDate >= weekStartDate && sessionDate <= weekEndDate;
    }).length;

    // Déterminer le label "S1", "S2", etc.
    const weekLabel = `S${4 - i}`;

    weeks.push({
      week: weekLabel,
      sessions: weekSessions,
      target: 5,
    });
  }

  return weeks;
}

/**
 * Récupère les badges gagnés d'un utilisateur
 * Format attendu: Badge[] avec id, name, description, emoji, earned, earnedAt
 */
export function processBadgeData(
  userBadges: { badge_id: string; earned_at: string }[] | null
): Array<{
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  earnedAt?: string;
}> {
  if (!userBadges || userBadges.length === 0) {
    return [];
  }

  return userBadges.map((badge) => {
    // Mapper les IDs de badges vers les métadonnées
    const badgeMetadata: Record<string, { name: string; description: string; emoji: string }> = {
      first_session: {
        name: "Premier souffle",
        description: "1ère séance complétée",
        emoji: "🌟",
      },
      week_1: {
        name: "Semaine 1",
        description: "7 jours d'affilée",
        emoji: "📅",
      },
      pause_20: {
        name: "Pause 20s",
        description: "20 secondes de pause",
        emoji: "⏸️",
      },
      pause_25: {
        name: "Pause 25s",
        description: "25 secondes de pause",
        emoji: "🏆",
      },
      nasale_master: {
        name: "Nez libre",
        description: "10 séances nasales",
        emoji: "👃",
      },
      coherence_30: {
        name: "Rythme parfait",
        description: "30 sessions cohérence",
        emoji: "💓",
      },
      month_1: {
        name: "1 mois",
        description: "30 jours d'engagement",
        emoji: "🎖️",
      },
    };

    const meta = badgeMetadata[badge.badge_id] || {
      name: "Badge inconnu",
      description: "",
      emoji: "⭐",
    };

    return {
      id: badge.badge_id,
      name: meta.name,
      description: meta.description,
      emoji: meta.emoji,
      earned: true,
      earnedAt: badge.earned_at,
    };
  });
}
