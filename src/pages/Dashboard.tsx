import { useNavigate, Link, Navigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { usePatientProgram } from "@/hooks/usePatientProgram"
import { supabase } from "@/integrations/supabase/client"
import { EXERCISES } from "@/data/exercises"
import { AppLayout } from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import PatientHomeworkSection from "@/components/assignments/PatientHomeworkSection"
import {
  Play, ChevronRight, Settings, Clock,
  TrendingUp, Calendar, ArrowRight,
  Dumbbell, CheckCircle2, Award, Activity,
  Stethoscope, Star, Moon, Timer, Zap, Brain,
} from "lucide-react"
import { ActivityHeatmap } from "@/components/pro/ActivityHeatmap"

// ─────────────────────────────────────────────
// Dashboard Patient — expérience premium
// "Mon ortho m'a prescrit quelque chose de sérieux"
// ─────────────────────────────────────────────

const PROFILE_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  adult_saos_mild:   { label: "SAOS léger",     desc: "Syndrome d'Apnées Obstructives du Sommeil", color: "bg-sky-100 text-sky-700" },
  adult_saos_severe: { label: "SAOS sévère",    desc: "Syndrome d'Apnées Obstructives du Sommeil", color: "bg-amber-100 text-amber-700" },
  adult_tmof:        { label: "TMOF",           desc: "Troubles Myofonctionnels Orofaciaux",        color: "bg-violet-100 text-violet-700" },
  adult_mixed:       { label: "Profil mixte",   desc: "SAOS + Troubles Myofonctionnels",            color: "bg-rose-100 text-rose-700" },
}

const WEEK_MILESTONES: Record<number, string> = {
  1: "Fondations · respiration nasale et pause",
  2: "Consolidation · régularité quotidienne",
  3: "Progression · augmenter la tolérance CO₂",
  4: "Mi-parcours · pause contrôlée > 20 sec",
  5: "Renforcement · exercices myofonctionnels",
  6: "Approfondissement · cohérence cardiaque",
  7: "Maîtrise · autonomie et ancrage",
  8: "Bilan · objectif −50% IAH",
}

const CAT_BG: Record<string, string> = {
  pause_controlee:     "bg-emerald-50",
  coherence_cardiaque: "bg-red-50",
  respiration_nasale:  "bg-sky-50",
  myofonctionnel:      "bg-violet-50",
  diaphragmatique:     "bg-orange-50",
  relaxation:          "bg-teal-50",
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

const PRE_SLEEP_EXERCISES = ['elevation_voile_palais', 'tenue_levres', 'scan_corporel']

const ESS_QUESTIONS = [
  "Regarder la télévision",
  "Lire assis",
  "Dans les transports en commun",
  "Allongé pour vous reposer l'après-midi",
  "En voiture à l'arrêt quelques minutes",
]
const ESS_OPTIONS = ["Jamais", "Rarement", "Parfois", "Souvent"]

// ─────────────────────────────────────────────

const Dashboard = () => {
  const navigate   = useNavigate()
  const { profile, isTherapist, user } = useAuth()
  const {
    program, programLoading,
    todayExercises, weekDays, stats,
    recentSessions, weekSessions,
    createProgram,
  } = usePatientProgram()

  const [therapistName,    setTherapistName]    = useState<string | null>(null)
  const [therapistMessage, setTherapistMessage] = useState<string | null>(null)
  const [selectedProfile,  setSelectedProfile]  = useState<string | null>(null)

  // BOLT test
  const [boltRunning, setBoltRunning] = useState(false)
  const [boltSeconds, setBoltSeconds] = useState(0)
  const [boltHistory, setBoltHistory] = useState<Array<{score: number; date: string}>>([])

  useEffect(() => {
    if (!user) return
    try {
      const stored = localStorage.getItem(`bolt_${user.id}`)
      if (stored) setBoltHistory(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [user])

  const boltIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startBolt = () => {
    setBoltSeconds(0)
    setBoltRunning(true)
    boltIntervalRef.current = setInterval(() => setBoltSeconds(s => s + 1), 1000)
  }

  const stopBolt = () => {
    if (boltIntervalRef.current) clearInterval(boltIntervalRef.current)
    setBoltRunning(false)
    if (boltSeconds < 3) return // ignore accidental clicks
    const entry = { score: boltSeconds, date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) }
    const updated = [entry, ...boltHistory].slice(0, 5)
    setBoltHistory(updated)
    if (user) localStorage.setItem(`bolt_${user.id}`, JSON.stringify(updated))
    setBoltSeconds(0)
  }

  useEffect(() => () => { if (boltIntervalRef.current) clearInterval(boltIntervalRef.current) }, [])

  // ESS quiz (onboarding)
  const [showEss, setShowEss] = useState(false)
  const [essAnswers, setEssAnswers] = useState<number[]>(Array(5).fill(-1))

  // ESS mensuel re-test
  const [showEssRetest, setShowEssRetest] = useState(false)
  const [essRetestAnswers, setEssRetestAnswers] = useState<number[]>(Array(5).fill(-1))
  const [essRetestDismissed, setEssRetestDismissed] = useState(false)

  // Journal de sommeil
  const [showSleepJournal, setShowSleepJournal] = useState(false)
  const [sleepQuality, setSleepQuality] = useState(0)     // 1-5
  const [sleepHours, setSleepHours] = useState("")        // "6h", "7h", etc.
  const [morningEnergy, setMorningEnergy] = useState(0)   // 1-5
  const [journalSaved, setJournalSaved] = useState(() => {
    // Déjà rempli aujourd'hui ?
    if (typeof localStorage === "undefined") return false
    const key = user ? `journal_today_${user.id}` : ""
    if (!key) return false
    const last = localStorage.getItem(key)
    if (!last) return false
    return new Date(Number(last)).toDateString() === new Date().toDateString()
  })

  const handleSaveJournal = async () => {
    if (!user || sleepQuality === 0 || !sleepHours || morningEnergy === 0) return
    const score = Math.round(((sleepQuality + morningEnergy) / 10) * 100)
    await supabase.from("sessions").insert({
      user_id:           user.id,
      exercise_id:       "sleep_journal",
      exercise_category: "relaxation",
      duration_seconds:  60,
      completed:         true,
      score,
    })
    localStorage.setItem(`journal_today_${user.id}`, String(Date.now()))
    setJournalSaved(true)
    setShowSleepJournal(false)
    setSleepQuality(0); setSleepHours(""); setMorningEnergy(0)
  }

  // Vérifier si le re-test ESS mensuel doit s'afficher (programme > 4 sem + dernière fois > 28j)
  useEffect(() => {
    if (!program || !user) return
    const programAge = (Date.now() - new Date(program.created_at ?? "").getTime()) / 86_400_000
    if (programAge < 28) return
    const lastEssKey = `ess_last_${user.id}`
    const last = localStorage.getItem(lastEssKey)
    if (last && Date.now() - Number(last) < 28 * 86_400_000) return
    setShowEssRetest(true)
  }, [program, user])

  // Récupère le nom du praticien lié
  useEffect(() => {
    if (!user) return
    supabase
      .from("therapist_patients")
      .select("notes, profiles!therapist_patients_therapist_id_fkey(full_name)")
      .eq("patient_id", user.id)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        const name = (data as any)?.profiles?.full_name
        const msg  = (data as any)?.notes
        if (name) setTherapistName(name)
        if (msg)  setTherapistMessage(msg)
      })
  }, [user])

  if (isTherapist) return <Navigate to="/patients" replace />

  const firstName    = profile?.full_name?.split(" ")[0] ?? "vous"
  const greeting     = getGreeting()
  const nextExercise = todayExercises.find(e => !e.completed) ?? todayExercises[0]
  const allDoneToday = todayExercises.length > 0 && todayExercises.every(e => e.completed)
  const totalMinutes = Math.round(recentSessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) / 60)
  const profileMeta  = program?.profile_type ? PROFILE_LABELS[program.profile_type] : null

  // Calcul du streak (jours consécutifs avec au moins 1 séance)
  const streak = (() => {
    if (!recentSessions.length) return 0
    const sessionDays = new Set(
      recentSessions.map(s => {
        const d = new Date(s.created_at)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
      })
    )
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let count = 0
    let current = new Date(today)
    // Si aujourd'hui est vide, on commence quand même à hier
    if (!sessionDays.has(current.getTime())) {
      current.setDate(current.getDate() - 1)
    }
    while (sessionDays.has(current.getTime())) {
      count++
      current.setDate(current.getDate() - 1)
    }
    return count
  })()

  const preSleepExos = PRE_SLEEP_EXERCISES
    .map(id => EXERCISES.find(e => e.id === id))
    .filter(Boolean) as typeof EXERCISES

  const essScore = essAnswers.every(a => a >= 0) ? essAnswers.reduce((s, a) => s + a, 0) : null
  const essRecommendedProfile = essScore === null ? null
    : essScore >= 13 ? "adult_saos_severe"
    : essScore >= 8  ? "adult_saos_mild"
    : "adult_tmof"

  // Exercices vedettes d'accueil (intro soigneusement choisie)
  const onboardingExercises = ["pause_decouverte", "coherence_5_5", "nasale_consciente"]
    .map(id => EXERCISES.find(e => e.id === id))
    .filter(Boolean) as typeof EXERCISES

  return (
    <AppLayout>
      <div className="pb-24 lg:pb-10">

        {/* ── Header ─────────────────────────────── */}
        <header className="px-6 pt-10 lg:pt-12 pb-4 flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{greeting}</p>
            <h1 className="font-display text-3xl text-foreground leading-tight mt-0.5">{firstName}</h1>
            {program && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                Semaine {stats.currentWeek}/8 · {WEEK_MILESTONES[stats.currentWeek] ?? "Programme actif"}
              </p>
            )}
          </div>
          <Link to="/settings" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Link>
        </header>

        {/* ── Prescriptions orthophoniste ─────── */}
        <div className="px-6">
          <PatientHomeworkSection />
          {/* Message motivant orthophoniste */}
          {therapistMessage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200/60 px-4 py-3"
            >
              <span className="text-xl shrink-0 mt-0.5">💬</span>
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-0.5">
                  Message de {therapistName ?? "votre orthophoniste"}
                </p>
                <p className="text-sm text-amber-900 leading-relaxed">{therapistMessage}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* ═══════════════════════════════════════
            PAS DE PROGRAMME — état d'accueil premium
        ═══════════════════════════════════════ */}
        {!programLoading && !program && (
          <div className="px-6 space-y-5">

            {/* Prescription card — connexion ortho */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest to-forest-dark text-white p-6"
            >
              {/* Déco */}
              <div className="absolute -right-12 -top-12 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

              <div className="relative z-10">
                {/* Badge praticien */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">{therapistName ? "Prescrit par" : "Votre programme"}</p>
                    <p className="text-sm font-semibold text-white">
                      {therapistName ?? "RespirFacile"}
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] font-semibold bg-green-400/20 text-green-300 border border-green-400/30 px-2 py-0.5 rounded-full">
                    Programme en préparation
                  </span>
                </div>

                <h2 className="font-display text-2xl font-bold mb-1.5 leading-tight">
                  Programme respiratoire<br />personnalisé · 8 semaines
                </h2>
                <p className="text-white/65 text-sm leading-relaxed mb-5">
                  {therapistName
                    ? "Votre praticien configure votre programme basé sur votre profil. Vous recevrez vos exercices dès la prochaine consultation."
                    : "Choisissez votre profil ci-dessous pour lancer votre programme de 8 semaines en autonomie."}
                </p>

                {/* Stats scientifiques */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15">
                  {[
                    { value: "−50%",  label: "IAH en moyenne",      icon: TrendingUp },
                    { value: "20 min", label: "par jour",            icon: Clock },
                    { value: "13",     label: "essais randomisés",   icon: Award },
                  ].map(({ value, label, icon: Icon }) => (
                    <div key={label} className="text-center">
                      <Icon className="w-3.5 h-3.5 text-white/40 mx-auto mb-1" />
                      <p className="font-display text-xl font-bold leading-tight">{value}</p>
                      <p className="text-white/55 text-[10px] mt-0.5 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Parcours 8 semaines */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 }}
              className="card-rf p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-foreground">Votre parcours de 8 semaines</p>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  Méta-analyse Camacho 2015
                </span>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Ligne de progression */}
                <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-muted" />
                <div className="flex justify-between relative">
                  {Array.from({ length: 8 }, (_, i) => {
                    const week = i + 1
                    const isMilestone = [1, 4, 8].includes(week)
                    return (
                      <div key={week} className="flex flex-col items-center gap-1.5">
                        <div className={`
                          w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 relative
                          ${isMilestone
                            ? "bg-primary text-white shadow-soft"
                            : "bg-card border-2 border-border text-muted-foreground/60"}
                        `}>
                          {isMilestone ? <Star className="w-3 h-3 fill-white" /> : week}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 3 jalons clés */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { week: "S1", title: "Fondations",   desc: "Respiration nasale, première mesure" },
                  { week: "S4", title: "Mi-parcours",  desc: "Pause Contrôlée > 20 secondes" },
                  { week: "S8", title: "Objectif",     desc: "−50% IAH · Bilan avec votre praticien" },
                ].map(m => (
                  <div key={m.week} className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-xs font-bold text-primary mb-1">{m.week}</p>
                    <p className="text-xs font-semibold text-foreground leading-tight">{m.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{m.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Commencez maintenant */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Commencez dès maintenant</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Ces exercices font partie de votre futur programme</p>
                </div>
                <Link to="/practice" className="flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                  Tous <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {onboardingExercises.map((ex, i) => (
                  <motion.button
                    key={ex.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.14 + i * 0.06 }}
                    onClick={() => navigate(`/session-live?exercise=${ex.id}`)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-soft transition-all text-left group"
                  >
                    <div className={`w-13 h-13 w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 text-2xl ${CAT_BG[ex.category] ?? "bg-muted"}`}>
                      {ex.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight">{ex.name_fr}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ex.description_fr}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />{formatDuration(ex.duration_seconds)}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CAT_CHIP[ex.category] ?? "bg-muted text-muted-foreground"}`}>
                          {CAT_LABEL[ex.category] ?? ex.category}
                        </span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Play className="w-3.5 h-3.5 text-primary fill-primary" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Séances libres déjà faites */}
            {recentSessions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-rf p-4 flex items-center gap-4 border border-primary/15 bg-primary/3"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {recentSessions.length} séance{recentSessions.length > 1 ? "s" : ""} déjà effectuée{recentSessions.length > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {totalMinutes} min de rééducation{therapistName ? " · votre praticien voit votre progression" : " · continuez, chaque séance compte"}
                  </p>
                </div>
                <Activity className="w-4 h-4 text-primary shrink-0" />
              </motion.div>
            )}

            {/* Sélecteur de profil — démarrage autonome */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="card-rf p-5"
            >
              <p className="text-sm font-semibold text-foreground mb-0.5">Démarrer en autonomie</p>
              <p className="text-xs text-muted-foreground mb-4">Choisissez votre profil pour lancer votre programme personnalisé.</p>

              {/* Lien vers le quiz ESS */}
              {!showEss && (
                <button
                  onClick={() => setShowEss(true)}
                  className="flex items-center gap-2 text-xs text-primary font-medium hover:underline mb-3"
                >
                  <Brain className="w-3.5 h-3.5" />
                  Vous ne savez pas quel profil choisir ? Faites le test (30 sec)
                </button>
              )}

              {/* Quiz ESS */}
              {showEss && (
                <div className="mb-4 rounded-xl bg-muted/60 p-4 space-y-4">
                  <p className="text-xs font-semibold text-foreground">Quelle est la probabilité que vous vous endormiez dans ces situations ?</p>
                  {ESS_QUESTIONS.map((q, qi) => (
                    <div key={qi}>
                      <p className="text-xs text-muted-foreground mb-2">{q}</p>
                      <div className="flex gap-1.5">
                        {ESS_OPTIONS.map((opt, oi) => (
                          <button
                            key={oi}
                            onClick={() => setEssAnswers(prev => { const n = [...prev]; n[qi] = oi; return n })}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                              essAnswers[qi] === oi
                                ? "bg-primary text-white border-primary"
                                : "bg-card border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {essScore !== null && (
                    <div className={`rounded-xl p-3 ${
                      essScore >= 13 ? "bg-amber-50 border border-amber-200" :
                      essScore >= 8  ? "bg-sky-50 border border-sky-200" :
                      "bg-green-50 border border-green-200"
                    }`}>
                      <p className="text-xs font-semibold">
                        Score ESS : {essScore}/15 →{" "}
                        <span className="font-bold">
                          {essScore >= 13 ? "Somnolence excessive — profil SAOS sévère recommandé"
                            : essScore >= 8 ? "Somnolence légère — profil SAOS léger recommandé"
                            : "Somnolence normale — profil TMOF recommandé"}
                        </span>
                      </p>
                      <button
                        onClick={() => {
                          if (essRecommendedProfile) setSelectedProfile(essRecommendedProfile)
                          setShowEss(false)
                        }}
                        className="mt-2 text-xs text-primary font-semibold hover:underline"
                      >
                        Appliquer cette recommandation →
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {[
                  { key: "adult_saos_mild",   emoji: "😴", label: "SAOS léger",    sub: "Apnées légères à modérées" },
                  { key: "adult_saos_severe",  emoji: "🌙", label: "SAOS sévère",   sub: "Apnées sévères, traitement actif" },
                  { key: "adult_tmof",         emoji: "👅", label: "TMOF",          sub: "Troubles myofonctionnels" },
                  { key: "adult_mixed",        emoji: "🔀", label: "Profil mixte",  sub: "SAOS + myofonctionnel" },
                ].map(({ key, emoji, label, sub }) => {
                  const isSelected = selectedProfile === key
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedProfile(key)}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{emoji}</span>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>{label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{sub}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <Button
                className="w-full btn-forest py-3 gap-2"
                disabled={!selectedProfile || createProgram.isPending}
                onClick={() => selectedProfile && createProgram.mutate(selectedProfile)}
              >
                {createProgram.isPending ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Création en cours…</>
                ) : (
                  <><Dumbbell className="w-4 h-4" />Commencer mon programme</>
                )}
              </Button>
            </motion.div>

          </div>
        )}

        {/* ═══════════════════════════════════════
            PROGRAMME ACTIF
        ═══════════════════════════════════════ */}
        {!programLoading && program && (
          <div className="px-6 mt-1 lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">

            {/* ── Colonne principale ───────────── */}
            <div className="space-y-5">

              {/* Bannière profil + connexion ortho */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-forest/8 border border-forest/15"
              >
                <div className="w-8 h-8 rounded-full bg-forest/15 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4 text-forest" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-forest">
                    {therapistName ? `Suivi par ${therapistName}` : "Programme en autonomie"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {therapistName
                    ? `Progression transmise en temps réel · ${stats.totalSessions} séance${stats.totalSessions !== 1 ? "s" : ""} validée${stats.totalSessions !== 1 ? "s" : ""}`
                    : `${stats.totalSessions} séance${stats.totalSessions !== 1 ? "s" : ""} validée${stats.totalSessions !== 1 ? "s" : ""} · continuez sur votre lancée`
                  }
                  </p>
                </div>
                {profileMeta && (
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${profileMeta.color}`}>
                    {profileMeta.label}
                  </span>
                )}
              </motion.div>

              {/* Mini-stats */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 }}
                className="grid grid-cols-4 gap-2"
              >
                {[
                  { value: `${stats.currentWeek}/8`,                      label: "Semaine",    color: "text-forest" },
                  { value: stats.sessionsThisWeek,                         label: "Cette sem.", color: "text-primary" },
                  { value: streak > 0 ? `${streak}🔥` : "0",              label: "Série",           color: streak >= 7 ? "text-orange-500" : streak >= 3 ? "text-amber-500" : "text-muted-foreground" },
                  { value: `${totalMinutes}min`,                            label: "Pratiqué",   color: "text-amber-600" },
                ].map(({ value, label, color }) => (
                  <div key={label} className="card-rf p-2.5 text-center">
                    <p className={`font-display text-lg font-bold leading-tight ${color}`}>{value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
                  </div>
                ))}
              </motion.div>

              {/* Exercice du jour — HERO */}
              {nextExercise && !allDoneToday && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Exercice du jour
                  </p>
                  <div
                    className="card-rf overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300"
                    onClick={() => navigate(`/session-live?exercise=${nextExercise.id}`)}
                  >
                    {/* Visuel haut */}
                    <div className="h-32 bg-gradient-to-br from-forest/90 to-forest-dark flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: "radial-gradient(circle at 70% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)" }} />
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-500 relative z-10 drop-shadow-lg">
                        {nextExercise.icon}
                      </span>
                      {/* Badge catégorie */}
                      <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full ${CAT_CHIP[nextExercise.category] ?? "bg-white/20 text-white"}`}>
                        {CAT_LABEL[nextExercise.category] ?? nextExercise.category}
                      </span>
                      {/* Timer */}
                      <span className="absolute top-3 right-3 flex items-center gap-1 text-xs text-white/80 bg-black/25 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        {formatDuration(nextExercise.duration_seconds)}
                      </span>
                    </div>

                    {/* Contenu */}
                    <div className="p-5">
                      <h2 className="font-display text-xl text-foreground leading-tight">{nextExercise.name_fr}</h2>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {nextExercise.description_fr}
                      </p>
                      <Button className="w-full btn-forest gap-2 mt-4 py-3.5 text-base">
                        <Play className="w-4 h-4 fill-white" />
                        Commencer la séance
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tout fait aujourd'hui */}
              {allDoneToday && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card-rf p-6 text-center space-y-3 border border-primary/20 bg-primary/4"
                >
                  <span className="text-4xl block">🎉</span>
                  <h2 className="font-display text-xl text-primary">Programme du jour terminé !</h2>
                  <p className="text-sm text-muted-foreground">
                    Tous vos exercices du jour sont complétés.{therapistName ? " Votre orthophoniste voit votre progression en temps réel." : " Revenez demain pour continuer votre progression."}
                  </p>
                  <button
                    onClick={() => navigate("/practice")}
                    className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline mt-1"
                  >
                    Explorer d'autres exercices <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}

              {/* ── Mode Pré-sommeil ──────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="card-rf p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Moon className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">Mode pré-sommeil</p>
                      <p className="text-[10px] text-muted-foreground">3 exercices · 15 min · idéal avant le coucher</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {preSleepExos.map((ex, i) => (
                    <button
                      key={ex.id}
                      onClick={() => navigate(`/session-live?exercise=${ex.id}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 transition-all text-left group"
                    >
                      <span className="text-lg w-7 text-center shrink-0">{ex.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{ex.name_fr}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDuration(ex.duration_seconds)}</p>
                      </div>
                      <span className="text-[10px] text-indigo-500 font-medium shrink-0">{i + 1}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* ── Journal de sommeil ──────────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="card-rf p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                      <span className="text-base">📓</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">Journal de sommeil</p>
                      <p className="text-[10px] text-muted-foreground">3 questions · 30 sec</p>
                    </div>
                  </div>
                  {!showSleepJournal && !journalSaved && (
                    <button
                      onClick={() => setShowSleepJournal(true)}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Remplir
                    </button>
                  )}
                </div>

                {journalSaved && !showSleepJournal && (
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Nuit enregistrée
                  </p>
                )}

                {showSleepJournal && (
                  <div className="space-y-4">
                    {/* Qualité du sommeil */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Qualité de votre nuit</p>
                      <div className="flex gap-1.5">
                        {[1,2,3,4,5].map(n => (
                          <button
                            key={n}
                            onClick={() => setSleepQuality(n)}
                            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                              sleepQuality === n ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {["😣","😕","😐","🙂","😄"][n-1]}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Heures de sommeil */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Heures dormies</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {["<5h","5h","6h","7h","8h","9h+"].map(h => (
                          <button
                            key={h}
                            onClick={() => setSleepHours(h)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                              sleepHours === h ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Énergie au réveil */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Énergie au réveil</p>
                      <div className="flex gap-1.5">
                        {(["😫","😕","😐","🙂","😊"] as const).map((emoji, idx) => {
                          const n = idx + 1
                          return (
                            <button
                              key={n}
                              onClick={() => setMorningEnergy(n)}
                              className={`flex-1 py-1.5 rounded-lg text-base border transition-all ${
                                morningEnergy === n ? "bg-primary border-primary scale-110" : "bg-card border-border hover:border-primary/40"
                              }`}
                            >
                              {emoji}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSleepJournal(false)}
                        className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveJournal}
                        disabled={sleepQuality === 0 || !sleepHours || morningEnergy === 0}
                        className="flex-1 btn-forest py-2 text-sm disabled:opacity-50"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* ── ESS re-test mensuel ──────────── */}
              {showEssRetest && !essRetestDismissed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4"
                >
                  {(() => {
                    const retestScore = essRetestAnswers.reduce((s, a) => s + a, 0)
                    const retestDone  = essRetestAnswers.every(a => a >= 0)
                    const dismissRetest = () => {
                      setEssRetestDismissed(true)
                      if (user) localStorage.setItem(`ess_last_${user.id}`, String(Date.now()))
                    }
                    return (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-amber-800">Bilan mensuel</p>
                            <p className="text-xs text-amber-700 mt-0.5">Un mois s'est écoulé. Refaites le test pour mesurer vos progrès.</p>
                          </div>
                          <button onClick={dismissRetest} className="text-amber-500 hover:text-amber-700 text-xs ml-2 p-1">✕</button>
                        </div>
                        {retestDone ? (
                          <div className={`rounded-xl p-3 ${
                            retestScore >= 13 ? "bg-red-50 border border-red-200" :
                            retestScore >= 8  ? "bg-amber-50 border border-amber-200" :
                            "bg-green-50 border border-green-200"
                          }`}>
                            <p className={`text-xs font-semibold ${retestScore >= 13 ? "text-red-700" : retestScore >= 8 ? "text-amber-700" : "text-green-700"}`}>
                              Score ESS : {retestScore}/15
                            </p>
                            <p className="text-xs mt-1 leading-relaxed">
                              {retestScore < 8
                                ? "Somnolence normale. Vos exercices portent leurs fruits."
                                : retestScore < 13
                                ? "Somnolence légère. Continuez votre programme."
                                : "Somnolence élevée. Parlez-en à votre praticien."}
                            </p>
                            <button onClick={dismissRetest} className="mt-2 text-xs text-primary font-semibold hover:underline">
                              Fermer
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {ESS_QUESTIONS.map((q, qi) => (
                              <div key={qi}>
                                <p className="text-xs text-amber-700 mb-1.5">{q}</p>
                                <div className="flex gap-1.5">
                                  {ESS_OPTIONS.map((opt, oi) => (
                                    <button
                                      key={oi}
                                      onClick={() => setEssRetestAnswers(prev => { const n = [...prev]; n[qi] = oi; return n })}
                                      className={`flex-1 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                                        essRetestAnswers[qi] === oi
                                          ? "bg-amber-600 text-white border-amber-600"
                                          : "bg-white border-amber-200 text-amber-700 hover:border-amber-400"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </motion.div>
              )}

              {/* Tracker semaine */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="card-rf p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">Cette semaine</p>
                  <span className="text-xs font-medium text-muted-foreground">
                    {stats.sessionsThisWeek} séance{stats.sessionsThisWeek !== 1 ? "s" : ""} / 7 jours
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  {weekDays.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all
                        ${day.completed   ? "bg-primary text-white shadow-soft"
                          : day.isToday  ? "border-2 border-primary text-primary bg-primary/5"
                          : day.isFuture ? "bg-muted/50 text-muted-foreground/30"
                          :               "bg-muted text-muted-foreground/50"}
                      `}>
                        {day.completed ? "✓" : day.label}
                      </div>
                      {day.isToday && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
                {/* Barre de progression semaine */}
                <div className="mt-4 pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Progression programme</span>
                    <span className="font-medium text-foreground">Semaine {stats.currentWeek}/8</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-forest to-forest-light rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.currentWeek / 8) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {WEEK_MILESTONES[stats.currentWeek]}
                  </p>
                </div>
              </motion.div>

            </div>

            {/* ── Colonne droite ───────────────── */}
            <div className="space-y-5">

              {/* Conseil du jour scientifique */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl p-4 space-y-2"
                style={{ background: "#C4785A1A", border: "1px solid #C4785A30" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#C4785A" }}>
                  Le saviez-vous · Semaine {stats.currentWeek}
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {getDailyTip(stats.currentWeek)}
                </p>
              </motion.div>

              {/* Heatmap activité patient */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="card-rf p-4"
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Votre activité
                  </p>
                  <ActivityHeatmap userId={user.id} days={84} />
                </motion.div>
              )}

              {/* Test BOLT */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="card-rf p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Timer className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground leading-tight">Test BOLT</p>
                    <p className="text-[10px] text-muted-foreground">Tolérance CO₂ · objectif ≥ 20 sec</p>
                  </div>
                  {boltHistory[0] && (
                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                      boltHistory[0].score >= 20 ? "bg-green-100 text-green-700" :
                      boltHistory[0].score >= 10 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {boltHistory[0].score}s
                    </span>
                  )}
                </div>

                {boltRunning ? (
                  <div className="text-center py-3">
                    <p className="font-display text-4xl font-bold text-primary tabular-nums">{boltSeconds}s</p>
                    <p className="text-[10px] text-muted-foreground mt-1 mb-3">Retenez votre souffle · arrêtez à la 1ère envie</p>
                    <button
                      onClick={stopBolt}
                      className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
                    >
                      Arrêter
                    </button>
                  </div>
                ) : (
                  <>
                    {boltHistory.length > 0 ? (
                      <div className="mb-3 space-y-1.5">
                        {boltHistory.map((h, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                h.score >= 20 ? "bg-green-400" :
                                h.score >= 10 ? "bg-amber-400" : "bg-red-400"
                              }`}
                              style={{ width: `${Math.min(100, (h.score / 40) * 100)}%`, minWidth: "4px" }}
                            />
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{h.score}s · {h.date}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                          <span>0s</span>
                          <span className="text-emerald-600 font-medium">Objectif : 20s</span>
                          <span>40s+</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        Expirez doucement, arrêtez de respirer, chronométrez jusqu'à la première envie de respirer.
                      </p>
                    )}
                    <button
                      onClick={startBolt}
                      className="w-full py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3 h-3" />
                      Faire le test maintenant
                    </button>
                  </>
                )}
              </motion.div>

              {/* Liste programme */}
              {todayExercises.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Programme · Semaine {stats.currentWeek}
                  </p>
                  <div className="space-y-2">
                    {todayExercises.map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => !ex.completed && navigate(`/session-live?exercise=${ex.id}`)}
                        className={`
                          w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left
                          ${ex.completed
                            ? "bg-primary/5 border-primary/10 opacity-60 cursor-default"
                            : "bg-card border-border hover:border-primary/30 hover:shadow-soft cursor-pointer"}
                        `}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base
                          ${ex.completed ? "bg-primary/15" : (CAT_BG[ex.category] ?? "bg-muted")}`}
                        >
                          {ex.completed ? "✓" : ex.icon}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className={`text-sm font-medium truncate ${ex.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {ex.name_fr}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDuration(ex.duration_seconds)}</p>
                        </div>
                        {!ex.completed && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Jokers */}
              {stats.jokersLeft > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.28 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/60"
                >
                  <span className="text-xl">🃏</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-700">
                      {stats.jokersLeft} joker{stats.jokersLeft > 1 ? "s" : ""} disponible{stats.jokersLeft > 1 ? "s" : ""}
                    </p>
                    <p className="text-[10px] text-amber-600/80 mt-0.5">
                      Vous pouvez manquer {stats.jokersLeft} jour{stats.jokersLeft > 1 ? "s" : ""} sans impacter votre progression
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Lien explorer */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.32 }}
                onClick={() => navigate("/practice")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  Explorer tous les exercices
                </span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

            </div>
          </div>
        )}

        {/* Skeleton loading */}
        {programLoading && (
          <div className="px-6 mt-4 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 rounded-xl bg-muted/60 animate-pulse" />
            ))}
          </div>
        )}

      </div>
    </AppLayout>
  )
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Bonjour"
  if (h < 18) return "Bon après-midi"
  return "Bonsoir"
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60)
  return m > 0 ? `${m} min` : `${s}s`
}

function getDailyTip(week: number): string {
  const tips: Record<number, string> = {
    1: "La respiration nasale filtre, humidifie et réchauffe l'air. Elle est 30% plus efficace que la respiration buccale pour l'oxygénation.",
    2: "10 minutes de cohérence cardiaque par jour réduisent le cortisol de 23% et améliorent la qualité du sommeil profond (NREM).",
    3: "La tolérance au CO₂ s'améliore de 15% par semaine d'entraînement régulier. C'est le mécanisme principal derrière la réduction des apnées.",
    4: "À la mi-programme, la majorité des patients constatent une réduction du ronflement et une meilleure qualité de sommeil.",
    5: "Les exercices myofonctionnels renforcent 22 muscles du pharynx. C'est l'équivalent d'une salle de sport pour votre gorge.",
    6: "La cohérence cardiaque à 6 cycles/min synchronise les systèmes nerveux autonomes sympathique et parasympathique.",
    7: "Votre praticien pourra exporter votre bilan PDF complet pour le transmettre à votre médecin du sommeil.",
    8: "Les études montrent que 85% des patients qui complètent 8 semaines maintiennent leurs résultats à 6 mois.",
  }
  return tips[Math.min(Math.max(week, 1), 8)] ?? tips[1]
}

export default Dashboard
