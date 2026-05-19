import { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { motion } from "framer-motion"
import {
  Users, ChevronRight, Copy, CheckCheck,
  TrendingUp, Activity, Wind, Layers
} from "lucide-react"
import TrialBanner from "@/components/pro/TrialBanner"
import OnboardingChecklist from "@/components/pro/OnboardingChecklist"
import { RecommendButton } from "@/components/pro/RecommendButton"
import { AppLayout } from "@/components/AppLayout"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PatientWithStats {
  id: string
  full_name: string | null
  avatar_url: string | null
  profile_type: string | null
  week_number: number
  last_session_at: string | null
  sessions_this_week: number
  completion_rate: number
  is_active: boolean
}

// ─────────────────────────────────────────────
// TherapistDashboard
// ─────────────────────────────────────────────

const TherapistDashboard = () => {
  const navigate = useNavigate()
  const { profile, isPatient, isTrialing } = useAuth()
  const [codeCopied, setCodeCopied] = useState(false)

  if (isPatient) return <Navigate to="/dashboard" replace />

  const therapistCode = profile?.therapist_code ?? "—"
  const firstName = profile?.full_name?.split(" ")[0] ?? "Praticien"

  const copyCode = () => {
    navigator.clipboard.writeText(therapistCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  // ── Patients ──────────────────────────────
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["therapist_patients", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return []

      const { data: links, error: linksError } = await supabase
        .from("therapist_patients")
        .select("patient_id, is_active")
        .eq("therapist_id", profile.id)

      if (linksError || !links?.length) return []

      const patientIds = links.map(l => l.patient_id)
      const activeMap = Object.fromEntries(links.map(l => [l.patient_id, l.is_active]))

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", patientIds)

      if (profilesError) return []

      const { data: programs } = await supabase
        .from("patient_programs")
        .select("patient_id, profile_type, week_number")
        .in("patient_id", patientIds)
        .eq("is_active", true)

      const startOfWeek = getStartOfWeek().toISOString()
      const { data: sessions } = await supabase
        .from("sessions")
        .select("user_id, created_at")
        .in("user_id", patientIds)
        .eq("completed", true)
        .gte("created_at", startOfWeek)

      const { data: lastSessions } = await supabase
        .from("sessions")
        .select("user_id, created_at")
        .in("user_id", patientIds)
        .eq("completed", true)
        .order("created_at", { ascending: false })

      const programMap = Object.fromEntries(
        (programs ?? []).map(p => [p.patient_id, p])
      )
      const sessionsCountMap: Record<string, number> = {}
      for (const s of sessions ?? []) {
        sessionsCountMap[s.user_id] = (sessionsCountMap[s.user_id] ?? 0) + 1
      }
      const lastSessionMap: Record<string, string> = {}
      for (const s of lastSessions ?? []) {
        if (!lastSessionMap[s.user_id]) lastSessionMap[s.user_id] = s.created_at
      }

      return (profiles ?? []).map(p => {
        const prog = programMap[p.id]
        const sessCount = sessionsCountMap[p.id] ?? 0
        return {
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          profile_type: prog?.profile_type ?? null,
          week_number: prog?.week_number ?? 0,
          last_session_at: lastSessionMap[p.id] ?? null,
          sessions_this_week: sessCount,
          completion_rate: sessCount >= 5 ? 100 : Math.round((sessCount / 5) * 100),
          is_active: activeMap[p.id] ?? true,
        }
      }) as PatientWithStats[]
    },
    enabled: !!profile?.id,
  })

  // ── Total sessions all-time ───────────────
  const { data: allTimeSessionsCount = 0 } = useQuery({
    queryKey: ["therapist_all_sessions_total", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0
      const { data: links } = await supabase
        .from("therapist_patients")
        .select("patient_id")
        .eq("therapist_id", profile.id)
      if (!links?.length) return 0
      const pids = links.map((l: { patient_id: string }) => l.patient_id)
      const { count } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .in("user_id", pids)
        .eq("completed", true)
      return count ?? 0
    },
    enabled: !!profile?.id,
  })

  // ── Stats globales ────────────────────────
  const totalSessionsThisWeek = patients.reduce((acc, p) => acc + p.sessions_this_week, 0)
  const avgCompletion = patients.length > 0
    ? Math.round(patients.reduce((acc, p) => acc + p.completion_rate, 0) / patients.length)
    : 0
  const activePatients = patients.filter(p => p.is_active).length

  // ── Triage patients ───────────────────────
  const patientsAtRisk    = patients.filter(p => p.is_active && p.sessions_this_week === 0)
  const patientsActive    = patients.filter(p => p.sessions_this_week > 0)

  // ── Checklist / Trial ─────────────────────
  const daysRemaining = (() => {
    if (!profile?.trial_ends_at) return 0
    const diff = new Date(profile.trial_ends_at).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })()
  const hasAssignedExercise = patients.some(p => p.week_number > 0)
  const hasConsultedPatient = typeof window !== "undefined" && localStorage.getItem("rf_checklist_consult") === "1"
  const firstPatientId = patients[0]?.id ?? null

  return (
    <AppLayout>
      <div className="pb-24 lg:pb-10">

        {/* ── TrialBanner ─────────────────────── */}
        {isTrialing && (
          <TrialBanner
            daysRemaining={daysRemaining}
            activePatients={activePatients}
            totalSessions={allTimeSessionsCount}
          />
        )}

        {/* ── Header ──────────────────────────── */}
        <header className="px-6 pt-10 pb-2 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {formatDay()}
            </p>
            <h1 className="font-display text-2xl text-foreground mt-1">
              Bonjour, {firstName} 👋
            </h1>
            {patients.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {activePatients} patient{activePatients !== 1 ? "s" : ""} actif{activePatients !== 1 ? "s" : ""} · {totalSessionsThisWeek} séance{totalSessionsThisWeek !== 1 ? "s" : ""} cette semaine
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 shrink-0">
            <RecommendButton />
          </div>
        </header>

        <div className="px-6 space-y-5 mt-6">

          {/* ── Checklist onboarding ─────────── */}
          <OnboardingChecklist
            hasPatients={patients.length > 0}
            hasAssignedExercise={hasAssignedExercise}
            hasConsultedPatient={hasConsultedPatient}
            therapistCode={therapistCode}
            firstPatientId={firstPatientId}
          />

          {/* ── Code PRO ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 bg-gradient-to-br from-forest-dark to-forest"
          >
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-2">
              Votre code praticien
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-3xl text-white tracking-[0.18em] font-bold">
                  {therapistCode}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Partagez-le à vos patients pour les inviter
                </p>
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-white text-xs font-semibold"
              >
                {codeCopied
                  ? <><CheckCheck className="w-4 h-4" /> Copié</>
                  : <><Copy className="w-4 h-4" /> Copier</>
                }
              </button>
            </div>
          </motion.div>

          {/* ── Aperçu hebdomadaire ───────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-3 gap-3"
          >
            <StatCard
              icon={<Activity className="w-4 h-4 text-primary" />}
              value={totalSessionsThisWeek}
              label="Séances"
              sub="cette semaine"
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4 text-primary" />}
              value={`${avgCompletion}%`}
              label="Observance"
              sub="en moyenne"
            />
            <StatCard
              icon={<Layers className="w-4 h-4 text-primary" />}
              value={allTimeSessionsCount}
              label="Total"
              sub="depuis le début"
            />
          </motion.div>

          {/* ── Liste patients ────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Mes patients · {patients.length}
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-4 animate-shimmer h-[88px]" />
                ))}
              </div>
            ) : patients.length === 0 ? (
              <EmptyPatients code={therapistCode} />
            ) : (
              <div className="space-y-2">

                {/* Patients à relancer — en premier pour triage clinique */}
                {patientsAtRisk.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-terra uppercase tracking-wider">⚡ À relancer</span>
                      <div className="flex-1 h-px bg-terra/20" />
                    </div>
                    {patientsAtRisk.map((patient, i) => (
                      <PatientRow key={patient.id} patient={patient} index={i} />
                    ))}
                  </>
                )}

                {/* Patients actifs */}
                {patientsActive.length > 0 && (
                  <>
                    {patientsAtRisk.length > 0 && (
                      <div className="flex items-center gap-2 mb-1 mt-4">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">🌿 En progression</span>
                        <div className="flex-1 h-px bg-primary/20" />
                      </div>
                    )}
                    {patientsActive.map((patient, i) => (
                      <PatientRow key={patient.id} patient={patient} index={patientsAtRisk.length + i} />
                    ))}
                  </>
                )}

              </div>
            )}
          </motion.div>

        </div>

      </div>
    </AppLayout>
  )
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function StatCard({
  icon, value, label, sub
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  sub?: string
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-3.5 text-center">
      <div className="flex items-center justify-center mb-1.5">{icon}</div>
      <p className="font-display text-2xl text-foreground leading-none">{value}</p>
      <p className="text-[11px] font-medium text-foreground/70 mt-1">{label}</p>
      {sub && <p className="text-[9px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  )
}

function PatientRow({ patient, index }: { patient: PatientWithStats; index: number }) {
  const navigate = useNavigate()
  const initials = patient.full_name
    ? patient.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??"

  const isAtRisk   = patient.sessions_this_week === 0
  const isOnTrack  = patient.sessions_this_week >= 4
  const progress   = Math.min(100, (patient.sessions_this_week / 5) * 100)

  const lastActive = patient.last_session_at
    ? formatRelativeDate(new Date(patient.last_session_at))
    : "Jamais"

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/patients/${patient.id}`)}
      className={`
        w-full flex items-center gap-3 p-4 rounded-2xl border bg-card
        hover:border-primary/30 hover:shadow-soft transition-all duration-200 text-left
        ${isAtRisk ? "border-terra/30 bg-terra/5" : "border-border"}
      `}
    >
      {/* Avatar */}
      <div className={`
        w-11 h-11 rounded-full flex items-center justify-center shrink-0
        ${isAtRisk ? "bg-terra/10" : "bg-primary/10"}
      `}>
        <span className={`text-sm font-semibold ${isAtRisk ? "text-terra" : "text-primary"}`}>
          {initials}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-foreground truncate">{patient.full_name ?? "Patient"}</p>
          <span className="text-[10px] text-muted-foreground ml-2 shrink-0">{lastActive}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAtRisk    ? "bg-muted-foreground/20" :
              isOnTrack   ? "bg-primary" :
                            "bg-amber-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">
            {patient.sessions_this_week}/5 séances
            {patient.week_number > 0 && ` · Semaine ${patient.week_number}`}
          </span>
          {isAtRisk  && <span className="text-[10px] font-bold text-terra/80">Aucune séance</span>}
          {isOnTrack && <span className="text-[10px] font-bold text-primary">En bonne voie ✓</span>}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </motion.button>
  )
}

function EmptyPatients({ code }: { code: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Wind className="w-8 h-8 text-primary/60" />
      </div>
      <div>
        <h2 className="font-display text-lg text-foreground">Aucun patient pour l'instant</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
          Partagez votre code{" "}
          <span className="font-bold text-primary tracking-wider">{code}</span>{" "}
          et vos patients rejoindront votre espace en quelques secondes.
        </p>
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full text-xs font-medium text-primary">
        <Users className="w-3 h-3" />
        Accès totalement gratuit pour les patients
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getStartOfWeek(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return "Hier"
  if (diffDays < 7) return `Il y a ${diffDays} j`
  return `Il y a ${Math.floor(diffDays / 7)} sem.`
}

function formatDay(): string {
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
  const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
  const now = new Date()
  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`
}

export default TherapistDashboard
