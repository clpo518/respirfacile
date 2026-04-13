import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface GamificationData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  todayMinutes: number;
  dailyGoal: number;
}

interface UseGamificationReturn extends GamificationData {
  loading: boolean;
  goalProgress: number; // 0-100
  goalCompleted: boolean;
  updateAfterSession: (durationSeconds: number) => Promise<{ streakIncremented: boolean; goalJustCompleted: boolean }>;
  refetch: () => Promise<void>;
}

export const useGamification = (): UseGamificationReturn => {
  const { user } = useAuth();
  const [data, setData] = useState<GamificationData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    todayMinutes: 0,
    dailyGoal: 3,
  });
  const [loading, setLoading] = useState(true);

  const fetchGamificationData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak, last_activity_date, today_minutes, daily_goal")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        // Check if we need to reset today_minutes (new day)
        const lastActivity = profile.last_activity_date 
          ? new Date(profile.last_activity_date) 
          : null;
        const now = new Date();
        const isNewDay = !lastActivity || !isSameDay(lastActivity, now);

        setData({
          currentStreak: profile.current_streak || 0,
          longestStreak: profile.longest_streak || 0,
          lastActivityDate: profile.last_activity_date,
          todayMinutes: isNewDay ? 0 : (profile.today_minutes || 0),
          dailyGoal: profile.daily_goal || 3,
        });
      }
    } catch (error) {
      console.error("Error fetching gamification data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  const updateAfterSession = useCallback(async (durationSeconds: number): Promise<{ streakIncremented: boolean; goalJustCompleted: boolean }> => {
    if (!user) return { streakIncremented: false, goalJustCompleted: false };

    const durationMinutes = Math.round(durationSeconds / 60);
    const now = new Date();
    const todayStr = now.toISOString();

    try {
      // Fetch current data fresh
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("current_streak, longest_streak, last_activity_date, today_minutes, daily_goal")
        .eq("id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!profile) return { streakIncremented: false, goalJustCompleted: false };

      const lastActivity = profile.last_activity_date 
        ? new Date(profile.last_activity_date) 
        : null;
      
      let newStreak = profile.current_streak || 0;
      let longestStreak = profile.longest_streak || 0;
      let newTodayMinutes = profile.today_minutes || 0;
      let streakIncremented = false;

      // Check date relationship
      const isToday = lastActivity && isSameDay(lastActivity, now);
      const isYesterday = lastActivity && isSameDay(addDays(now, -1), lastActivity);
      const isOlder = !lastActivity || (!isToday && !isYesterday);

      if (isToday) {
        // Same day - just add minutes, keep streak
        newTodayMinutes += durationMinutes;
      } else if (isYesterday) {
        // Consecutive day - increment streak!
        newStreak += 1;
        streakIncremented = true;
        newTodayMinutes = durationMinutes; // Reset for new day
      } else {
        // Gap in activity - reset streak to 1 (today counts)
        newStreak = 1;
        streakIncremented = newStreak > (profile.current_streak || 0);
        newTodayMinutes = durationMinutes;
      }

      // Update longest streak if needed
      if (newStreak > longestStreak) {
        longestStreak = newStreak;
      }

      // Check if goal was just completed
      const wasGoalMet = (profile.today_minutes || 0) >= (profile.daily_goal || 3);
      const isGoalMetNow = newTodayMinutes >= (profile.daily_goal || 3);
      const goalJustCompleted = !wasGoalMet && isGoalMetNow;

      // Update database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: todayStr,
          today_minutes: newTodayMinutes,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update local state
      setData({
        currentStreak: newStreak,
        longestStreak,
        lastActivityDate: todayStr,
        todayMinutes: newTodayMinutes,
        dailyGoal: profile.daily_goal || 3,
      });

      return { streakIncremented, goalJustCompleted };
    } catch (error) {
      console.error("Error updating gamification data:", error);
      return { streakIncremented: false, goalJustCompleted: false };
    }
  }, [user]);

  // Calculate goal progress
  const goalProgress = Math.min(100, Math.round((data.todayMinutes / data.dailyGoal) * 100));
  const goalCompleted = data.todayMinutes >= data.dailyGoal;

  return {
    ...data,
    loading,
    goalProgress,
    goalCompleted,
    updateAfterSession,
    refetch: fetchGamificationData,
  };
};

// Helper functions
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Export helper for calculating days since activity
// Returns -1 for null (new patient, never practiced)
export function getDaysSinceActivity(lastActivityDate: string | null): number {
  if (!lastActivityDate) return -1;
  const last = new Date(lastActivityDate);
  const now = new Date();
  const diffTime = now.getTime() - last.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Export helper for getting retention status
export type RetentionStatus = "new" | "active" | "slipping" | "dropout";

export function getRetentionStatus(daysSinceActivity: number): RetentionStatus {
  if (daysSinceActivity < 0) return "new";
  if (daysSinceActivity <= 2) return "active";
  if (daysSinceActivity <= 5) return "slipping";
  return "dropout";
}
