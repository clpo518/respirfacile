"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { JOKERS_PER_WEEK, computeStreak, streakMessage, type StreakResult } from "@/lib/streak";

interface StreakDisplayProps {
  userId: string;
}

export function StreakDisplay({ userId }: StreakDisplayProps) {
  const [result, setResult] = useState<StreakResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("sessions")
          .select("created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(400);

        if (error || !data) {
          setResult(computeStreak([]));
          return;
        }
        setResult(computeStreak(data.map((s) => s.created_at)));
      } catch {
        setResult(computeStreak([]));
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [userId]);

  if (loading || !result) {
    return <div className="h-24 bg-beige-100 rounded-3xl border border-beige-300 animate-pulse" />;
  }

  const { current, jokersLeftThisWeek, jokerDays } = result;

  return (
    <div className="bg-beige-100 rounded-3xl border border-beige-300 shadow-beige p-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-forest-500/10 border border-forest-500/20 flex items-center justify-center text-2xl flex-shrink-0">
          {current > 0 ? "🔥" : "🌱"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-2xl font-bold text-forest-800">
            {current} jour{current > 1 ? "s" : ""} de suite
          </p>
          <p className="text-sm text-forest-500 mt-0.5">{streakMessage(result)}</p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-beige-300 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-forest-700">
            Jokers de la semaine : {jokersLeftThisWeek} sur {JOKERS_PER_WEEK}
          </p>
          <p className="text-xs text-forest-400 mt-0.5">
            {jokerDays > 0
              ? "Un jour sans séance ne casse pas votre série."
              : "Deux jours sans séance par semaine sont couverts d'office."}
          </p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0" aria-hidden="true">
          {Array.from({ length: JOKERS_PER_WEEK }).map((_, index) => (
            <span
              key={index}
              className={`w-2.5 h-2.5 rounded-full ${
                index < jokersLeftThisWeek ? "bg-forest-500" : "bg-beige-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
