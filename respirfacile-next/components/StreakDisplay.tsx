"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface StreakDisplayProps {
  userId: string;
}

export function StreakDisplay({ userId }: StreakDisplayProps) {
  const [streak, setStreak] = useState<number>(0);
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
          .limit(60);

        if (error || !data || data.length === 0) {
          setStreak(0);
          setLoading(false);
          return;
        }

        // Calcul streak : jours consécutifs depuis aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = new Set(
          data.map((s) => {
            const d = new Date(s.created_at);
            d.setHours(0, 0, 0, 0);
            return d.getTime();
          })
        );

        let count = 0;
        let check = new Date(today);
        while (days.has(check.getTime())) {
          count++;
          check.setDate(check.getDate() - 1);
        }
        setStreak(count);
      } catch (_) {
        setStreak(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-copper-50 to-orange-50 border border-copper-200 rounded-2xl p-6 text-center animate-pulse">
        <div className="h-10 w-16 bg-copper-200 rounded mx-auto mb-2" />
        <div className="h-4 w-32 bg-copper-100 rounded mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-copper-50 to-orange-50 border border-copper-200 rounded-2xl p-6 text-center">
      <div className="text-4xl font-bold text-copper-600">
        {streak > 0 ? `🔥 ${streak}` : "—"}
      </div>
      <p className="text-sm text-copper-600 mt-2">
        {streak > 0
          ? `jour${streak > 1 ? "s" : ""} consécutif${streak > 1 ? "s" : ""} de pratique`
          : "Commencez votre première séance !"}
      </p>
      {streak === 0 && (
        <p className="text-xs text-copper-500 mt-1">
          Votre série de jours consécutifs apparaîtra ici.
        </p>
      )}
    </div>
  );
}
