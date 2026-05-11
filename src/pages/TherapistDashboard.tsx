import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  Users, ChevronRight, Settings, Copy, CheckCheck,
  TrendingUp, Activity, Wind
} from "lucide-react"
import TrialBanner from "@/components/pro/TrialBanner"
import OnboardingChecklist from "@/components/pro/OnboardingChecklist"
import { RecommendButton } from "@/components/pro/RecommendButton"

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

  // Rediriger si c'est un patient
  if (isPatient) {
    navigate("/dashboard")
    return null
  }

  const therapistCode = profile?.therapist_code ?? "—"

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

      // 1. Récupérer les liens therapist_patients
      const { data: links, error: linksError } = await supabase
        .from("therapist_patients")
        .select("patient_id, is_active")
        .eq("therapist_id", profile.id)

      if (linksError || !links?.length) return []

      const patientIds = links.map(l => l.patient_id)
      const activeMap = Object.fromEntries(links.map(l => [l.patient_id, l.is_active]))

      // 2. Profils patients
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", patientIds)

      if (profilesError) return []

      // 3. Programmes actifs
      const { data: programs } = await supabase
        .from("patient_programs")
        .select("patient_id, profile_type, week_number")
        .in("patient_id", patientIds)
        .eq("is_active", true)

      // 4. Sessions cette semaine
      const startOfWeek = getStartOfWeek().toISOString()
      const { data: sessions } = await supabase
        .from("sessions")
        .select("user_id, created_at")
        .in("user_id", patientIds)
        .eq("completed", true)
        .gte("created_at", startOfWeek)

      // 5. Dernière session par patient
      const { data: lastSessions } = await supabase
        .from("sessions")
        .select("user_id, created_at")
        .in("user_id", patientIds)
        .eq("completed", true)
        .order("created_at", { ascending: false })

      // Agréger
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
    <div className="min-h-screen bg-organic pb-24">

      {/* ── TrialBanner ─────────────────────── */}
      {isTrialing && (
        <TrialBanner
          daysRemaining={daysRemaining}
          activePatients={activePatients}
          totalSessions={allTimeSessionsCount}
        />
      )}

      {/* ── Header ──────────────────────────── */}
      <header className="px-5 pt-12 pb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Espace praticien</p>
          <h1 className="font-display text-2xl text-foreground mt-0.5">
            {profile?.full_name?.split(" ")[0] ?? "Praticien"} 🌿
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-1 shrink-0">
          <RecommendButton />
          <Link to="/settings" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>
      </header>

      <div className="px-5 space-y-5 mt-6">

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
          className="card-rf p-4"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Votre code praticien
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-2xl text-primary tracking-widest">{therapistCode}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Partagez ce code à vos patients pour qu'ils s'inscrivent
              </p>
            </div>
            <button
              onClick={copyCode}
              className="p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              {codeCopied
                ? <CheckCheck className="w-5 h-5 text-primary" />
                : <Copy className="w-5 h-5 text-primary" />
              }
            </button>
          </div>
        </motion.div>

        {/* ── Aperçu hebdomadaire ───────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-rf p-4"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Aperçu hebdomadaire
          </p>
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={<Activity className="w-4 h-4 text-primary" />}
              value={totalSessionsThisWeek}
              label="Séances"
            />
            <StatCard
              icon={<TrendingUp className="w-4 h-4 text-primary" />}
              value={`${avgCompletion}%`}
              label="Complétion"
            />
            <StatCard
              icon={<Users className="w-4 h-4 text-primary" />}
              value={activePatients}
              label="Patients actifs"
            />
          </div>
        </motion.div>

        {/* ── Liste patients ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Mes patients · {patients.length}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="card-rf p-4 animate-shimmer h-20" />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <EmptyPatients code={therapistCode} />
          ) : (
            <div className="space-y-2">
              {patients.map((patient, i) => (
                <PatientRow key={patient.id} patient={patient} index={i} />
              ))}
            </div>
          )}
        </motion.div>

      </div>

      {/* ── Bottom nav ──────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3 flex items-center justify-around safe-area-bottom">
        <NavItem href="/patients" icon={<Users className="w-5 h-5" />} label="Patients" active />
        <NavItem href="/settings" icon={<Settings className="w-5 h-5" />} label="Profil" active={false} />
      </nav>
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3 text-center">
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className="font-display text-xl text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function PatientRow({ patient, index }: { patient: PatientWithStats; index: number }) {
  const navigate = useNavigate()
  const initials = patient.full_name
    ? patient.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??"

  const statusColor = patient.sessions_this_week >= 5
    ? "bg-primary/10 text-primary"
    : patient.sessions_this_week >= 2
    ? "bg-warning/15 text-warning"
    : "bg-muted text-muted-foreground"

  const statusLabel = patient.sessions_this_week >= 5
    ? "En bonne voie"
    : patient.sessions_this_week >= 2
    ? `${patient.sessions_this_week} séances`
    : patient.sessions_this_week === 0
    ? "Aucune séance"
    : `${patient.sessions_this_week} séance`

  const lastActive = patient.last_session_at
    ? formatRelativeDate(new Date(patient.last_session_at))
    : "Jamais connecté"

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/patients/${patient.id}`)}
      className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-soft transition-all duration-200 text-left"
    >
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-semibold text-primary">{initials}</span>
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {patient.full_name ?? "Patient"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`badge-rf text-[10px] px-2 py-0.5 ${statusColor}`}>
            {statusLabel}
          </span>
          {patient.week_number > 0 && (
            <span className="text-[10px] text-muted-foreground">
              S{patient.week_number}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{lastActive}</p>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </motion.button>
  )
}

function EmptyPatients({ code }: { code: string }) {
  return (
    <div className="card-rf p-6 text-center space-y-3">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Wind className="w-7 h-7 text-primary" />
      </div>
      <h2 className="font-display text-lg text-foreground">Aucun patient encore</h2>
      <p className="text-sm text-muted-foreground">
        Partagez votre code <span className="font-semibold text-primary">{code}</span> à vos patients pour qu'ils rejoignent votre espace.
      </p>
    </div>
  )
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <a href={href} className={`flex flex-col items-center gap-1 transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </a>
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
  if (diffDays < 7) return `Il y a ${diffDays} jours`
  return `Il y a ${Math.floor(diffDays / 7)} semaine${diffDays >= 14 ? "s" : ""}`
}

export default TherapistDashboard
