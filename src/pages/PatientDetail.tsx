import { useEffect, useState } from "react"
import { useParams, useNavigate, Navigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { motion } from "framer-motion"
import {
  ArrowLeft, Calendar, Clock, TrendingUp, Activity,
  FileText, Star, Send, Mail, CheckCircle2, Mic
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SessionRow } from "@/integrations/supabase/types"
import { getExerciseById } from "@/data/exercises"
import { ActivityHeatmap } from "@/components/pro/ActivityHeatmap"
import AssignExerciseModal from "@/components/assignments/AssignExerciseModal"
import { AppLayout } from "@/components/AppLayout"

const PatientDetail = () => {
  const { id: patientId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isPatient } = useAuth()

  useEffect(() => {
    if (!isPatient) localStorage.setItem("rf_checklist_consult", "1")
  }, [isPatient])

  const [prescribeOpen, setPrescribeOpen] = useState(false)

  if (isPatient) return <Navigate to="/dashboard" replace />

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
        .limit(10)
      return (data ?? []) as SessionRow[]
    },
    enabled: !!patientId,
  })

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

  const { data: weekCount = 0 } = useQuery({
    queryKey: ["patient_week_sessions", patientId, getStartOfWeek().toISOString()],
    queryFn: async () => {
      if (!patientId) return 0
      const { count } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", patientId)
        .eq("completed", true)
        .gte("created_at", getStartOfWeek().toISOString())
      return count ?? 0
    },
    enabled: !!patientId,
  })

  const { data: voiceRecordings = [] } = useQuery({
    queryKey: ["patient_voice_recordings", patientId],
    queryFn: async () => {
      if (!patientId) return []
      const { data } = await (supabase as any)
        .from("voice_recordings")
        .select("id, exercise_id, storage_path, duration_seconds, created_at")
        .eq("user_id", patientId)
        .order("created_at", { ascending: false })
        .limit(20)
      return (data ?? []) as VoiceRecordingRow[]
    },
    enabled: !!patientId,
  })

  const handleExportPDF = () => {
    const dateStr = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    const rows = sessions.map(s => {
      const ex = getExerciseById(s.exercise_id)
      const d = new Date(s.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
      const dur = s.duration_seconds ? `${Math.floor(s.duration_seconds / 60)}m ${s.duration_seconds % 60}s` : "—"
      return `<tr><td>${d}</td><td>${ex?.name_fr ?? s.exercise_id}</td><td>${dur}</td><td>${s.score != null ? s.score + "%" : "—"}</td></tr>`
    }).join("")
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Bilan — ${patient?.full_name ?? "Patient"}</title>
<style>
  body{font-family:Arial,sans-serif;max-width:680px;margin:32px auto;color:#1a1a1a;font-size:13px}
  h1{color:#2D5A4F;font-size:22px;margin:0}
  .logo{font-weight:bold;color:#2D5A4F;font-size:13px;margin-bottom:6px}
  .header{border-bottom:2px solid #2D5A4F;padding-bottom:14px;margin-bottom:20px}
  .stats{display:flex;gap:16px;margin:20px 0}
  .stat{flex:1;text-align:center;background:#F5F0EB;border-radius:8px;padding:14px 8px}
  .stat-v{font-size:28px;font-weight:bold;color:#2D5A4F}
  .stat-l{font-size:11px;color:#666;margin-top:3px}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th{background:#2D5A4F;color:#fff;padding:9px 10px;text-align:left;font-size:11px}
  td{padding:9px 10px;border-bottom:1px solid #eee;font-size:12px}
  tr:nth-child(even){background:#fafafa}
  .footer{margin-top:28px;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:10px}
  @media print{body{margin:16px}}
</style></head><body>
<div class="header">
  <div class="logo">🌿 RespirFacile</div>
  <h1>${patient?.full_name ?? "Patient"}</h1>
  <p style="color:#666;margin:4px 0 0">Bilan du ${dateStr}${program ? ` · Programme semaine ${program.week_number}/8` : ""}</p>
</div>
<div class="stats">
  <div class="stat"><div class="stat-v">${totalCount}</div><div class="stat-l">Séances totales</div></div>
  <div class="stat"><div class="stat-v">${weekCount}</div><div class="stat-l">Cette semaine</div></div>
  <div class="stat"><div class="stat-v">${program?.week_number ?? "—"}/8</div><div class="stat-l">Semaine programme</div></div>
</div>
<h2 style="font-size:15px;color:#2D5A4F">10 dernières séances</h2>
<table><thead><tr><th>Date</th><th>Exercice</th><th>Durée</th><th>Score</th></tr></thead>
<tbody>${rows || "<tr><td colspan='4' style='text-align:center;color:#999'>Aucune séance enregistrée</td></tr>"}</tbody></table>
<div class="footer">Bilan généré par RespirFacile · contact@respirfacile.fr · Document médical confidentiel.</div>
</body></html>`
    const w = window.open("", "_blank")
    if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 400) }
  }

  const initials = patient?.full_name
    ? patient.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??"

  const profileTypeLabel = program?.profile_type
    ? PROFILE_TYPE_LABELS[program.profile_type] ?? program.profile_type
    : null

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24 lg:pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ── Breadcrumb ── */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Retour aux patients
          </button>

          {/* ── Patient hero card ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-rf p-6 mb-6"
          >
            {/* Ligne 1 : identité + actions */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-primary">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl text-foreground leading-tight">
                  {patient?.full_name ?? "Patient"}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                  {patient?.email && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      {patient.email}
                    </span>
                  )}
                  {patient?.created_at && (
                    <span className="text-sm text-muted-foreground">
                      · Patient depuis {new Date(patient.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button className="gap-2 font-semibold" onClick={() => setPrescribeOpen(true)}>
                  <Send className="w-4 h-4" />
                  Prescrire
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
                  <FileText className="w-4 h-4" />
                  Bilan PDF
                </Button>
              </div>
            </div>

            {/* Ligne 2 : stats */}
            <div className="flex items-center gap-0 mt-5 pt-5 border-t border-border/60">
              <div className="flex-1 text-center">
                <p className="font-display text-2xl text-foreground">{weekCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Cette semaine</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex-1 text-center">
                <p className="font-display text-2xl text-foreground">{totalCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total séances</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex-1 text-center">
                <p className="font-display text-2xl text-foreground">{program?.week_number ?? "—"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Semaine programme</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex-1 text-center">
                <p className="font-display text-2xl text-foreground">{sessions[0] ? formatDate(sessions[0].created_at) : "—"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Dernière séance</p>
              </div>
            </div>
          </motion.div>

          {/* ── Body 2 colonnes ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Colonne principale (2/3) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Heatmap */}
              {patientId && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                  className="card-rf p-5"
                >
                  <ActivityHeatmap userId={patientId} />
                </motion.div>
              )}

              {/* Dernières séances */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.10 }}
                className="card-rf overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-border/60">
                  <h2 className="text-sm font-semibold text-foreground">Dernières séances</h2>
                </div>

                {sessions.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <Activity className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">Aucune séance pour le moment</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Les séances apparaîtront ici dès que le patient pratique.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {/* En-tête tableau */}
                    <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2.5 bg-muted/30">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exercice</span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-24 text-center">Date</span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-20 text-center">Durée</span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-16 text-center">Score</span>
                    </div>
                    {sessions.map((session, i) => {
                      const ex = getExerciseById(session.exercise_id)
                      // Check if a voice recording exists for the same exercise within ±10 minutes
                      const sessionTime = new Date(session.created_at).getTime()
                      const hasVoice = voiceRecordings.some(r =>
                        r.exercise_id === session.exercise_id &&
                        Math.abs(new Date(r.created_at).getTime() - sessionTime) < 10 * 60 * 1000
                      )
                      return (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 px-5 py-3.5 items-center hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl shrink-0">{ex?.icon ?? "🫁"}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium text-foreground">{ex?.name_fr ?? session.exercise_id}</p>
                                {hasVoice && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">
                                    <Mic className="w-2 h-2" />Vocal
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 sm:hidden text-xs text-muted-foreground mt-0.5">
                                <Calendar className="w-3 h-3" />
                                {formatDate(session.created_at)}
                                <Clock className="w-3 h-3 ml-1" />
                                {formatDuration(session.duration_seconds)}
                              </div>
                            </div>
                          </div>
                          <p className="hidden sm:block text-sm text-muted-foreground w-24 text-center">
                            {formatDate(session.created_at)}
                          </p>
                          <p className="hidden sm:block text-sm text-muted-foreground w-20 text-center">
                            {formatDuration(session.duration_seconds)}
                          </p>
                          <div className="w-16 flex justify-center">
                            {session.score != null ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                {session.score}%
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">—</span>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
              {/* Prises vocales */}
              {voiceRecordings.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 }}
                  className="card-rf overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-violet-600" />
                    <h2 className="text-sm font-semibold text-foreground">
                      Prises vocales
                    </h2>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {voiceRecordings.length} enregistrement{voiceRecordings.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    {voiceRecordings.map(rec => (
                      <VoiceRecordingItem key={rec.id} rec={rec} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar (1/3) */}
            <div className="space-y-6">

              {/* Programme actif */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="card-rf p-5"
              >
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Programme actif</h2>

                {program ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-base text-foreground leading-snug">
                          {profileTypeLabel ?? "Programme personnalisé"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Semaine {program.week_number} · {program.jokers_used ?? 0} joker{(program.jokers_used ?? 0) !== 1 ? "s" : ""} utilisé{(program.jokers_used ?? 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="badge-active shrink-0">Actif</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Observance cette semaine</span>
                        <span className="font-medium">{weekCount}/7</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, Math.round((weekCount / 7) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center py-4 gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Star className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Aucun programme</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Prescrivez un exercice pour démarrer.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="w-full gap-2 mt-1"
                      onClick={() => setPrescribeOpen(true)}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Prescrire
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Stats détaillées */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="card-rf p-5 space-y-3"
              >
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statistiques</h2>
                <StatRow icon={<Activity className="w-4 h-4 text-primary" />} label="Cette semaine" value={`${weekCount} séance${weekCount !== 1 ? "s" : ""}`} />
                <StatRow icon={<TrendingUp className="w-4 h-4 text-primary" />} label="Total séances" value={String(totalCount)} />
                <StatRow icon={<Star className="w-4 h-4 text-primary" />} label="Semaine programme" value={program ? `Semaine ${program.week_number}` : "—"} />
                <StatRow icon={<Calendar className="w-4 h-4 text-primary" />} label="Dernière séance" value={sessions[0] ? formatDate(sessions[0].created_at) : "—"} />
              </motion.div>

            </div>
          </div>
        </div>
      </div>

      <AssignExerciseModal
        isOpen={prescribeOpen}
        onClose={() => setPrescribeOpen(false)}
        preselectedPatientId={patientId}
        preselectedPatientName={patient?.full_name ?? undefined}
      />
    </AppLayout>
  )
}

// ── Types ─────────────────────────────────────

interface VoiceRecordingRow {
  id: string
  exercise_id: string
  storage_path: string
  duration_seconds: number | null
  created_at: string
}

// ── Sub-components ────────────────────────────

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function VoiceRecordingItem({ rec }: { rec: VoiceRecordingRow }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const ex = getExerciseById(rec.exercise_id)

  const loadAudio = async () => {
    if (audioUrl) return
    setLoading(true)
    try {
      const { data } = await supabase.storage
        .from('voice-sessions')
        .createSignedUrl(rec.storage_path, 300) // 5 min expiry
      if (data?.signedUrl) setAudioUrl(data.signedUrl)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}m${String(s % 60).padStart(2, "0")}s`

  return (
    <div className="border border-border/50 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg shrink-0">{ex?.icon ?? "🎙️"}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{ex?.name_fr ?? rec.exercise_id}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(rec.created_at)}
            {rec.duration_seconds != null && ` · ${fmt(rec.duration_seconds)}`}
          </p>
        </div>
        {!audioUrl && (
          <button
            onClick={loadAudio}
            disabled={loading}
            className="shrink-0 p-1.5 rounded-lg bg-violet-100 hover:bg-violet-200 text-violet-700 transition-colors disabled:opacity-50"
          >
            {loading
              ? <span className="text-[10px]">…</span>
              : <Mic className="w-3.5 h-3.5" />
            }
          </button>
        )}
      </div>
      {audioUrl && (
        <audio
          src={audioUrl}
          controls
          autoPlay
          className="w-full h-8 rounded"
          style={{ accentColor: "#7C3AED" }}
        />
      )}
    </div>
  )
}

// ── Helpers & constants ───────────────────────

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
  return new Date(isoString).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return m > 0 ? `${m} min` : `${seconds}s`
}

export default PatientDetail
