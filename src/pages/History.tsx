import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { AppLayout } from "@/components/AppLayout"
import { getExerciseById } from "@/data/exercises"
import { motion } from "framer-motion"
import { Clock, ChevronRight, Calendar } from "lucide-react"
import type { SessionRow } from "@/integrations/supabase/types"

// ─────────────────────────────────────────────
// History — historique des séances patient
// ─────────────────────────────────────────────

const CAT_CHIP: Record<string, string> = {
  pause_controlee:     "bg-emerald-100 text-emerald-700",
  coherence_cardiaque: "bg-red-100 text-red-700",
  respiration_nasale:  "bg-sky-100 text-sky-700",
  myofonctionnel:      "bg-violet-100 text-violet-700",
  diaphragmatique:     "bg-orange-100 text-orange-700",
  relaxation:          "bg-teal-100 text-teal-700",
}

const CAT_LABEL: Record<string, string> = {
  pause_controlee:     "Pause Contrôlée",
  coherence_cardiaque: "Cohérence Cardiaque",
  respiration_nasale:  "Respiration Nasale",
  myofonctionnel:      "Muscles orofaciaux",
  diaphragmatique:     "Respiration abdominale",
  relaxation:          "Relaxation",
}

const History = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["all_sessions", user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("created_at", { ascending: false })
        .limit(50)
      return (data ?? []) as SessionRow[]
    },
    enabled: !!user,
  })

  // Grouper par mois
  const grouped: Record<string, SessionRow[]> = {}
  sessions.forEach(s => {
    const key = new Date(s.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(s)
  })

  return (
    <AppLayout>
      <div className="pb-24 lg:pb-10">

        {/* ── Header ──────────────────────────── */}
        <header className="px-6 pt-10 lg:pt-12 pb-4">
          <p className="text-sm text-muted-foreground">Mon parcours</p>
          <h1 className="font-display text-2xl text-foreground mt-0.5">Historique</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {sessions.length} séance{sessions.length !== 1 ? "s" : ""} complétée{sessions.length !== 1 ? "s" : ""}
            </p>
          )}
        </header>

        <div className="px-6 space-y-6 mt-2">

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 rounded-xl bg-muted/60 animate-pulse" />
              ))}
            </div>
          )}

          {/* Vide */}
          {!isLoading && sessions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <span className="text-4xl mb-4 block">🌿</span>
              <p className="font-display text-lg text-foreground">Aucune séance pour l'instant</p>
              <p className="text-sm text-muted-foreground mt-1 mb-5">
                Faites votre premier exercice pour démarrer votre historique.
              </p>
              <button
                onClick={() => navigate("/practice")}
                className="btn-forest px-6 py-2.5 text-sm"
              >
                Explorer les exercices
              </button>
            </motion.div>
          )}

          {/* Groupes par mois */}
          {!isLoading && Object.entries(grouped).map(([month, monthSessions], gi) => (
            <motion.div
              key={month}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.04 }}
            >
              {/* Titre mois */}
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {month}
                </p>
                <span className="text-[10px] text-muted-foreground/60">
                  · {monthSessions.length} séance{monthSessions.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Liste */}
              <div className="space-y-2">
                {monthSessions.map((s, i) => {
                  const ex  = getExerciseById(s.exercise_id)
                  const dur = s.duration_seconds
                    ? `${Math.floor(s.duration_seconds / 60)}m${s.duration_seconds % 60 > 0 ? ` ${s.duration_seconds % 60}s` : ""}`
                    : "—"
                  const day = new Date(s.created_at).toLocaleDateString("fr-FR", {
                    weekday: "short", day: "numeric", month: "short",
                  })

                  return (
                    <motion.button
                      key={s.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: gi * 0.04 + i * 0.02 }}
                      onClick={() => navigate(`/session/${s.id}`)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all text-left group"
                    >
                      {/* Icône */}
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 text-xl">
                        {ex?.icon ?? "🫁"}
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {ex?.name_fr ?? s.exercise_id}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />{dur}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CAT_CHIP[s.exercise_category] ?? "bg-muted text-muted-foreground"}`}>
                            {CAT_LABEL[s.exercise_category] ?? s.exercise_category}
                          </span>
                        </div>
                      </div>

                      {/* Date + flèche */}
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">{day}</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 mt-1 ml-auto group-hover:text-primary transition-colors" />
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </AppLayout>
  )
}

export default History
