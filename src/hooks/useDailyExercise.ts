import { useMemo, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { exerciseCategories, ExerciseCategory, Exercise } from "@/data/exercises";

/**
 * Deterministic daily seed from date + user ID — unique per user per day
 */
function getDaySeed(date: Date = new Date(), userId?: string): number {
  const year = date.getFullYear();
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(year, 0, 0).getTime()) / 86400000
  );
  let baseSeed = year * 1000 + dayOfYear;
  
  // Mix in user ID for per-user uniqueness
  if (userId) {
    for (let i = 0; i < userId.length; i++) {
      baseSeed = (baseSeed * 31 + userId.charCodeAt(i)) & 0x7fffffff;
    }
  }
  
  return baseSeed;
}

/**
 * Simple seeded pseudo-random
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// Categories suitable for daily recommendations (exclude rebus = pediatric)
const DAILY_CATEGORY_IDS = [
  "slow-reading",
  "daily-life",
  "articulation",
  "clinical-reading",
  "warmup",
  "improvisation",
  "breath-control",
  "speed-traps",
  "teen-life",
];

// Progression logic: map experience level to category weights
const BEGINNER_WEIGHTS: Record<string, number> = {
  "slow-reading": 4,
  "warmup": 3,
  "daily-life": 2,
  "breath-control": 2,
  "articulation": 1,
  "improvisation": 1,
  "clinical-reading": 0,
  "speed-traps": 0,
  "teen-life": 2,
};

const INTERMEDIATE_WEIGHTS: Record<string, number> = {
  "slow-reading": 1,
  "warmup": 2,
  "daily-life": 3,
  "breath-control": 2,
  "articulation": 3,
  "improvisation": 2,
  "clinical-reading": 1,
  "speed-traps": 1,
  "teen-life": 3,
};

const ADVANCED_WEIGHTS: Record<string, number> = {
  "slow-reading": 0,
  "warmup": 1,
  "daily-life": 2,
  "breath-control": 2,
  "articulation": 3,
  "improvisation": 3,
  "clinical-reading": 2,
  "speed-traps": 3,
  "teen-life": 2,
};

export interface DailyExerciseResult {
  category: ExerciseCategory;
  exercise: Exercise;
  reason: string;
  loading: boolean;
}

export function useDailyExercise(): DailyExerciseResult {
  const { user } = useAuth();
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [recentExerciseTypes, setRecentExerciseTypes] = useState<string[]>([]);
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
          .select("exercise_type, notes")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setSessionCount(sessionsRes.count ?? 0);
      const recentSessions = recentRes.data ?? [];
      setRecentExerciseTypes(
        recentSessions
          .map((s) => s.exercise_type)
          .filter(Boolean) as string[]
      );
      // Track recent category IDs from notes field if available
      setRecentCategoryIds(
        recentSessions
          .map((s) => s.notes)
          .filter(Boolean) as string[]
      );
      setLoading(false);
    };

    fetch();
  }, [user]);

  const result = useMemo(() => {
    const seed = getDaySeed(new Date(), user?.id);
    const rand = seededRandom(seed);

    // Determine level based on session count
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

    // Stronger penalty for recently used categories/types
    const recentTypeSet = new Set(recentExerciseTypes);
    const adjustedWeights = { ...weights };

    for (const catId of DAILY_CATEGORY_IDS) {
      const cat = exerciseCategories.find((c) => c.id === catId);
      if (!cat) continue;
      const catType = cat.type || "reading";
      
      // Penalize by exercise type (−2)
      if (recentTypeSet.has(catType)) {
        adjustedWeights[catId] = Math.max(0, (adjustedWeights[catId] || 0) - 2);
      }
      
      // Extra penalty if this exact category was used recently (−1 more)
      if (recentCategoryIds.includes(catId)) {
        adjustedWeights[catId] = Math.max(0, (adjustedWeights[catId] || 0) - 1);
      }
    }

    // Build weighted list
    const pool: ExerciseCategory[] = [];
    for (const catId of DAILY_CATEGORY_IDS) {
      const cat = exerciseCategories.find((c) => c.id === catId);
      if (!cat) continue;
      const w = adjustedWeights[catId] ?? 1;
      for (let i = 0; i < w; i++) pool.push(cat);
    }

    // Fallback
    if (pool.length === 0) {
      const fallback = exerciseCategories.find((c) => c.id === "slow-reading")!;
      pool.push(fallback);
    }

    // Pick category
    const catIndex = Math.floor(rand() * pool.length);
    const category = pool[catIndex];

    // Pick exercise within category (deterministic per day)
    const exIndex = Math.floor(rand() * category.exercises.length);
    const exercise = category.exercises[exIndex];

    return { category, exercise, reason };
  }, [sessionCount, recentExerciseTypes, recentCategoryIds, user?.id]);

  return { ...result, loading };
}
