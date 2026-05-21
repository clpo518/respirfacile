"use client";

import { useState } from "react";

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  earnedAt?: string;
}

interface BadgeDisplayProps {
  userBadges: Badge[];
}

const ALL_BADGES: Badge[] = [
  {
    id: "first_session",
    name: "Premier souffle",
    emoji: "🌟",
    description: "Complétez votre 1ère séance d'exercice.",
    earned: false,
  },
  {
    id: "week_1",
    name: "7 jours de pratique",
    emoji: "📅",
    description: "Pratiquez au moins une fois par jour pendant 7 jours consécutifs.",
    earned: false,
  },
  {
    id: "pause_20",
    name: "Pause 20 secondes",
    emoji: "⏸️",
    description: "Tenez 20 secondes de pause contrôlée lors d'une séance.",
    earned: false,
  },
  {
    id: "pause_25",
    name: "Pause 25 secondes",
    emoji: "🏆",
    description: "Tenez 25 secondes de pause contrôlée, niveau avancé.",
    earned: false,
  },
  {
    id: "nasale_master",
    name: "Nez libre",
    emoji: "👃",
    description: "Complétez 10 séances de respiration nasale.",
    earned: false,
  },
  {
    id: "coherence_30",
    name: "Rythme régulier",
    emoji: "💓",
    description: "Complétez 30 séances de cohérence cardiaque.",
    earned: false,
  },
  {
    id: "month_1",
    name: "1 mois ensemble",
    emoji: "🎖️",
    description: "Pratiquez pendant 30 jours au total depuis votre inscription.",
    earned: false,
  },
];

export function BadgeDisplay({ userBadges }: BadgeDisplayProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  // Fusionner les badges gagnés avec la liste complète
  const badgesWithStatus = ALL_BADGES.map((badge) => {
    const earned = userBadges.find((b) => b.id === badge.id);
    return {
      ...badge,
      earned: !!earned,
      earnedAt: earned?.earnedAt,
    };
  });

  const earnedBadges = badgesWithStatus.filter((b) => b.earned);
  const unlockedBadges = badgesWithStatus.filter((b) => !b.earned);

  return (
    <div className="w-full">
      {/* Section badges gagnés */}
      {earnedBadges.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wide mb-4">
            Badges gagnés ({earnedBadges.length})
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="relative group"
                onMouseEnter={() => setHoveredBadge(badge.id)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <button
                  className="w-full aspect-square rounded-2xl bg-gradient-to-br from-forest-500 to-copper-500 flex items-center justify-center text-3xl shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200"
                  aria-label={badge.name}
                >
                  {badge.emoji}
                </button>

                {/* Tooltip au hover */}
                {hoveredBadge === badge.id && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-forest-800 text-white rounded-xl px-3 py-2 text-xs whitespace-nowrap shadow-lg z-10 animate-in fade-in zoom-in-95 duration-150">
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-forest-200">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-forest-300 text-xs mt-1">
                        {new Date(badge.earnedAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section badges à débloquer */}
      {unlockedBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-forest-700 uppercase tracking-wide mb-4">
            À débloquer ({unlockedBadges.length})
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="relative group"
                onMouseEnter={() => setHoveredBadge(badge.id)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <button
                  className="w-full aspect-square rounded-2xl bg-beige-300 flex items-center justify-center text-3xl opacity-40 hover:opacity-60 transition-opacity duration-200 relative"
                  aria-label={badge.name}
                >
                  {badge.emoji}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-5 h-5 text-forest-700/80" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm-2 15l-5-5 1.41-1.41L10 12.17l7.59-7.59L19 6l-9 9z" />
                    </svg>
                  </div>
                </button>

                {/* Tooltip au hover */}
                {hoveredBadge === badge.id && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-forest-800 text-white rounded-xl px-3 py-2 text-xs whitespace-nowrap shadow-lg z-10 animate-in fade-in zoom-in-95 duration-150">
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-forest-200">{badge.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Si aucun badge */}
      {badgesWithStatus.length === 0 && (
        <div className="text-center py-8 text-forest-500">
          <p className="text-sm">🏅 Chaque exercice complété vous en rapproche. À bientôt, premier badge !</p>
        </div>
      )}
    </div>
  )
}
