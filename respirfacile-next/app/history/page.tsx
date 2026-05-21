import { LogoIcon } from "@/components/ui/Logo"
import { createClient } from "@/lib/supabase/server"
import { PatientNavbar } from "@/components/layout/PatientNavbar"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"

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

  // Fetch last 50 sessions
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const hasSessions = sessions && sessions.length > 0

  // Group by exercise for stats
  const statsByExercise: Record<string, { count: number; avgScore: number; lastDate: string }> = {}
  if (sessions) {
    for (const s of sessions) {
      const key = s.exercise_id
      if (!statsByExercise[key]) {
        statsByExercise[key] = { count: 0, avgScore: 0, lastDate: s.created_at }
      }
      statsByExercise[key].count++
      statsByExercise[key].avgScore += s.score || 0
    }
    for (const key of Object.keys(statsByExercise)) {
      statsByExercise[key].avgScore = Math.round(statsByExercise[key].avgScore / statsByExercise[key].count)
    }
  }

  const totalSessions = sessions?.length ?? 0
  const totalMinutes = sessions ? Math.round(sessions.reduce((a: number, s: typeof sessions[0]) => a + (s.duration_seconds || 0), 0) / 60) : 0

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-stone-200 px-4 py-4 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-75 transition-opacity">
            <LogoIcon size={28} />
            <span className="font-semibold text-base text-stone-800">
              Respir<span className="text-[#8B4513]">facile</span>
            </span>
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-stone-800 mb-2">📊 Mon historique</h1>
          <p className="text-stone-600">Tes progrès au fil du temps.</p>
        </div>

        {!hasSessions ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="font-semibold text-lg text-stone-700 mb-2">
              Aucune séance pour l&apos;instant
            </h2>
            <p className="text-stone-500 mb-6">
              Lancez votre première séance pour commencer à voir votre progression ici.
            </p>
            <Link
              href="/exercises"
              className="inline-block px-6 py-3 bg-[#2D5016] text-white font-semibold rounded-2xl hover:bg-[#1e3a0f] transition-colors"
            >
              Voir les exercices →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-stone-200 p-5 text-center">
                <div className="text-3xl font-bold text-[#2D5016]">{totalSessions}</div>
                <div className="text-sm text-stone-500 mt-1">Séances totales</div>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-5 text-center">
                <div className="text-3xl font-bold text-[#2D5016]">{totalMinutes}</div>
                <div className="text-sm text-stone-500 mt-1">Minutes pratiquées</div>
              </div>
              <div className="bg-white rounded-2xl border border-stone-200 p-5 text-center col-span-2 sm:col-span-1">
                <div className="text-3xl font-bold text-[#2D5016]">{Object.keys(statsByExercise).length}</div>
                <div className="text-sm text-stone-500 mt-1">Exercices différents</div>
              </div>
            </div>

            {/* Sessions list */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100">
                <h2 className="font-semibold text-stone-800">Dernières séances</h2>
              </div>
              <div className="divide-y divide-stone-100">
                {sessions.map((session: typeof sessions[0]) => {
                  const date = new Date(session.created_at)
                  const dateStr = date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                  const duration = session.duration_seconds ? `${Math.round(session.duration_seconds / 60)} min` : "—"
                  return (
                    <div key={session.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-stone-800 capitalize">
                          {session.exercise_id.replace(/_/g, " ")}
                        </div>
                        <div className="text-sm text-stone-500">{dateStr} · {duration}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {session.score !== null && (
                          <div className="text-sm font-semibold text-[#2D5016] bg-green-50 px-3 py-1 rounded-full">
                            Score {session.score}
                          </div>
                        )}
                        {session.completed && (
                          <span className="text-green-500 text-lg">✓</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="text-center">
              <Link href="/exercises" className="text-[#2D5016] font-medium hover:underline text-sm">
                Faire une nouvelle séance →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
