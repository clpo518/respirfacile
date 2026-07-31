import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { newlyEarnedBadges } from "@/lib/badges";

export async function POST() {
  try {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Les conditions sont évaluées sur l'historique complet, pas sur la séance
    // qui vient d'être envoyée : un badge ne doit jamais dépendre de ce que le
    // client déclare.
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

    const newBadges = newlyEarnedBadges(sessions || [], existingBadgeIds);

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
