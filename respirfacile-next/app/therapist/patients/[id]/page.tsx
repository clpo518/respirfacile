import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EXERCISES } from "@/lib/data/exercises";

interface Props {
  params: Promise<{ id: string }>;
}

function daysSince(date?: string | null): number {
  if (!date) return 999;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

function lastSessionLabel(d: number, hasDate: boolean): string {
  if (!hasDate) return "Jamais";
  if (d === 0) return "Aujourd'hui";
  if (d === 1) return "Hier";
  return `Il y a ${d}j`;
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isTherapist = myProfile?.role === "therapist" || myProfile?.role === "kine";
  if (!isTherapist) redirect("/dashboard");

  // Vérifier que ce patient appartient à ce thérapeute
  const { data: link } = await supabase
    .from("therapist_patients")
    .select("id, linked_at")
    .eq("therapist_id", user.id)
    .eq("patient_id", id)
    .single();

  if (!link) notFound();

  // Profil patient
  const { data: patient } = await supabase
    .from("profiles")
    .select("full_name, email, profile_type")
    .eq("id", id)
    .single();

  if (!patient) notFound();

  const patientName = patient.full_name || patient.email || "Patient";
  const initials = patientName.split(" ").map((w: string) => w[0]?.toUpperCase()).join("").slice(0, 2);

  // Sessions
  const { data: allSessions } = await supabase
    .from("sessions")
    .select("created_at, exercise_id, score")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const totalSessions = allSessions?.length ?? 0;
  const lastSession = allSessions?.[0]?.created_at ?? null;
  const dLast = daysSince(lastSession);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);
  const sessionsThisWeek = (allSessions ?? []).filter(
    (s) => new Date(s.created_at) >= weekStart
  ).length;

  // Prescriptions actives
  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("id, exercise_id, frequency_label, frequency_per_day, notes")
    .eq("patient_id", id)
    .eq("is_active", true);

  // Journal récent
  const { data: journalEntries } = await supabase
    .from("journal_entries")
    .select("id, created_at, wellbeing_score, anxiety_level, notes")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  const prescribedExercises = (prescriptions ?? [])
    .map((p) => {
      const ex = EXERCISES.find((e) => e.id === p.exercise_id);
      return ex ? { ...ex, ...p } : null;
    })
    .filter(Boolean) as any[];

  const retentionColor =
    !lastSession
      ? { bg: "bg-beige-100", text: "text-forest-500", label: "Nouveau", dot: "bg-beige-400" }
      : dLast <= 2
      ? { bg: "bg-green-100", text: "text-green-800", label: "Actif", dot: "bg-green-500" }
      : dLast <= 5
      ? { bg: "bg-amber-100", text: "text-amber-800", label: "En baisse", dot: "bg-amber-500" }
      : { bg: "bg-red-100", text: "text-red-800", label: "Inactif", dot: "bg-red-500" };

  return (
    <div className="min-h-screen bg-beige-200">
      {/* Header */}
      <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/therapist"
            className="flex items-center gap-1.5 text-forest-500 hover:text-forest-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Tableau de bord
          </Link>
          <Link
            href={`/therapist/patients/${id}/messages`}
            className="flex items-center gap-1.5 text-sm font-semibold bg-forest-600 text-white px-4 py-2 rounded-full hover:bg-forest-700 transition-colors"
          >
            💬 Envoyer un message
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Identité */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-forest-500/10 border-2 border-forest-500/20 flex items-center justify-center text-forest-700 text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-forest-800">{patientName}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${retentionColor.bg} ${retentionColor.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${retentionColor.dot}`} />
                {retentionColor.label}
              </span>
            </div>
            <p className="text-sm text-forest-500 mt-1">{patient.email}</p>
            {patient.profile_type && (
              <p className="text-xs text-forest-400 mt-0.5">Profil : {patient.profile_type}</p>
            )}
          </div>
        </div>

        {/* Métriques compliance */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className={`rounded-2xl border p-5 text-center ${
            sessionsThisWeek >= 3 ? "bg-green-50 border-green-200"
            : sessionsThisWeek >= 1 ? "bg-amber-50 border-amber-200"
            : "bg-red-50 border-red-200"
          }`}>
            <p className={`text-3xl font-bold ${
              sessionsThisWeek >= 3 ? "text-green-700"
              : sessionsThisWeek >= 1 ? "text-amber-700"
              : "text-red-600"
            }`}>
              {sessionsThisWeek}
            </p>
            <p className="text-xs font-medium text-forest-500 mt-1">séances cette sem.</p>
          </div>
          <div className="bg-white rounded-2xl border border-beige-200 p-5 text-center">
            <p className="text-3xl font-bold text-forest-800">{totalSessions}</p>
            <p className="text-xs font-medium text-forest-500 mt-1">séances au total</p>
          </div>
          <div className="bg-white rounded-2xl border border-beige-200 p-5 text-center">
            <p className={`text-xl font-bold ${
              dLast <= 2 ? "text-green-600" : dLast <= 5 ? "text-amber-600" : "text-red-500"
            }`}>
              {lastSessionLabel(dLast, !!lastSession)}
            </p>
            <p className="text-xs font-medium text-forest-500 mt-1">dernière séance</p>
          </div>
          <div className="bg-white rounded-2xl border border-beige-200 p-5 text-center">
            <p className="text-3xl font-bold text-forest-800">{prescribedExercises.length}</p>
            <p className="text-xs font-medium text-forest-500 mt-1">exercices prescrits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Programme */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-forest-800">💊 Programme actif</h2>
                <Link
                  href={`/therapist/patients/${id}/program`}
                  className="text-xs font-semibold text-forest-600 hover:text-forest-800 underline-offset-2 hover:underline transition-colors"
                >
                  Modifier →
                </Link>
              </div>

              {prescribedExercises.length > 0 ? (
                <div className="space-y-3">
                  {prescribedExercises.map((ex: any) => (
                    <div key={ex.id} className="bg-white rounded-2xl border border-beige-200 p-4 flex items-start gap-4">
                      <span className="text-2xl flex-shrink-0 mt-0.5">{ex.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-forest-800 text-sm">{ex.name_fr}</p>
                        <p className="text-xs text-forest-500 mt-0.5 leading-relaxed">{ex.description_fr}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs bg-forest-500/10 text-forest-700 px-2 py-0.5 rounded-full font-medium">
                            {ex.frequency_label || `${ex.frequency_per_day}x/jour`}
                          </span>
                          <span className="text-xs text-forest-400">{Math.floor(ex.duration_seconds / 60)} min</span>
                        </div>
                        {ex.notes && (
                          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 mt-2 italic">
                            💬 {ex.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-beige-300 p-8 text-center">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-forest-600 font-medium mb-1">Aucun exercice prescrit</p>
                  <p className="text-sm text-forest-400 mb-4">Créez un programme pour ce patient.</p>
                  <Link
                    href={`/therapist/patients/${id}/program`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Prescrire des exercices →
                  </Link>
                </div>
              )}
            </div>

            {/* Activité récente */}
            {totalSessions > 0 && (
              <div>
                <h2 className="text-xl font-bold text-forest-800 mb-3">📈 Activité récente</h2>
                <div className="bg-white rounded-2xl border border-beige-200 overflow-hidden">
                  {(allSessions ?? []).slice(0, 8).map((s: any, i: number) => {
                    const ex = EXERCISES.find((e) => e.id === s.exercise_id);
                    const d = new Date(s.created_at);
                    return (
                      <div key={i} className={`flex items-center gap-4 px-5 py-3 ${i < 7 ? "border-b border-beige-100" : ""}`}>
                        <span className="text-lg flex-shrink-0">{ex?.emoji ?? "🫁"}</span>
                        <p className="flex-1 text-sm font-medium text-forest-800 truncate min-w-0">
                          {ex?.name_fr ?? s.exercise_id}
                        </p>
                        <div className="text-right flex-shrink-0">
                          {s.score != null && (
                            <p className="text-xs font-bold text-copper-600">{s.score}%</p>
                          )}
                          <p className="text-xs text-forest-400">
                            {d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Actions rapides */}
            <div className="bg-white rounded-2xl border border-beige-200 p-5">
              <h3 className="font-semibold text-forest-800 mb-3 text-sm">Actions rapides</h3>
              <div className="space-y-2">
                {[
                  { href: `/therapist/patients/${id}/messages`, icon: "💬", label: "Envoyer un message" },
                  { href: `/therapist/patients/${id}/program`, icon: "📋", label: "Gérer le programme" },
                  { href: `/therapist/patients/${id}/notes`, icon: "✏️", label: "Notes de séance" },
                  { href: `/therapist/patients/${id}/journal`, icon: "📓", label: "Journal du patient" },
                ].map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-beige-50 hover:bg-beige-100 text-forest-700 text-sm font-medium transition-colors"
                  >
                    <span className="text-base">{action.icon}</span>
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Journal récent */}
            {(journalEntries ?? []).length > 0 && (
              <div className="bg-white rounded-2xl border border-beige-200 p-5">
                <h3 className="font-semibold text-forest-800 mb-3 text-sm">Derniers bilans</h3>
                <div className="space-y-3 divide-y divide-beige-100">
                  {(journalEntries ?? []).map((entry: any) => {
                    const d = new Date(entry.created_at);
                    return (
                      <div key={entry.id} className="pt-3 first:pt-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-forest-400">
                            {d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {entry.wellbeing_score != null && (
                              <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                😊 {entry.wellbeing_score}/5
                              </span>
                            )}
                            {entry.anxiety_level != null && (
                              <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                                😰 {entry.anxiety_level}/5
                              </span>
                            )}
                          </div>
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-forest-600 italic line-clamp-2">{entry.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="bg-beige-100 rounded-2xl border border-beige-200 p-4 text-center">
              <p className="text-xs text-forest-400">
                Patient ajouté le{" "}
                {new Date(link.linked_at ?? Date.now()).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
