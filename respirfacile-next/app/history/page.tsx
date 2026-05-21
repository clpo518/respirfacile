import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { EXERCISES } from "@/lib/data/exercises"
import { MobileBottomNavClient } from "@/components/MobileBottomNavClient"

export const metadata: Metadata = {
  title: "Mon historique | Respirfacile",
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isTherapist = profile?.role === "therapist" || profile?.role === "kine"
  if (isTherapist) redirect("/therapist")

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const hasSessions = sessions && sessions.length > 0

  const totalSessions = sessions?.length ?? 0
  const totalMinutes = sessions
    ? Math.round(sessions.reduce((a: number, s: any) => a + (s.duration_seconds || 0), 0) / 60)
    : 0

  // Unique exercises practiced
  const uniqueExercises = new Set(sessions?.map((s: any) => s.exercise_id) ?? []).size

  // Group sessions by date for display
  const grouped: Record<string, typeof sessions> = {}
  for (const s of sessions ?? []) {
    const key = new Date(s.created_at).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long",
    })
    if (!grouped[key]) grouped[key] = []
    grouped[key]!.push(s)
  }

  return (
    <div className="min-h-screen bg-beige-200">
      <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-forest-500 hover:text-forest-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Tableau de bord
          </Link>
          <span className="font-semibold text-forest-800 text-sm">📊 Mon historique</span>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-28 md:pb-8">
        <h1 className="font-display text-3xl font-bold text-forest-800 mb-1">Mon historique</h1>
        <p className="text-forest-500 mb-8">Toutes vos séances passées.</p>

        {!hasSessions ? (
          <div className="bg-beige-100 rounded-3xl border border-beige-300 p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="font-semibold text-lg text-forest-700 mb-2">Aucune séance pour l&apos;instant</h2>
            <p className="text-forest-500 mb-6 text-sm">
              Lancez votre première séance pour commencer à voir votre progression ici.
            </p>
            <Link
              href="/exercises"
              className="inline-block px-6 py-3 bg-forest-600 text-white font-semibold rounded-2xl hover:bg-forest-700 transition-colors"
            >
              Voir les exercices →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: totalSessions, label: "Séances", icon: "💪" },
                { value: `${totalMinutes} min`, label: "Pratiquées", icon: "⏱" },
                { value: uniqueExercises, label: "Exercices", icon: "🏋️" },
              ].map((s) => (
                <div key={s.label} className="bg-beige-100 rounded-2xl border border-beige-300 p-4 text-center">
                  <p className="text-xs text-forest-500 mb-1">{s.icon}</p>
                  <p className="text-2xl font-bold text-forest-800">{s.value}</p>
                  <p className="text-xs text-forest-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Sessions grouped by day */}
            <div className="space-y-4">
              {Object.entries(grouped).map(([date, daySessions]) => (
                <div key={date}>
                  <p className="text-xs font-semibold text-forest-500 uppercase tracking-widest mb-2 capitalize">
                    {date}
                  </p>
                  <div className="bg-beige-100 rounded-2xl border border-beige-300 overflow-hidden">
                    {(daySessions ?? []).map((session: any, i: number) => {
                      const ex = EXERCISES.find((e) => e.id === session.exercise_id)
                      const name = ex?.name_fr ?? session.exercise_id.replace(/_/g, " ")
                      const emoji = ex?.emoji ?? "🫁"
                      const duration = session.duration_seconds
                        ? `${Math.round(session.duration_seconds / 60)} min`
                        : null
                      const isLast = i === (daySessions?.length ?? 0) - 1
                      return (
                        <div
                          key={session.id}
                          className={`flex items-center gap-4 px-5 py-3.5 ${!isLast ? "border-b border-beige-200" : ""}`}
                        >
                          <span className="text-xl flex-shrink-0">{emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-forest-800 text-sm truncate">{name}</p>
                            {duration && (
                              <p className="text-xs text-forest-400">{duration}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {session.score != null && (
                              <span className="text-xs font-semibold bg-copper-500/10 text-copper-700 px-2 py-0.5 rounded-full">
                                {session.score > 5 ? `${session.score}%` : `${session.score}★`}
                              </span>
                            )}
                            {session.completed && (
                              <div className="w-5 h-5 rounded-full bg-forest-500 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-2">
              <Link href="/exercises" className="text-forest-600 font-medium hover:text-forest-800 transition-colors text-sm">
                Faire une nouvelle séance →
              </Link>
            </div>
          </div>
        )}
      </main>

      <MobileBottomNavClient />
    </div>
  )
}
