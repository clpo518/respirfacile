import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  EXERCISES,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  formatDuration,
  type PatientProfileType,
} from "@/lib/data/exercises";
import { MobileBottomNavClient } from "@/components/MobileBottomNavClient";

const DIFFICULTY_COLORS = {
  1: "bg-forest-500/10 text-forest-700 border-forest-500/20",
  2: "bg-copper-500/10 text-copper-700 border-copper-500/20",
  3: "bg-red-100 text-red-700 border-red-200",
} as const;

const CATEGORY_COLORS: Record<string, string> = {
  pause_controlee: "bg-forest-500/10 text-forest-700",
  coherence_cardiaque: "bg-blue-100 text-blue-700",
  respiration_nasale: "bg-teal-100 text-teal-700",
  myofonctionnel: "bg-copper-500/10 text-copper-700",
  diaphragmatique: "bg-purple-100 text-purple-700",
  relaxation: "bg-amber-100 text-amber-700",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  pause_controlee: "🫁",
  coherence_cardiaque: "💓",
  respiration_nasale: "👃",
  myofonctionnel: "👅",
  diaphragmatique: "🌬️",
  relaxation: "🧘",
};

export default async function ExercisesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isTherapist = profile?.role === "therapist" || profile?.role === "kine";
  if (isTherapist) redirect("/therapist");

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);

  const [{ data: recentSessions }, { data: program }] = await Promise.all([
    supabase
      .from("sessions")
      .select("exercise_id, created_at")
      .eq("user_id", user.id)
      .gte("created_at", weekStart.toISOString()),
    supabase
      .from("patient_programs")
      .select("profile_type, week_number, custom_notes")
      .eq("patient_id", user.id)
      .eq("is_active", true)
      .single(),
  ]);

  const doneExerciseIds = new Set(
    (recentSessions || []).map((s: { exercise_id: string }) => s.exercise_id)
  );

  const patientProfile = (program?.profile_type as PatientProfileType) || null;
  const exercises = patientProfile
    ? EXERCISES.filter((e) => e.target_profile.includes(patientProfile))
    : EXERCISES;

  const byCategory = exercises.reduce((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex);
    return acc;
  }, {} as Record<string, typeof exercises>);

  const firstName = profile?.full_name?.split(" ")[0] || "vous";

  return (
    <div className="min-h-screen bg-beige-200 bg-texture overflow-x-hidden">
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
        .page-enter {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-full bg-beige-300 hover:bg-beige-400 transition-colors flex items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4 text-forest-700"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="font-semibold text-base text-forest-800">
              🏋️ Mes exercices
            </span>
          </div>
          <Link
            href="/history"
            className="text-sm text-forest-500 hover:text-forest-700 transition-colors"
          >
            📊 Historique
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-8 page-enter">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-forest-800 mb-1">
            Bonjour {firstName} 👋
          </h1>
          <p className="text-forest-500">
            {exercises.length} exercice{exercises.length > 1 ? "s" : ""}{" "}
            personnalisé{exercises.length > 1 ? "s" : ""}
            {program?.week_number ? ` · Semaine ${program.week_number}` : ""}
          </p>
        </div>

        {program?.custom_notes && (
          <div className="mb-6 bg-copper-500/10 border border-copper-500/20 rounded-2xl px-5 py-4 flex items-start gap-3 hover:shadow-md transition-shadow">
            <span className="text-lg mt-0.5">🩺</span>
            <p className="text-sm text-forest-700 leading-relaxed">
              <strong>Message de votre orthophoniste :</strong> {program.custom_notes}
            </p>
          </div>
        )}

        <div className="mb-8 bg-forest-500/10 border border-forest-500/20 rounded-2xl px-5 py-4 flex items-start gap-3 hover:shadow-md transition-shadow">
          <span className="text-xl mt-0.5">💡</span>
          <p className="text-sm text-forest-700 leading-relaxed">
            <strong>Pour de meilleurs résultats :</strong> Fais la cohérence cardiaque 3&times;/jour. Les autres exercices 1 à 2&times;/jour. Maximum 20 minutes au total.
          </p>
        </div>

        {Object.entries(byCategory).map(([category, exList]) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">
                {CATEGORY_EMOJIS[category] || "🏋️"}
              </span>
              <h2 className="font-semibold text-lg text-forest-800">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ||
                  category}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exList.map((exercise) => {
                const isDone = doneExerciseIds.has(exercise.id);
                return (
                  <Link
                    key={exercise.id}
                    href={`/session/${exercise.id}`}
                    className={`group block bg-beige-100 rounded-3xl border transition-all duration-200 p-6 shadow-beige hover:shadow-lg hover:-translate-y-1 ${
                      isDone
                        ? "border-forest-500/40 bg-forest-500/5"
                        : "border-beige-300 hover:border-forest-500/40"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">
                          {exercise.emoji || "🫁"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-forest-800 group-hover:text-forest-600 transition-colors">
                            {exercise.name_fr}
                          </h3>
                          <p className="text-xs text-forest-500 mt-0.5">
                            {formatDuration(exercise.duration_seconds)}
                            {exercise.sets ? ` · ${exercise.sets} cycles` : ""}
                          </p>
                        </div>
                      </div>
                      {isDone ? (
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-forest-500 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-beige-100"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-beige-300 group-hover:bg-forest-500 transition-colors flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-forest-600 group-hover:text-beige-100 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-forest-500 leading-relaxed mb-4">
                      {exercise.description_fr}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                          DIFFICULTY_COLORS[
                            exercise.difficulty as keyof typeof DIFFICULTY_COLORS
                          ]
                        }`}
                      >
                        {DIFFICULTY_LABELS[exercise.difficulty]}
                      </span>
                      {isDone && (
                        <span className="text-xs text-forest-600 font-medium">
                          ✓ Fait cette semaine
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {exercises.length === 0 && (
          <div className="bg-beige-100 rounded-3xl border border-beige-300 p-12 text-center shadow-beige">
            <div className="text-5xl mb-4">🌱</div>
            <p className="font-semibold text-forest-700 mb-2">
              Votre programme arrive bientôt
            </p>
            <p className="text-sm text-forest-500 max-w-xs mx-auto leading-relaxed">
              Votre orthophoniste finit de mettre en place votre programme
              personnalisé. Vous recevrez une notification dès qu'il sera prêt.
            </p>
          </div>
        )}

        <MobileBottomNavClient />
      </main>
    </div>
  );
}
