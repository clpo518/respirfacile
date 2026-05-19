import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, Calendar, Star, RotateCcw } from "lucide-react"
import { getExerciseById } from "@/data/exercises"
import type { SessionRow } from "@/integrations/supabase/types"

// ─────────────────────────────────────────────
// SessionDetail — résumé d'une séance passée
// ─────────────────────────────────────────────

const SessionDetail = () => {
  const { id: sessionId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: session, isLoading } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user?.id ?? "")
        .maybeSingle()
      return data as SessionRow | null
    },
    enabled: !!sessionId && !!user?.id,
  })

  const exercise = session ? getExerciseById(session.exercise_id) : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-organic flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-organic flex flex-col items-center justify-center gap-4 px-5">
        <p className="text-muted-foreground">Séance introuvable</p>
        <button onClick={() => navigate(-1)} className="btn-forest-outline px-5 py-2.5 text-sm rounded-pill">
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-organic pb-10">

      {/* ── Header ──────────────────────────── */}
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <p className="text-sm text-muted-foreground">Détail de séance</p>
          <h1 className="font-display text-xl text-foreground">
            {exercise?.name_fr ?? session.exercise_id}
          </h1>
        </div>
      </header>

      <div className="px-5 space-y-4">

        {/* ── Icône + date ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-rf p-5 flex flex-col items-center gap-3 text-center"
        >
          <div className="text-5xl">{exercise?.icon ?? "🫁"}</div>
          <div>
            <p className="font-display text-lg text-foreground">
              {exercise?.name_fr ?? session.exercise_id}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(session.created_at).toLocaleDateString("fr-FR", {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>
          {session.completed && (
            <span className="badge-active px-3 py-1">Séance complétée ✓</span>
          )}
        </motion.div>

        {/* ── Stats ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-3"
        >
          <MiniStat
            icon={<Clock className="w-4 h-4 text-primary" />}
            value={formatDuration(session.duration_seconds)}
            label="Durée"
          />
          {session.score != null && (
            <MiniStat
              icon={<Star className="w-4 h-4 text-primary" />}
              value={`${session.score}%`}
              label="Score"
            />
          )}
        </motion.div>

        {/* ── Description exercice ─────────── */}
        {exercise && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="card-sand p-4"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              À propos de l'exercice
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {exercise.description_fr}
            </p>
          </motion.div>
        )}

        {/* ── Relancer ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => navigate(`/session-live?exercise=${session.exercise_id}`)}
            className="w-full btn-forest py-3.5 gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Refaire cet exercice
          </button>
        </motion.div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-components & helpers
// ─────────────────────────────────────────────

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="card-rf p-3 text-center">
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className="font-display text-xl text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m${s > 0 ? ` ${s}s` : ""}` : `${s}s`
}

export default SessionDetail
