"use client";
import { useEffect } from "react";

const BADGE_INFO: Record<string, { name: string; emoji: string }> = {
  first_session: { name: "Premier souffle", emoji: "🌬️" },
  week_1: { name: "Semaine 1", emoji: "🗓️" },
  pause_20: { name: "Pause 20s", emoji: "⏱️" },
  pause_25: { name: "Pause 25s", emoji: "🏆" },
  nasale_master: { name: "Nez libre", emoji: "👃" },
  coherence_30: { name: "Rythme parfait", emoji: "💓" },
  month_1: { name: "1 mois !", emoji: "🎖️" },
};

interface BadgeUnlockToastProps {
  badgeId: string;
  onClose: () => void;
}

export default function BadgeUnlockToast({
  badgeId,
  onClose,
}: BadgeUnlockToastProps) {
  const badge = BADGE_INFO[badgeId] || { name: badgeId, emoji: "🏅" };

  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -16px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4">
        <span className="text-4xl">{badge.emoji}</span>
        <div>
          <p className="text-xs font-medium opacity-80 uppercase tracking-wider">
            Nouveau badge débloqué !
          </p>
          <p className="text-lg font-bold">{badge.name}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 opacity-60 hover:opacity-100 text-xl transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
}
