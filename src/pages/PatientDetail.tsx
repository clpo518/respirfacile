import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { motion } from "framer-motion"
import {
  ArrowLeft, Calendar, Clock, TrendingUp, Activity,
  FileText, ChevronRight, Dumbbell, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SessionRow } from "@/integrations/supabase/types"
import { getExerciseById } from "@/data/exercises"
import { ActivityHeatmap } from "@/components/pro/ActivityHeatmap"

// ─────────────────────────────────────────────
// PatientDetail — vue thérapeute
// ─────────────────────────────────────────────

const PatientDetail = () => {
  const { id: patientId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile, isPatient } = useAuth()

  // Marque la consultation pour la checklist onboarding (thérapeute uniquement)
  useEffect(() => {
    if (!isPatient) localStorage.setItem("rf_checklist_consult", "1")
  }, [isPatient])

  if (isPatient) {
    navigate("/dashboard")
    return null
  }

  // ── Profil patient ────────────────────────
  const { data: patient } = useQuery({
    queryKey: ["patient_profile", patientId],
    queryFn: async () => {
      if (!patientId) return null
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email, created_at")
        .eq("id", patientId)
        .maybeSingle()
      return data
    },
    enabled: !!patientId,
  })

  // ── Programme actif ───────────────────────
  const { data: program } = useQuery({
    queryKey: ["patient_program_detail", patientId],
    queryFn: async () => {
      if (!patientId) return null
      const { data } = await supabase
        .from("patient_programs")
        .select("*")
        .eq("patient_id", patientId)
        .eq("is_active", true)
        .maybeSingle()
      return data
    },
    enabled: !!patientId,
  })

  // ── Dernières 5 sessions ──────────────────
  const { data: sessions = [] } = useQuery({
    queryKey: ["patient_sessions", patientId],
    queryFn: async () => {
      if (!patientId) return []
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", patientId)
        .eq("completed", true)
        .order("created_at", { ascending: false })
        .limit(5)
      return (data ?? []) as SessionRow[]
    },
    enabled: !!patientId,
  })

  // ── Stats globales ────────────────────────
  const { data: totalCount = 0 } = useQuery({
    queryKey: ["patient_total_sessions", patientId],
    queryFn: async () => {
      if (!patientId) return 0
      const { count } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", patientId)
        .eq("completed", true)
      return count ?? 0
    },
    enabled: !!patientId,
  })

  const startOfWeek = getStartOfWeek().toISOString()
  const { data: weekCount = 0 } = useQuery({
    queryKey: ["patient_week_sessions", patientId],
    queryFn: async () => {
      if (!patientId) return 0
      const { count } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", patientId)
        .eq("completed", true)
        .gte("created_at", startOfWeek)
      return count ?? 0
    },
    enabled: !!patientId,
  })

  const initials = patient?.full_name
    ? patient.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??"

  const profileTypeLabel = program?.profile_type
    ? PROFILE_TYPE_LABELS[program.profile_type] ?? program.profile_type
    : null

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
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Fiche patient</p>
          <h1 className="font-display text-xl text-foreground">
            {patient?.full_name ?? "Patient"}
          </h1>
        </div>
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-primary">{initials}</span>
        </div>
      </header>

      <div className="px-5 space-y-5">

        {/* ── Programme actif ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-rf p-4 space-y-3"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Programme actif
          </p>

          {program ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg text-foreground">
                    {profileTypeLabel ?? "Programme personnalisé"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Semaine {program.week_number} · {program.jokers_used ?? 0} joker{(program.jokers_used ?? 0) !== 1 ? "s" : ""} utilisé{(program.jokers_used ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="badge-active">
                  Actif
                </div>
              </div>

              {/* Progress bar semaine */}
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Progression semaine</span>
                  <span>{weekCount}/7 séances</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.round((weekCount / 7) * 100))}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun programme actif. Configurez-en un via la séance d'évaluation.
            </p>
          )}
        </motion.div>

        {/* ── Stats rapides ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          <MiniStat
            icon={<Activity className="w-4 h-4 text-primary" />}
            value={weekCount}
            label="Cette semaine"
          />
          <MiniStat
            icon={<TrendingUp className="w-4 h-4 text-primary" />}
            value={totalCount}
            label="Total séances"
          />
          <MiniStat
            icon={<Star className="w-4 h-4 text-primary" />}
            value={program?.week_number ?? 0}
            label="Semaine actuelle"
          />
        </motion.div>

        {/* ── Heatmap activité ─────────────── */}
        {patientId && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="card-rf p-4"
          >
            <ActivityHeatmap userId={patientId} />
          </motion.div>
        )}

        {/* ── Dernières sessions ────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            5 dernières séances
          </p>

          {sessions.length === 0 ? (
            <div className="card-rf p-4 text-center">
              <p className="text-sm text-muted-foreground">Aucune séance pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session, i) => {
                const ex = getExerciseById(session.exercise_id)
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                      {ex?.icon ?? "🫁"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {ex?.name_fr ?? session.exercise_id}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(session.created_at)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDuration(session.duration_seconds)}
                        </span>
                      </div>
                    </div>
                    {session.score != null && (
                      <div className="text-xs font-medium text-primary shrink-0">
                        {session.score}%
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* ── Export PDF ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Button
            variant="outline"
            className="w-full gap-2 btn-forest-outline"
            onClick={() => alert("Export PDF — à implémenter avec Supabase Edge Function")}
          >
            <FileText className="w-4 h-4" />
            Exporter le bilan PDF
          </Button>
        </motion.div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="card-rf p-3 text-center">
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className="font-display text-xl text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Helpers & constants
// ─────────────────────────────────────────────

const PROFILE_TYPE_LABELS: Record<string, string> = {
  adult_saos_mild: "SAOS léger – Adulte",
  adult_saos_severe: "SAOS sévère – Adulte",
  adult_tmof: "TMOF – Adulte",
  adult_mixed: "SAOS + TMOF – Adulte",
  child_7_12: "Enfant 7-12 ans",
  child_2_6: "Enfant 2-6 ans",
}

function getStartOfWeek(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  })
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return m > 0 ? `${m} min` : `${seconds}s`
}

export default PatientDetail
