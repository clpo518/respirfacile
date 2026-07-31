import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PatientPreviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Vérifier le rôle
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isTherapist = profile?.role === "therapist" || profile?.role === "kine";
  if (!isTherapist) redirect("/dashboard");

  // Données fictives pour Sophie M.
  const patientName = "Sophie M.";
  const currentWeek = 3;
  const sessionsDoneThisWeek = 4;
  const sessionsTargetThisWeek = 5;
  const pauseScoreWeek1 = 12;
  const pauseScoreWeek3 = 28;
  const pauseProgression = 133;
  const lastExerciseDate = new Date(Date.now() - 86400000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    weekday: "short"
  });
  const therapistMessage = "Belle progression Sophie ! Essayez maintenant la Pause 25s.";

  const exercisesThisWeek = [
    { id: "pause_controlee_decouverte", name: "Découverte de la pause", done: true },
    { id: "coherence_5_5", name: "Cohérence cardiaque 5-5", done: true },
    { id: "langue_palais", name: "Langue au palais", done: false },
    { id: "nasale_guerrier", name: "Respiration nasale du guerrier", done: true },
  ];

  return (
    <div className="min-h-screen bg-beige-200 bg-texture">
      {/* Header */}
      <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-copper-500/20 border border-copper-500/40 text-copper-600 text-xs font-semibold">
              👁️ MODE APERÇU
            </div>
            <span className="text-sm text-forest-600">Ce que voit votre patient</span>
          </div>
          <Link
            href="/therapist"
            className="text-sm text-forest-600 hover:text-forest-800 transition-colors font-medium"
          >
            ← Revenir à mon tableau de bord
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Patient Identity */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-forest-500/10 border-2 border-forest-500/20 flex items-center justify-center text-forest-700 text-xl font-bold">
            S
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-forest-800">
              {patientName}
            </h1>
            <p className="text-sm text-forest-500">Semaine {currentWeek} · SAOS léger + TMOF</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Sessions this week */}
          <div className="bg-beige-100 rounded-3xl border border-beige-300 p-6 text-center shadow-beige">
            <div className="w-10 h-10 rounded-full bg-forest-500/10 border border-forest-500/20 flex items-center justify-center text-forest-600 mx-auto mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="font-display text-3xl font-bold text-forest-800">{sessionsDoneThisWeek}/{sessionsTargetThisWeek}</p>
            <p className="text-xs text-forest-500 mt-1">Séances cette semaine</p>
          </div>

          {/* Pause score latest */}
          <div className="bg-beige-100 rounded-3xl border border-beige-300 p-6 text-center shadow-beige">
            <div className="w-10 h-10 rounded-full bg-forest-500/10 border border-forest-500/20 flex items-center justify-center text-forest-600 mx-auto mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="font-display text-3xl font-bold text-forest-800">{pauseScoreWeek3}</p>
            <p className="text-xs text-forest-500 mt-1">Pause score (pas)</p>
          </div>

          {/* Progression */}
          <div className="bg-beige-100 rounded-3xl border border-beige-300 p-6 text-center shadow-beige">
            <div className="w-10 h-10 rounded-full bg-copper-500/10 border border-copper-500/20 flex items-center justify-center text-copper-600 mx-auto mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="font-display text-3xl font-bold text-copper-600">+{pauseProgression}%</p>
            <p className="text-xs text-forest-500 mt-1">Progression S1 → S3</p>
          </div>
        </div>

        {/* Therapist message card */}
        <div className="bg-forest-500/10 border border-forest-500/20 rounded-3xl p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-forest-500 flex items-center justify-center text-beige-100 font-bold">
                🩺
              </div>
            </div>
            <div>
              <p className="font-semibold text-forest-800 mb-1">Message de votre praticien</p>
              <p className="text-forest-700">{therapistMessage}</p>
              <p className="text-xs text-forest-500 mt-2">Reçu le {lastExerciseDate}</p>
            </div>
          </div>
        </div>

        {/* Last session info */}
        <div className="mb-8">
          <h2 className="font-semibold text-lg text-forest-800 mb-3">Dernière séance</h2>
          <div className="bg-beige-100 rounded-3xl border border-beige-300 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-forest-800">Cohérence cardiaque 5-5</p>
                <p className="text-sm text-forest-500 mt-1">{lastExerciseDate}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-forest-800">5</p>
                <p className="text-xs text-forest-500">cycles</p>
              </div>
            </div>
          </div>
        </div>

        {/* This week exercises */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg text-forest-800">Exercices de cette semaine</h2>
            <span className="text-xs text-forest-500 bg-beige-300 px-2.5 py-1 rounded-full">
              4 exercices
            </span>
          </div>

          <div className="space-y-3">
            {exercisesThisWeek.map((ex) => (
              <div
                key={ex.id}
                className={`flex items-center gap-3 p-4 rounded-2xl border ${
                  ex.done
                    ? "bg-forest-500/5 border-forest-500/20"
                    : "bg-beige-100 border-beige-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    ex.done
                      ? "bg-forest-500 border-forest-500"
                      : "border-beige-400"
                  }`}
                >
                  {ex.done && (
                    <svg className="w-3 h-3 text-beige-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`font-medium ${ex.done ? "text-forest-700" : "text-forest-600"}`}>
                  {ex.name}
                </span>
                {ex.done && (
                  <span className="ml-auto text-xs font-semibold text-forest-600 bg-forest-500/10 px-2 py-1 rounded-full">
                    Fait ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 left-0 right-0 bg-beige-100 border-t border-beige-300 px-4 py-4 flex items-center justify-between">
          <Link
            href="/therapist"
            className="text-sm text-forest-600 hover:text-forest-800 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Revenir à mon tableau de bord
          </Link>
          <p className="text-xs text-forest-500 text-center flex-1">
            MODE APERÇU, Ceci est un exemple de ce que voit votre patient
          </p>
        </div>
      </main>
    </div>
  )
}
