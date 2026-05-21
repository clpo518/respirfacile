"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface TrialBannerProps {
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
  userRole?: string | null;
}

export function TrialBanner({ trialEndsAt, subscriptionStatus, userRole }: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check localStorage for dismissed banner
    const dismissedAt = localStorage.getItem("trialbanner_dismissed_at");
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt).getTime();
      const now = new Date().getTime();
      const hoursElapsed = (now - dismissedTime) / (1000 * 60 * 60);
      if (hoursElapsed < 24) {
        setIsVisible(false);
        return;
      }
    }
  }, []);

  // Ne pas afficher si pas en essai
  if (subscriptionStatus !== "trialing" || !trialEndsAt) {
    return null;
  }

  // Ne pas afficher si pas therapist/kine
  if (userRole !== "therapist" && userRole !== "kine") {
    return null;
  }

  const trialEndDate = new Date(trialEndsAt);
  const today = new Date();
  const daysRemaining = Math.ceil(
    (trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Ne pas afficher si essai déjà expiré
  if (daysRemaining < 0) {
    return null;
  }

  if (!isMounted || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem("trialbanner_dismissed_at", new Date().toISOString());
    setIsVisible(false);
  };

  // Bannière orange si moins de 7 jours
  if (daysRemaining <= 7) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-copper-500 text-white px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm font-medium">
            ⏰ Essai gratuit : {daysRemaining} jour{daysRemaining > 1 ? "s" : ""} restant{daysRemaining > 1 ? "s" : ""} —
            <Link
              href="/pricing"
              className="ml-1 underline font-semibold hover:opacity-90 transition-opacity"
            >
              Voir les plans
            </Link>
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:opacity-80 transition-opacity flex-shrink-0"
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  // Bannière verte discrète si plus de 7 jours
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-sage-400/20 border-b border-sage-400/50 text-forest-700 px-4 py-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs font-medium">
        <span>✓ Essai gratuit, {daysRemaining} jours restants</span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/pricing"
          className="text-xs underline hover:opacity-80 transition-opacity"
        >
          Voir les plans
        </Link>
        <button
          onClick={handleDismiss}
          className="p-1 hover:opacity-80 transition-opacity"
          aria-label="Fermer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
   
    </div>
  )
}
