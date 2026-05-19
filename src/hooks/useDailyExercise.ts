import { useMemo, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { exerciseCategories, ExerciseCategory, Exercise } from "@/data/exercises";

function getDaySeed(date: Date = new Date(), userId?: string): number {
  const year = date.getFullYear();
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(year, 0, 0).getTime()) / 86400000
  );
  let baseSeed = year * 1000 + dayOfYear;
  if (userId) {
    for (let i = 0; i < userId.length; i++) {
      baseSeed = (baseSeed * 31 + userId.charCodeAt(i)) & 0x7fffffff;
    }
  }
  return baseSeed;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const DAILY_CATEGORY_IDS: ExerciseCategory[] = [
  "pause_controlee",
  "coherence_cardiaque",
  "myofonctionnel",
  "respiration_nasale",
  "diaphragmatique",
];

const BEGINNER_WEIGHTS: Record<string, number> = {
  pause_controlee: 4,
  coherence_cardiaque: 3,
  respiration_nasale: 3,
  myofonctionnel: 2,
  diaphragmatique: 2,
};

const INTERMEDIATE_WEIGHTS: Record<string, number> = {
  pause_controlee: 2,
  coherence_cardiaque: 3,
  respiration_nasale: 2,
  myofonctionnel: 3,
  diaphragmatique: 3,
};

const ADVANCED_WEIGHTS: Record<string, number> = {
  pause_controlee: 1,
  coherence_cardiaque: 2,
  respiration_nasale: 2,
  myofonctionnel: 4,
  diaphragmatique: 3,
};

export interface DailyExerciseResult {
  category: (typeof exerciseCategories)[number];
  exercise: Exercise;
  reason: string;
  loading: boolean;
}

export function useDailyExercise(): DailyExerciseResult {
  const { user } = useAuth();
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [recentCategoryIds, setRecentCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) {
        setSessionCount(0);
        setLoading(false);
        return;
      }

      const [sessionsRes, recentRes] = await Promise.all([
        supabase
          .from("sessions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("sessions")
          .select("exercise_category")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setSessionCount(sessionsRes.count ?? 0);
      setRecentCategoryIds(
        (recentRes.data ?? [])
          .map((s) => s.exercise_category)
          .filter(Boolean) as string[]
      );
      setLoading(false);
    };

    fetch();
  }, [user]);

  const result = useMemo(() => {
    const seed = getDaySeed(new Date(), user?.id);
    const rand = seededRandom(seed);

    const count = sessionCount ?? 0;
    let weights: Record<string, number>;
    let reason: string;

    if (count < 5) {
      weights = BEGINNER_WEIGHTS;
      reason = "Parfait pour débuter en douceur";
    } else if (count < 20) {
      weights = INTERMEDIATE_WEIGHTS;
      reason = "Adapté à votre progression";
    } else {
      weights = ADVANCED_WEIGHTS;
      reason = "Un défi à votre niveau";
    }

    const adjustedWeights = { ...weights };
    for (const catId of DAILY_CATEGORY_IDS) {
      if (recentCategoryIds.includes(catId)) {
        adjustedWeights[catId] = Math.max(0, (adjustedWeights[catId] ?? 1) - 2);
      }
    }

    const pool: (typeof exerciseCategories)[number][] = [];
    for (const catId of DAILY_CATEGORY_IDS) {
      const cat = exerciseCategories.find((c) => c.id === catId);
      if (!cat || cat.exercises.length === 0) continue;
      const w = adjustedWeights[catId] ?? 1;
      for (let i = 0; i < w; i++) pool.push(cat);
    }

    if (pool.length === 0) {
      const fallback = exerciseCategories.find((c) => c.exercises.length > 0)!;
      pool.push(fallback);
    }

    const category = pool[Math.floor(rand() * pool.length)];
    const exercise = category.exercises[Math.floor(rand() * category.exercises.length)];

    return { category, exercise, reason };
  }, [sessionCount, recentCategoryIds, user?.id]);

  return { ...result, loading };
}
