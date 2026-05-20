import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, Star, RotateCcw, History, BookOpen } from "lucide-react"
import { getExerciseById } from "@/data/exercises"
import type { SessionRow } from "@/integrations/supabase/types"

// ─────────────────────────────────────────────
// Bénéfice clinique par catégorie
// ─────────────────────────────────────────────

const CAT_BENEFITS: Record<string, string> = {
  pause_controlee:     "Améliore la tolérance au CO₂ — objectif : pause confortable ≥ 20 secondes (score BOLT ≥ 20), marqueur validé d'une bonne respiration nasale.",
  coherence_cardiaque: "Synchronise rythme cardiaque et respiration. Réduit le cortisol, améliore la qualité du sommeil en 4 semaines.",
  respiration_nasale:  "Réhabilite la respiration nasale exclusive : filtre l'air, réchauffe, réduit la résistance des voies aériennes supérieures.",
  myofonctionnel:      "Renforce les muscles oropharyngés — 13 essais randomisés confirment −50 % d'apnées en 3 mois avec des exercices quotidiens (Pisoni et al., 2024).",
  diaphragmatique:     "Active le diaphragme, améliore la ventilation alvéolaire et réduit la respiration thoracique superficielle.",
  relaxation:          "Réduit l'activation du système nerveux sympathique pour favoriser un endormissement plus rapide.",
}

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

// ─────────────────────────────────────────────
// SessionDetail — résumé enrichi d'une séance
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
        <span className="text-4xl">🌿</span>
        <p className="font-display text-lg text-foreground">Séance introuvable</p>
        <p className="text-sm text-muted-foreground">Cette séance n'existe pas ou ne vous appartient pas.</p>
        <button onClick={() => navigate("/history")} className="btn-forest px-5 py-2.5 text-sm rounded-xl gap-2 flex items-center">
          <History className="w-4 h-4" /> Voir mon historique
        </button>
      </div>
    )
  }

  const starsEarned = session.score != null ? Math.round(session.score / 20) : null
  const benefit = exercise ? CAT_BENEFITS[exercise.category] : null
  const catLabel = exercise ? (CAT_LABEL[exercise.category] ?? exercise.category) : null
  const catChip  = exercise ? (CAT_CHIP[exercise.category]  ?? "bg-muted text-muted-foreground") : null

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
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">Séance terminée</p>
          <h1 className="font-display text-xl text-foreground truncate">
            {exercise?.name_fr ?? session.exercise_id}
          </h1>
        </div>
        {catLabel && catChip && (
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${catChip}`}>
            {catLabel}
          </span>
        )}
      </header>

      <div className="px-5 space-y-4 max-w-lg mx-auto">

        {/* ── Carte principale ─────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-rf p-6 flex flex-col items-center gap-4 text-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="text-6xl"
          >
            {exercise?.icon ?? "🫁"}
          </motion.div>

          <div>
            <p className="font-display text-xl text-foreground">
              {exercise?.name_fr ?? session.exercise_id}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(session.created_at).toLocaleDateString("fr-FR", {
                weekday: "long", day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          </div>

          {/* Étoiles reçues */}
          {starsEarned != null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex gap-1.5"
            >
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-7 h-7 ${
                  s <= starsEarned ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25"
                }`} />
              ))}
            </motion.div>
          )}

          {/* Stats durée + score */}
          <div className="flex items-stretch gap-3 w-full pt-1">
            <div className="flex-1 rounded-2xl bg-muted/60 p-3 text-center">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="font-display text-xl text-foreground">{formatDuration(session.duration_seconds)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Durée</p>
            </div>
            <div className="flex-1 rounded-2xl bg-muted/60 p-3 text-center">
              <BookOpen className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="font-display text-xl text-foreground">
                {exercise?.instructions_fr.length ?? "—"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Étapes</p>
            </div>
          </div>
        </motion.div>

        {/* ── Bénéfice clinique ─────────────── */}
        {benefit && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="card-sand p-4"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Pourquoi cet exercice ?
            </p>
            <p className="text-sm text-foreground leading-relaxed">{benefit}</p>
          </motion.div>
        )}

        {/* ── Étapes réalisées ─────────────── */}
        {exercise && exercise.instructions_fr.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="card-rf p-4"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Étapes réalisées
            </p>
            <div className="space-y-2.5">
              {exercise.instructions_fr.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Actions ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3"
        >
          <Link
            to="/history"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <History className="w-4 h-4" />
            Historique
          </Link>
          <button
            onClick={() => navigate(`/session-live?exercise=${session.exercise_id}`)}
            className="flex-1 btn-forest py-3.5 gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Refaire
          </button>
        </motion.div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m${s > 0 ? ` ${s}s` : ""}` : `${s}s`
}

export default SessionDetail
