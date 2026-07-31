import { LogoIcon } from "@/components/ui/Logo"
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DailyTip } from "@/components/DailyTip";
import NextExercise from "@/components/NextExercise";
import { StreakDisplay } from "@/components/StreakDisplay";
import { MoodRing } from "@/components/MoodRing";
import { DashboardShortcuts } from "@/components/DashboardShortcuts";
import { PatientMessages } from "@/components/PatientMessages";
import { UnreadMessageBadge } from "@/components/UnreadMessageBadge";
import { ProgressionChart } from "@/components/ProgressionChart";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { EXERCISES } from "@/lib/data/exercises";
import { computeStreak } from "@/lib/streak";
import CelebrationToast from "@/components/CelebrationToast";
import Link from "next/link";
import { MobileBottomNavClient } from "@/components/MobileBottomNavClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ celebration?: string }>;
}) {
  const _params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isTherapist = profile?.role === "therapist" || profile?.role === "kine";

  if (isTherapist) {
    redirect("/therapist");
  }

  // Dynamique greeting selon l'heure
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  // Patient dashboard, server rendered
  const firstName = profile?.full_name?.split(" ")[0] || "";

  // Récupérer les prescriptions actives de l'ortho
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("id, exercise_id, frequency_label, frequency_per_day, notes")
    .eq("patient_id", user.id)
    .eq("is_active", true);

  // Sessions faites aujourd'hui (pour badge complétion)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data: sessionsToday } = await supabase
    .from("sessions")
    .select("exercise_id, prescription_id")
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  const sessionsTodayByExercise: Record<string, number> = {};
  (sessionsToday || []).forEach((s) => {
    const key = s.exercise_id;
    sessionsTodayByExercise[key] = (sessionsTodayByExercise[key] || 0) + 1;
  });

  // --- VRAIES STATS ---
  // Séances cette semaine
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);
  const { count: sessionsThisWeek } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", weekStart.toISOString());

  // Objectif semaine = somme des fréquences prescrites × 5 jours (ou fallback 5)
  const weeklyGoal = (prescriptions || []).reduce((acc, p) => acc + (p.frequency_per_day || 1), 0) * 5 || 5;

  // Meilleur score Pause Contrôlée (tous temps)
  const { data: bestScoreData } = await supabase
    .from("sessions")
    .select("score")
    .eq("user_id", user.id)
    .eq("exercise_id", "pause_controlee_decouverte")
    .not("score", "is", null)
    .order("score", { ascending: false })
    .limit(1);
  const bestPauseScore = bestScoreData?.[0]?.score ?? null;

  const { data: allSessions } = await supabase
    .from("sessions")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Série avec jokers : le calcul vit dans lib/streak.ts, seul endroit où la
  // règle des 2 jokers hebdomadaires est écrite, et il est couvert par des tests.
  const streakResult = computeStreak((allSessions || []).map((s) => s.created_at));
  const streak = streakResult.current;

  // Matcher avec le catalogue d'exercices
  const prescribedExercises = (prescriptions || [])
    .map((p) => {
      const ex = EXERCISES.find((e) => e.id === p.exercise_id);
      if (!ex) return null;
      const doneToday = sessionsTodayByExercise[p.exercise_id] || 0;
      const isDone = doneToday >= (p.frequency_per_day || 1);
      return {
        ...ex,
        prescriptionId: p.id,
        frequency_label: p.frequency_label,
        frequency_per_day: p.frequency_per_day,
        ortho_note: p.notes,
        doneToday,
        isDone,
      };
    })
    .filter(Boolean) as Array<(typeof EXERCISES)[0] & {
      prescriptionId: string;
      frequency_label: string;
      frequency_per_day: number;
      ortho_note: string | null;
      doneToday: number;
      isDone: boolean;
    }>;

  return (
    <div className="min-h-screen bg-beige-200 bg-texture">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .page-enter {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .flame-bounce {
          animation: bounce-slow 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoIcon size={28} />
            <span style={{fontWeight:600,color:"#2D5016",letterSpacing:"-0.01em"}}>Respir<span style={{color:"#8B4513"}}>facile</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Suspense fallback={null}>
              <UnreadMessageBadge patientId={user.id} />
            </Suspense>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-forest-500 hover:text-forest-700 transition-colors"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-28 md:pb-8 page-enter">
        {/* Toast de célébration */}
        <Suspense fallback={null}>
          <CelebrationToast />
        </Suspense>

        {/* Greeting dynamique */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-forest-800 mb-1">
            👋 {greeting}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-forest-500">
            {hour < 12
              ? "Comment allez-vous ce matin ?"
              : hour < 18
                ? "Prêt(e) pour une séance ?"
                : "Bonne fin de journée."}
          </p>
        </div>

        {/* Messages de l'ortho, priorité haute, en premier */}
        <Suspense fallback={null}>
          <PatientMessages patientId={user.id} />
        </Suspense>

        {/* Mood Ring */}
        <div className="mb-6">
          <MoodRing compact userId={user.id} />
        </div>

        {/* Daily Tip */}
        <div className="mb-8">
          <DailyTip />
        </div>

        {/* Streak Display avec flamme animée */}
        <div className="mb-8">
          <StreakDisplay userId={user.id} />
        </div>

        {/* Next Exercise, Hero Card, pointe le premier exercice prescrit non fait */}
        {(() => {
          const nextEx = prescribedExercises.find((e) => !e.isDone) ?? prescribedExercises[0];
          const fallbackEx = nextEx ?? EXERCISES[0];
          return (
            <div className="mb-8">
              <NextExercise exercise={fallbackEx} />
            </div>
          );
        })()}

        {/* Stats en grid, vraies données BDD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Séances cette semaine",
              value: `${sessionsThisWeek ?? 0}/${weeklyGoal}`,
              color: (sessionsThisWeek ?? 0) >= weeklyGoal ? "text-green-700" : "text-forest-800",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              ),
            },
            {
              label: "Meilleur score pause",
              value: bestPauseScore !== null ? `${bestPauseScore} pas` : "—",
              color: bestPauseScore !== null ? "text-copper-700" : "text-forest-400",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2C8 2 5 6 5 10c0 3 1.5 5.5 4 7l3 2 3-2c2.5-1.5 4-4 4-7 0-4-3-8-7-8z" />
                </svg>
              ),
            },
            {
              label: "Jours de suite",
              value: streak > 0 ? `${streak} 🔥` : "0",
              color: streak >= 7 ? "text-amber-600" : streak > 0 ? "text-forest-700" : "text-forest-400",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 019 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                </svg>
              ),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-beige-100 rounded-3xl border border-beige-300 p-6 text-center shadow-beige hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-forest-500/10 border border-forest-500/20 flex items-center justify-center text-forest-600 mx-auto mb-3">
                {stat.icon}
              </div>
              <p className={`font-display text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-forest-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Programme prescrit par l'ortho */}
        <div className="bg-beige-100 rounded-3xl border border-beige-300 p-8 shadow-beige mb-8">
          <h2 className="font-semibold text-xl text-forest-800 mb-2">🗓️ Votre programme de la semaine</h2>

          {prescribedExercises.length > 0 ? (
            <>
              <p className="text-sm text-forest-500 mb-6">
                {prescribedExercises.length} exercice{prescribedExercises.length > 1 ? "s" : ""} prescrit{prescribedExercises.length > 1 ? "s" : ""} par votre praticien.
              </p>
              <div className="space-y-3">
                {prescribedExercises.map((ex) => (
                  <Link
                    key={ex.id}
                    href={`/session/${ex.id}`}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all group ${
                      ex.isDone
                        ? "border-green-200 bg-green-50/50 opacity-80"
                        : "border-beige-300 bg-white hover:border-forest-300 hover:shadow-sm"
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">{ex.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold ${ex.isDone ? "text-green-800" : "text-forest-800"}`}>{ex.name_fr}</p>
                        <span className="text-xs bg-forest-500/10 text-forest-700 px-2 py-0.5 rounded-full font-medium">{ex.frequency_label}</span>
                        <span className="text-xs text-forest-500">{Math.floor(ex.duration_seconds / 60)} min</span>
                        {ex.doneToday > 0 && !ex.isDone && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            {ex.doneToday}/{ex.frequency_per_day} fait
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-forest-600 mt-0.5 leading-relaxed">{ex.description_fr}</p>
                      {ex.ortho_note && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mt-2 italic">
                          💬 {ex.ortho_note}
                        </p>
                      )}
                    </div>
                    {ex.isDone ? (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <svg className="w-4 h-4 text-forest-400 group-hover:text-forest-600 flex-shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                {prescribedExercises.filter((e) => e.isDone).length === prescribedExercises.length ? (
                  <p className="text-sm text-green-700 font-semibold">🎉 Tous vos exercices du jour sont faits !</p>
                ) : (
                  <p className="text-xs text-forest-400">
                    {prescribedExercises.filter((e) => e.isDone).length}/{prescribedExercises.length} exercice{prescribedExercises.length > 1 ? "s" : ""} fait{prescribedExercises.length > 1 ? "s" : ""} aujourd&apos;hui · Votre praticien peut ajuster ce programme.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🩺</p>
              <p className="text-forest-700 font-medium mb-1">Aucun exercice prescrit pour l'instant</p>
              <p className="text-sm text-forest-500 mb-4">
                Votre praticien n&apos;a pas encore configuré votre programme. En attendant, vous pouvez découvrir les exercices qui se pratiquent sans consigne particulière. Les exercices de Pause Contrôlée, eux, attendent sa prescription.
              </p>
              <Link
                href="/exercises"
                className="inline-block px-5 py-2.5 rounded-xl bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition-colors"
              >
                Voir tous les exercices →
              </Link>
            </div>
          )}
        </div>

        {/* Graphique progression + heatmap, dynamique par exercices prescrits */}
        <div className="space-y-4 mb-8">
          <h2 className="font-semibold text-lg text-forest-800">📊 Votre progression</h2>
          {prescribedExercises.length > 0 ? (
            prescribedExercises.map((ex) => (
              <Suspense key={ex.id} fallback={<div className="h-40 bg-beige-100 rounded-3xl animate-pulse" />}>
                <ProgressionChart
                  userId={user.id}
                  exerciseId={ex.id}
                  title={`${ex.emoji} ${ex.name_fr}, évolution`}
                />
              </Suspense>
            ))
          ) : (
            // Fallback : afficher Pause Contrôlée par défaut
            <Suspense fallback={<div className="h-40 bg-beige-100 rounded-3xl animate-pulse" />}>
              <ProgressionChart
                userId={user.id}
                exerciseId="pause_controlee_decouverte"
                title="🫁 Pause Contrôlée, évolution du score"
              />
            </Suspense>
          )}
          <Suspense fallback={<div className="h-32 bg-beige-100 rounded-3xl animate-pulse" />}>
            <ActivityHeatmap userId={user.id} />
          </Suspense>
        </div>

        {/* Dashboard Shortcuts */}
        <DashboardShortcuts />
      </main>

      <MobileBottomNavClient />
    </div>
  );
}
