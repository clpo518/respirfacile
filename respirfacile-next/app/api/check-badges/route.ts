import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BADGE_CONDITIONS: Record<
  string,
  {
    description: string;
    condition: (
      sessions: any[],
      exerciseId?: string,
      score?: number
    ) => boolean;
  }
> = {
  first_session: {
    description: "Première séance complétée",
    condition: (sessions) => sessions.length === 1,
  },
  week_1: {
    description: "7 jours consécutifs",
    condition: (sessions) => {
      const dates = sessions.map((s) => new Date(s.created_at).toDateString());
      const uniqueDates = [...new Set(dates)];
      return uniqueDates.length >= 7;
    },
  },
  pause_20: {
    description: "Tenir 20 secondes de pause",
    condition: (sessions, exerciseId, score) => {
      const pauseSessions = sessions.filter(
        (s) => s.exercise_category === "pause_controlee"
      );
      return pauseSessions.some((s) => (s.score || 0) >= 20);
    },
  },
  pause_25: {
    description: "Tenir 25 secondes de pause",
    condition: (sessions) => {
      const pauseSessions = sessions.filter(
        (s) => s.exercise_category === "pause_controlee"
      );
      return pauseSessions.some((s) => (s.score || 0) >= 25);
    },
  },
  nasale_master: {
    description: "10 séances nasales réussies",
    condition: (sessions) => {
      const nasalSessions = sessions.filter(
        (s) =>
          s.exercise_category === "respiration_nasale" &&
          s.duration_seconds >= 180
      );
      return nasalSessions.length >= 10;
    },
  },
  coherence_30: {
    description: "30 sessions cohérence cardiaque",
    condition: (sessions) => {
      const coherenceSessions = sessions.filter(
        (s) => s.exercise_category === "coherence_cardiaque"
      );
      return coherenceSessions.length >= 30;
    },
  },
  month_1: {
    description: "30 jours d'engagement",
    condition: (sessions) => {
      if (sessions.length === 0) return false;
      const firstSession = new Date(sessions[sessions.length - 1].created_at);
      const lastSession = new Date(sessions[0].created_at);
      const daysDiff = Math.floor(
        (lastSession.getTime() - firstSession.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysDiff >= 30;
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exerciseId, score } = await request.json();

    // Fetch all sessions for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select(
        "id, created_at, exercise_id, exercise_category, score, duration_seconds, completed"
      )
      .eq("user_id", userData.user.id)
      .eq("completed", true)
      .order("created_at", { ascending: false });

    if (sessionsError) {
      throw sessionsError;
    }

    // Fetch user's existing badges
    const { data: existingBadges } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userData.user.id);

    const existingBadgeIds = new Set(existingBadges?.map((b) => b.badge_id) || []);

    // Check for new badges
    const newBadges: string[] = [];

    for (const [badgeId, badgeConfig] of Object.entries(BADGE_CONDITIONS)) {
      // Skip if already earned
      if (existingBadgeIds.has(badgeId)) {
        continue;
      }

      // Check if condition is met
      if (badgeConfig.condition(sessions || [], exerciseId, score)) {
        newBadges.push(badgeId);
      }
    }

    // Save new badges to database
    if (newBadges.length > 0) {
      const badgeInserts = newBadges.map((badgeId) => ({
        user_id: userData.user.id,
        badge_id: badgeId,
        earned_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from("user_badges")
        .insert(badgeInserts);

      if (insertError) {
        console.error("Error inserting badges:", insertError);
        // Don't fail the request, just log
      }
    }

    return NextResponse.json({
      new_badges: newBadges,
      total_badges: existingBadgeIds.size + newBadges.length,
    });
  } catch (error) {
    console.error("Error in check-badges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
