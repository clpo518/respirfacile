"use client";
import { useEffect, useState } from "react";

interface Badge {
  id: string;
  name: string;
  emoji: string;
  earnedAt: string;
}

interface NewBadgeNotificationProps {
  badges: Badge[];
}

export function NewBadgeNotification({ badges }: NewBadgeNotificationProps) {
  const [visible, setVisible] = useState(badges.length > 0);

  useEffect(() => {
    if (badges.length === 0) return;
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, [badges.length]);

  if (!visible || badges.length === 0) return null;

  // Afficher seulement les badges des 7 derniers jours
  const recentBadges = badges.filter((b) => {
    const earnedDate = new Date(b.earnedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - earnedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });

  if (recentBadges.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
        .badge-enter {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .badge-exit {
          animation: slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
      <div className={`badge-enter bg-white rounded-3xl p-6 shadow-2xl border-2 border-yellow-400`}>
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-bounce-slow">🏅</div>
          <div>
            <p className="font-bold text-forest-800">Nouveau badge débloqué !</p>
            <p className="text-sm text-forest-600 mt-1">{recentBadges[0].emoji} {recentBadges[0].name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
