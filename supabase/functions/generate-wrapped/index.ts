import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// WPM to SPS conversion (same as frontend)
const wpmToSps = (wpm: number): number => Math.round((wpm * 1.8 / 60) * 10) / 10;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, year = 2025 } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const startDate = `${year}-01-01T00:00:00Z`;
    const endDate = `${year}-12-31T23:59:59Z`;

    if (profile.is_therapist) {
      // ========== THERAPIST WRAPPED ==========
      // Get all patients
      const { data: patients } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("linked_therapist_id", user_id)
        .eq("is_archived", false);

      const patientIds = (patients || []).map((p) => p.id);
      const totalPatients = patientIds.length;

      let totalSessions = 0;
      let totalDuration = 0;
      let totalSyllables = 0;
      let championName = "";
      let championSessions = 0;
      let allAvgSps: number[] = [];
      const patientFirstLast: Record<string, { first: number[]; last: number[] }> = {};

      if (patientIds.length > 0) {
        // Fetch all sessions for all patients
        const { data: sessions } = await supabase
          .from("sessions")
          .select("user_id, avg_wpm, duration_seconds, created_at")
          .in("user_id", patientIds)
          .gte("created_at", startDate)
          .lte("created_at", endDate)
          .order("created_at", { ascending: true });

        if (sessions) {
          totalSessions = sessions.length;
          const sessionsByPatient: Record<string, typeof sessions> = {};

          for (const s of sessions) {
            totalDuration += s.duration_seconds;
            const sps = wpmToSps(s.avg_wpm);
            allAvgSps.push(sps);
            // Estimate syllables: sps * duration
            totalSyllables += Math.round(sps * s.duration_seconds);

            if (!sessionsByPatient[s.user_id]) sessionsByPatient[s.user_id] = [];
            sessionsByPatient[s.user_id].push(s);
          }

          // Find champion + compute first/last month averages
          for (const [pid, pSessions] of Object.entries(sessionsByPatient)) {
            if (pSessions.length > championSessions) {
              championSessions = pSessions.length;
              const patient = patients?.find((p) => p.id === pid);
              championName = patient?.full_name || "Un patient";
            }

            // First and last month SPS
            const sorted = pSessions.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            const firstMonth = sorted.slice(0, Math.min(5, sorted.length)).map((s) => wpmToSps(s.avg_wpm));
            const lastMonth = sorted.slice(-Math.min(5, sorted.length)).map((s) => wpmToSps(s.avg_wpm));
            patientFirstLast[pid] = { first: firstMonth, last: lastMonth };
          }
        }
      }

      // Average improvement across patients
      let improvementCount = 0;
      let totalImprovement = 0;
      for (const { first, last } of Object.values(patientFirstLast)) {
        const avgFirst = first.reduce((a, b) => a + b, 0) / first.length;
        const avgLast = last.reduce((a, b) => a + b, 0) / last.length;
        if (avgFirst > 0 && avgLast > 0) {
          totalImprovement += ((avgFirst - avgLast) / avgFirst) * 100;
          improvementCount++;
        }
      }
      const avgImprovement = improvementCount > 0 ? Math.round(totalImprovement / improvementCount) : 0;

      const totalHours = Math.round(totalDuration / 3600 * 10) / 10;

      return new Response(JSON.stringify({
        type: "therapist",
        year,
        name: profile.full_name || "Professionnel",
        totalPatients,
        totalSessions,
        totalHours,
        totalSyllables,
        championName,
        championSessions,
        avgImprovement,
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else {
      // ========== PATIENT WRAPPED ==========
      const { data: sessions } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user_id)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: true });

      const allSessions = sessions || [];
      const totalSessions = allSessions.length;

      if (totalSessions === 0) {
        return new Response(JSON.stringify({ type: "patient", year, noData: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const totalDuration = allSessions.reduce((sum, s) => sum + s.duration_seconds, 0);
      const totalHours = Math.round(totalDuration / 3600 * 10) / 10;

      // SPS progression: first 5 vs last 5
      const firstSessions = allSessions.slice(0, Math.min(5, allSessions.length));
      const lastSessions = allSessions.slice(-Math.min(5, allSessions.length));
      const avgSpsFirst = Math.round(firstSessions.reduce((s, sess) => s + wpmToSps(sess.avg_wpm), 0) / firstSessions.length * 10) / 10;
      const avgSpsLast = Math.round(lastSessions.reduce((s, sess) => s + wpmToSps(sess.avg_wpm), 0) / lastSessions.length * 10) / 10;

      // Exercise type distribution
      const exerciseCounts: Record<string, number> = {};
      for (const s of allSessions) {
        const type = s.exercise_type || "reading";
        exerciseCounts[type] = (exerciseCounts[type] || 0) + 1;
      }
      const favoriteExercise = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "reading";

      // Active days
      const activeDays = new Set(allSessions.map((s) => s.created_at.split("T")[0])).size;

      // Total syllables estimated
      const totalSyllables = allSessions.reduce((sum, s) => {
        const sps = wpmToSps(s.avg_wpm);
        return sum + Math.round(sps * s.duration_seconds);
      }, 0);

      // Total words estimated (syllables / 1.8)
      const totalWords = Math.round(totalSyllables / 1.8);

      // Sessions above target (too fast)
      const targetSps = profile.target_wpm ? wpmToSps(profile.target_wpm) : 4.5;
      const tooFastCount = allSessions.filter((s) => wpmToSps(s.avg_wpm) > targetSps).length;

      // Sentiment distribution
      const sentiments: Record<string, number> = {};
      for (const s of allSessions) {
        if (s.patient_sentiment) {
          sentiments[s.patient_sentiment] = (sentiments[s.patient_sentiment] || 0) + 1;
        }
      }

      // Fun stat: equivalent pages (avg reading speed ~250 words/page, ~3 min/page)
      const equivalentPages = Math.round(totalDuration / 180);

      // Fun stat: equivalent series episodes (~45 min each)
      const equivalentEpisodes = Math.round(totalDuration / 2700 * 10) / 10;

      return new Response(JSON.stringify({
        type: "patient",
        year,
        name: profile.full_name || "Utilisateur",
        noData: false,
        totalSessions,
        totalHours,
        totalDuration,
        avgSpsFirst,
        avgSpsLast,
        favoriteExercise,
        activeDays,
        totalSyllables,
        totalWords,
        tooFastCount,
        equivalentPages,
        equivalentEpisodes,
        bestStreak: profile.longest_streak || 0,
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("generate-wrapped error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
