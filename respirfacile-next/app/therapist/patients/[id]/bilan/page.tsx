import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { EXERCISES } from "@/lib/data/exercises";
import {
  journalTrends,
  scoreProgress,
  trendDirection,
  weeklyObservance,
  type BilanJournalEntry,
  type BilanSession,
} from "@/lib/bilan";
import { computeStreak } from "@/lib/streak";
import { legalEntity, siteName } from "@/lib/site";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: "Bilan de suivi",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

const PROFILE_LABELS: Record<string, string> = {
  adult_saos_mild: "Apnées légères à modérées",
  adult_saos_severe: "Forme sévère, sous pression positive continue",
  adult_tmof: "Thérapie myofonctionnelle",
  adult_mixed: "Profil mixte",
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BilanPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const isTherapist = myProfile?.role === "therapist" || myProfile?.role === "kine";
  if (!isTherapist) redirect("/dashboard");

  // Le bilan expose l'intégralité du suivi d'un patient : le rattachement se
  // vérifie ici, en plus des politiques RLS.
  const { data: link } = await supabase
    .from("therapist_patients")
    .select("id, created_at")
    .eq("therapist_id", user.id)
    .eq("patient_id", id)
    .single();
  if (!link) notFound();

  const [{ data: patient }, { data: sessionsData }, { data: journalData }, { data: prescriptions }, { data: program }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("id", id).single(),
      supabase
        .from("sessions")
        .select("created_at, exercise_id, score, duration_seconds")
        .eq("user_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("journal_entries")
        .select("created_at, wellbeing_score, sleep_score, anxiety_level, nasal_breathing")
        .eq("user_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("prescriptions")
        .select("exercise_id, frequency_label, frequency_per_day, notes")
        .eq("patient_id", id)
        .eq("is_active", true),
      supabase
        .from("patient_programs")
        .select("profile_type, week_number")
        .eq("patient_id", id)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

  if (!patient) notFound();

  const sessions = (sessionsData ?? []) as BilanSession[];
  const journal = (journalData ?? []) as BilanJournalEntry[];

  const patientName = patient.full_name || patient.email || "Patient";
  const observance = weeklyObservance(sessions, 8);
  const progress = scoreProgress(sessions);
  const trends = journalTrends(journal);
  const streak = computeStreak(sessions.map((s) => s.created_at));
  const maxWeekly = Math.max(1, ...observance.map((w) => w.sessions));
  const totalMinutes = Math.round(
    sessions.reduce((total, s) => total + (s.duration_seconds ?? 0), 0) / 60,
  );

  return (
    <div className="min-h-screen bg-beige-200 print:bg-white">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 14mm; }
          body { background: white; }
        }
      `}</style>

      <header className="no-print bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Link
            href={`/therapist/patients/${id}`}
            className="flex items-center gap-1.5 text-forest-500 hover:text-forest-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Fiche patient
          </Link>
          <PrintButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 print:py-0 print:px-0">
        <article className="bg-white rounded-3xl border border-beige-300 p-8 sm:p-10 print:border-0 print:rounded-none print:p-0 space-y-8">

          {/* En-tête */}
          <header className="border-b border-beige-300 pb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper-600 mb-2">
              {siteName}, bilan de suivi
            </p>
            <h1 className="text-3xl font-bold text-forest-800">{patientName}</h1>
            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <dt className="text-forest-400 text-xs">Praticien</dt>
                <dd className="text-forest-800 font-medium">{myProfile?.full_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-forest-400 text-xs">Édité le</dt>
                <dd className="text-forest-800 font-medium">{formatDate(new Date().toISOString())}</dd>
              </div>
              <div>
                <dt className="text-forest-400 text-xs">Suivi depuis</dt>
                <dd className="text-forest-800 font-medium">{formatDate(link.created_at)}</dd>
              </div>
              <div>
                <dt className="text-forest-400 text-xs">Profil prescrit</dt>
                <dd className="text-forest-800 font-medium">
                  {program?.profile_type ? PROFILE_LABELS[program.profile_type] ?? program.profile_type : "Non renseigné"}
                </dd>
              </div>
            </dl>
          </header>

          {/* Vue d'ensemble */}
          <section>
            <h2 className="text-lg font-bold text-forest-800 mb-3">Vue d&apos;ensemble</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: sessions.length, label: "séances réalisées" },
                { value: `${totalMinutes} min`, label: "de pratique cumulée" },
                { value: streak.current, label: "jours de suite" },
                { value: journal.length, label: "bilans hebdomadaires" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-beige-300 p-4 text-center">
                  <p className="text-2xl font-bold text-forest-800">{stat.value}</p>
                  <p className="text-xs text-forest-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Observance */}
          <section>
            <h2 className="text-lg font-bold text-forest-800 mb-1">Observance, 8 dernières semaines</h2>
            <p className="text-xs text-forest-500 mb-4">
              Nombre de séances par semaine. Les semaines sans séance sont conservées.
            </p>
            <div className="flex items-end gap-2 h-32 border-b border-beige-300 pb-1">
              {observance.map((week) => (
                <div key={week.weekStart} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <span className="text-xs font-semibold text-forest-700">{week.sessions}</span>
                  <div
                    className={`w-full rounded-t ${week.sessions === 0 ? "bg-beige-300" : "bg-forest-500"}`}
                    style={{ height: `${Math.max(2, (week.sessions / maxWeekly) * 90)}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              {observance.map((week) => (
                <span key={week.weekStart} className="flex-1 text-center text-[10px] text-forest-400">
                  {week.label}
                </span>
              ))}
            </div>
          </section>

          {/* Progression chiffrée */}
          <section>
            <h2 className="text-lg font-bold text-forest-800 mb-1">Évolution des scores</h2>
            <p className="text-xs text-forest-500 mb-4">
              Chaque exercice conserve son unité. Le score de pause du test de découverte se compte en pas.
            </p>
            {progress.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-forest-400 border-b border-beige-300">
                    <th className="pb-2 font-medium">Exercice</th>
                    <th className="pb-2 font-medium">Première mesure</th>
                    <th className="pb-2 font-medium">Dernière mesure</th>
                    <th className="pb-2 font-medium">Meilleure</th>
                    <th className="pb-2 font-medium">Écart</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.map((row) => (
                    <tr key={row.exerciseId} className="border-b border-beige-200 last:border-0">
                      <td className="py-2.5 font-medium text-forest-800">{row.exerciseName}</td>
                      <td className="py-2.5 text-forest-600">
                        {row.first} {row.unit}
                        <span className="text-forest-400 text-xs"> · {formatDate(row.firstDate)}</span>
                      </td>
                      <td className="py-2.5 text-forest-600">
                        {row.last} {row.unit}
                        <span className="text-forest-400 text-xs"> · {formatDate(row.lastDate)}</span>
                      </td>
                      <td className="py-2.5 text-forest-600">{row.best} {row.unit}</td>
                      <td className={`py-2.5 font-semibold ${row.delta > 0 ? "text-forest-700" : row.delta < 0 ? "text-copper-700" : "text-forest-400"}`}>
                        {row.delta > 0 ? "+" : ""}{row.delta} {row.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-forest-500">
                Aucun exercice chiffré réalisé pour l&apos;instant.
              </p>
            )}
          </section>

          {/* Journal */}
          <section>
            <h2 className="text-lg font-bold text-forest-800 mb-1">Ressenti déclaré par le patient</h2>
            <p className="text-xs text-forest-500 mb-4">
              Moyenne de la première moitié des bilans hebdomadaires face à la seconde, sur une échelle de 1 à 10.
              Données déclaratives, sans valeur diagnostique.
            </p>
            {journal.length >= 2 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-forest-400 border-b border-beige-300">
                    <th className="pb-2 font-medium">Indicateur</th>
                    <th className="pb-2 font-medium">Début</th>
                    <th className="pb-2 font-medium">Récent</th>
                    <th className="pb-2 font-medium">Tendance</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map((trend) => {
                    const direction = trendDirection(trend);
                    return (
                      <tr key={trend.key} className="border-b border-beige-200 last:border-0">
                        <td className="py-2.5 font-medium text-forest-800">{trend.label}</td>
                        <td className="py-2.5 text-forest-600">{trend.firstAverage ?? "—"}</td>
                        <td className="py-2.5 text-forest-600">{trend.lastAverage ?? "—"}</td>
                        <td className={`py-2.5 font-medium ${
                          direction === "amélioration" ? "text-forest-700"
                          : direction === "dégradation" ? "text-copper-700"
                          : "text-forest-400"
                        }`}>
                          {direction ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-forest-500">
                Pas encore assez de bilans hebdomadaires pour dégager une tendance.
              </p>
            )}
          </section>

          {/* Programme */}
          <section>
            <h2 className="text-lg font-bold text-forest-800 mb-1">Programme prescrit</h2>
            <p className="text-xs text-forest-500 mb-4">
              {program?.week_number ? `Semaine ${program.week_number} du programme.` : "Semaine non renseignée."}
            </p>
            {(prescriptions ?? []).length > 0 ? (
              <ul className="space-y-2">
                {(prescriptions ?? []).map((prescription) => {
                  const exercise = EXERCISES.find((e) => e.id === prescription.exercise_id);
                  return (
                    <li key={prescription.exercise_id} className="flex items-start gap-3 text-sm">
                      <span className="text-base">{exercise?.emoji ?? "🫁"}</span>
                      <div>
                        <p className="font-medium text-forest-800">
                          {exercise?.name_fr ?? prescription.exercise_id}
                          <span className="text-forest-500 font-normal">
                            {" · "}
                            {prescription.frequency_label || `${prescription.frequency_per_day ?? 1} fois par jour`}
                          </span>
                        </p>
                        {prescription.notes && (
                          <p className="text-xs text-forest-500 italic mt-0.5">{prescription.notes}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-forest-500">Aucun exercice prescrit pour l&apos;instant.</p>
            )}
          </section>

          {/* Mentions */}
          <footer className="border-t border-beige-300 pt-5 text-xs text-forest-500 leading-relaxed space-y-2">
            <p>
              <strong>Nature de ce document.</strong> Ce bilan restitue une activité de pratique et des scores
              déclarés par le patient. {siteName} n&apos;est pas un dispositif médical : aucune valeur figurant ici
              n&apos;a de portée diagnostique, et aucune décision thérapeutique ne doit reposer sur ce seul document.
              La rééducation myofonctionnelle vient en complément des traitements en cours, jamais en remplacement.
            </p>
            <p>
              Document édité par {myProfile?.full_name || "le praticien"} depuis {siteName}, {legalEntity.name}.
              Il contient des données de santé : à transmettre par un canal sécurisé et avec l&apos;accord du patient.
            </p>
          </footer>
        </article>
      </main>
    </div>
  );
}
