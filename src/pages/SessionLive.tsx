import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { usePatientProgram } from "@/hooks/usePatientProgram"
import { getExerciseById } from "@/data/exercises"
import { supabase } from "@/integrations/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Play, Pause, RotateCcw, Check, ChevronRight, Star, Mic, Square } from "lucide-react"
import type { Exercise, ExerciseCategory } from "@/data/exercises"
import { useVoiceRecorder, type UseVoiceRecorderReturn } from "@/hooks/useVoiceRecorder"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type SessionPhase = "intro" | "running" | "paused" | "done"
type UXMode       = "breathing" | "guided"

interface BreathPhase {
  label:       string
  durationMs:  number
  scale:       number
  instruction: string
  ringColor:   string
}

// ─────────────────────────────────────────────
// Constantes par catégorie
// ─────────────────────────────────────────────

// Ces catégories ont un cercle de respiration animé
const BREATHING_CATEGORIES: ExerciseCategory[] = [
  "coherence_cardiaque",
  "respiration_nasale",
  "diaphragmatique",
  "relaxation",
]

const CAT_LABEL: Record<string, string> = {
  pause_controlee:     "Pause Contrôlée",
  coherence_cardiaque: "Cohérence Cardiaque",
  respiration_nasale:  "Respiration Nasale",
  myofonctionnel:      "Muscles orofaciaux",
  diaphragmatique:     "Respiration abdominale",
  relaxation:          "Relaxation",
}

// Couleurs par catégorie (thème clair)
// Bénéfice clinique affiché dans le panneau latéral (intro) et sur le bilan
const CAT_BENEFITS: Record<string, string> = {
  pause_controlee:     "Améliore votre tolérance naturelle au CO₂ — le marqueur clé de la respiration nasale et de la réduction des apnées.",
  coherence_cardiaque: "Synchronise rythme cardiaque et respiration. Réduit le cortisol, améliore la qualité du sommeil en 4 semaines.",
  respiration_nasale:  "Réhabilite la respiration nasale exclusive : filtre l'air, réchauffe, réduit la résistance des voies aériennes supérieures.",
  myofonctionnel:      "Renforce les muscles oropharyngés qui maintiennent les voies aériennes ouvertes pendant le sommeil.",
  diaphragmatique:     "Active le diaphragme, améliore la ventilation alvéolaire et réduit la respiration thoracique superficielle.",
  relaxation:          "Réduit l'activation du système nerveux sympathique pour favoriser un endormissement plus rapide.",
}

// Message court affiché sur l'écran de fin
const DONE_MESSAGES: Record<string, string> = {
  pause_controlee:     "Votre tolérance CO₂ s'améliore à chaque séance.",
  coherence_cardiaque: "Votre système nerveux s'est régulé. Votre sommeil en bénéficiera.",
  respiration_nasale:  "Respirer par le nez devient plus naturel chaque jour.",
  myofonctionnel:      "Vos muscles oropharyngés se renforcent progressivement.",
  diaphragmatique:     "Votre diaphragme s'active et votre respiration se stabilise.",
  relaxation:          "Votre corps a réduit son niveau de stress.",
}

const CAT_COLORS: Record<string, { ring: string; bg: string; text: string }> = {
  pause_controlee:     { ring: "#059669", bg: "#ECFDF5", text: "#065F46" },
  coherence_cardiaque: { ring: "#DC2626", bg: "#FFF5F5", text: "#991B1B" },
  respiration_nasale:  { ring: "#0284C7", bg: "#F0F9FF", text: "#0C4A6E" },
  myofonctionnel:      { ring: "#7C3AED", bg: "#F5F3FF", text: "#4C1D95" },
  diaphragmatique:     { ring: "#D97706", bg: "#FFFBEB", text: "#92400E" },
  relaxation:          { ring: "#0D9488", bg: "#F0FDFA", text: "#134E4A" },
}

// ─────────────────────────────────────────────
// SessionLive — mode Duolingo, thème clair
// ─────────────────────────────────────────────

const SessionLive = () => {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const { user }       = useAuth()
  const { saveSession } = usePatientProgram()

  const exerciseId = searchParams.get("exercise") ?? ""
  const exercise   = getExerciseById(exerciseId)

  const [phase,              setPhase]             = useState<SessionPhase>("intro")
  const [elapsed,            setElapsed]           = useState(0)
  const [breathPhaseIdx,     setBreathPhaseIdx]    = useState(0)
  const [breathPhaseElapsed, setBreathPhaseElapsed]= useState(0)
  const [cycleCount,         setCycleCount]        = useState(0)
  const [stepIndex,          setStepIndex]         = useState(0)
  const [isSaving,           setIsSaving]          = useState(false)
  const [selectedStars,      setSelectedStars]     = useState<number>(0)
  const [therapistName,      setTherapistName]     = useState<string | null>(null)
  const [voiceUploaded,      setVoiceUploaded]     = useState(false)

  const voiceRecorder = useVoiceRecorder()

  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const breathTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef    = useRef<number>(0)
  const breathIdxRef    = useRef(0)

  useEffect(() => { if (!exercise) navigate("/dashboard") }, [exercise, navigate])

  // Nom du praticien pour l'écran de fin
  useEffect(() => {
    if (!user) return
    supabase
      .from("therapist_patients")
      .select("profiles!therapist_patients_therapist_id_fkey(full_name)")
      .eq("patient_id", user.id)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        const name = (data as any)?.profiles?.full_name
        if (name) setTherapistName(name)
      })
  }, [user])

  if (!exercise) return null

  const uxMode         = getUXMode(exercise)
  const breathPhases   = getBreathPhases(exercise)
  const totalDuration  = exercise.duration_seconds
  const steps          = exercise.instructions_fr   // données réelles de l'exercice
  const colors         = CAT_COLORS[exercise.category] ?? CAT_COLORS.relaxation
  const currentBP      = breathPhases[breathPhaseIdx % breathPhases.length]

  // ── Timers ──────────────────────────────────
  const stopTimers = useCallback(() => {
    if (timerRef.current)       clearInterval(timerRef.current)
    if (breathTimerRef.current) clearInterval(breathTimerRef.current)
  }, [])

  const startMainTimer = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed * 1000
    timerRef.current = setInterval(() => {
      const t = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsed(t)
      if (t >= totalDuration) {
        clearInterval(timerRef.current!)
        clearInterval(breathTimerRef.current!)
        setPhase("done")
      }
    }, 250)
  }, [elapsed, totalDuration])

  const startBreathTimer = useCallback(() => {
    let phaseMs = 0
    breathTimerRef.current = setInterval(() => {
      phaseMs += 100
      const cur = breathPhases[breathIdxRef.current % breathPhases.length].durationMs
      setBreathPhaseElapsed(phaseMs)
      if (phaseMs >= cur) {
        phaseMs = 0
        setBreathPhaseElapsed(0)
        breathIdxRef.current += 1
        setBreathPhaseIdx(breathIdxRef.current)
        // Un cycle complet = on a traversé tous les phases
        if (breathIdxRef.current % breathPhases.length === 0) {
          setCycleCount(c => c + 1)
        }
      }
    }, 100)
  }, [breathPhases])

  // ── Contrôles ───────────────────────────────
  const handleStart = () => {
    setPhase("running")
    startMainTimer()
    if (uxMode === "breathing") startBreathTimer()
  }
  const handlePause = () => { setPhase("paused"); stopTimers() }
  const handleResume = () => {
    setPhase("running")
    startMainTimer()
    if (uxMode === "breathing") startBreathTimer()
  }
  const handleRestart = () => {
    stopTimers()
    setPhase("intro"); setElapsed(0); setStepIndex(0)
    breathIdxRef.current = 0; setBreathPhaseIdx(0); setBreathPhaseElapsed(0); setCycleCount(0)
  }
  const handleNextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(i => i + 1)
    } else {
      stopTimers()
      setPhase("done")
    }
  }
  const handleComplete = async () => {
    setIsSaving(true)
    try {
      // Upload voice recording first (if captured for a vocal exercise)
      if (exercise.voice_exercise && voiceRecorder.audioBlob && user && !voiceUploaded) {
        try {
          const ext      = voiceRecorder.audioBlob.type.includes('ogg') ? 'ogg'
                         : voiceRecorder.audioBlob.type.includes('mp4') ? 'm4a' : 'webm'
          const path     = `${user.id}/${exercise.id}/${Date.now()}.${ext}`
          const { error: upErr } = await supabase.storage
            .from('voice-sessions')
            .upload(path, voiceRecorder.audioBlob, {
              contentType: voiceRecorder.audioBlob.type,
              upsert: false,
            })
          if (!upErr) {
            await (supabase as any)
              .from('voice_recordings')
              .insert({
                user_id:          user.id,
                exercise_id:      exercise.id,
                storage_path:     path,
                duration_seconds: voiceRecorder.durationSeconds,
              })
            setVoiceUploaded(true)
          }
        } catch (uploadErr) {
          console.error('Voice upload failed:', uploadErr)
        }
      }

      const saved = await saveSession.mutateAsync({
        exerciseId:       exercise.id,
        exerciseCategory: exercise.category,
        durationSeconds:  elapsed,
        score: selectedStars > 0 ? selectedStars * 20 : undefined,
      })
      navigate(`/session/${saved.id}`)
    } catch (e) { console.error(e); navigate("/dashboard") }
    finally { setIsSaving(false) }
  }

  useEffect(() => () => stopTimers(), [])

  // ── Derived ──────────────────────────────────
  const progress      = Math.min(1, elapsed / totalDuration)
  const breathProgress= breathPhaseElapsed / currentBP.durationMs
  const circleScale   = phase === "running" ? lerp(1, currentBP.scale, breathProgress) : 1
  const remaining     = Math.max(0, totalDuration - elapsed)
  const remainingStr  = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
  const totalCycles   = Math.ceil(totalDuration * 1000 / breathPhases.reduce((s, p) => s + p.durationMs, 0))

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F0EB" }}>

      {/* ── Header ─────────────────────────────── */}
      <header className="sticky top-0 z-20 px-5 pt-5 pb-4 flex items-center gap-3 lg:px-10 bg-white/80 backdrop-blur-md border-b border-black/5">
        <button
          onClick={() => { stopTimers(); navigate(-1) }}
          className="p-2 rounded-xl hover:bg-black/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground/60" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: colors.ring }}>
            {CAT_LABEL[exercise.category]}
          </p>
          <h1 className="font-display text-base text-foreground leading-tight truncate">{exercise.name_fr}</h1>
        </div>
        {(phase === "running" || phase === "paused") && (
          <span className="text-sm font-mono tabular-nums bg-white px-3 py-1 rounded-full border border-border text-muted-foreground shrink-0">
            {remainingStr}
          </span>
        )}
      </header>

      {/* ── Barre de progression ───────────────── */}
      {(phase === "running" || phase === "paused") && (
        <div className="h-1 bg-black/5">
          <motion.div
            className="h-full"
            style={{ background: colors.ring }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {/* ── Layout principal ─────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row">

        {/* ── Zone centrale ─────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:py-0">

          <AnimatePresence mode="wait">

            {/* ══ INTRO ══ */}
            {phase === "intro" && (
              <motion.div key="intro"
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
                className="w-full max-w-md space-y-4"
              >
                {/* Carte exercice */}
                <div className="bg-white rounded-3xl p-8 shadow-md border border-black/5 text-center space-y-4">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mx-auto"
                    style={{ background: colors.bg }}
                  >
                    {exercise.icon}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl text-foreground leading-tight">{exercise.name_fr}</h2>
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{exercise.description_fr}</p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                      ⏱ {formatDuration(totalDuration)}
                    </span>
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full"
                      style={{ background: colors.bg, color: colors.text }}>
                      {steps.length} étapes guidées
                    </span>
                    {uxMode === "breathing" && (
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                        ~{totalCycles} cycles
                      </span>
                    )}
                  </div>
                </div>

                {/* Aperçu des étapes */}
                <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Programme de la séance
                  </p>
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                        style={{ background: colors.bg, color: colors.ring }}>
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                {/* CTA démarrer */}
                <button onClick={handleStart}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-semibold text-base shadow-lg transition-all active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #2D5A4F 0%, #1E3D35 100%)" }}
                >
                  <Play className="w-5 h-5 fill-white" />
                  Commencer la séance
                </button>
              </motion.div>
            )}

            {/* ══ MODE RESPIRATION — running/paused ══ */}
            {phase !== "intro" && phase !== "done" && uxMode === "breathing" && (
              <motion.div key="breathing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-7 w-full max-w-sm"
              >
                {/* Label phase + instruction */}
                <AnimatePresence mode="wait">
                  <motion.div key={`lbl-${breathPhaseIdx % breathPhases.length}-${phase}`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="text-center min-h-[64px] flex flex-col items-center justify-center"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: colors.ring }}>
                      {phase === "paused" ? "En pause" : currentBP.label}
                    </p>
                    <p className="font-display text-xl text-foreground leading-snug whitespace-pre-line">
                      {phase === "paused" ? "Reprenez quand vous êtes prêt" : currentBP.instruction}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Cercle de respiration — GRAND et évident */}
                <div className="relative flex items-center justify-center">
                  {/* Anneaux ripple */}
                  {phase === "running" && (
                    <>
                      <div className="absolute w-72 h-72 rounded-full animate-ripple pointer-events-none"
                        style={{ border: `2px solid ${colors.ring}28` }} />
                      <div className="absolute w-72 h-72 rounded-full animate-ripple pointer-events-none"
                        style={{ border: `1px solid ${colors.ring}18`, animationDelay: "1.1s" }} />
                    </>
                  )}

                  <motion.div
                    className="w-56 h-56 rounded-full flex items-center justify-center select-none"
                    animate={{ scale: circleScale }}
                    transition={{ duration: currentBP.durationMs / 1000, ease: "easeInOut" }}
                    style={{
                      background: `radial-gradient(circle at 38% 32%, ${colors.bg}, white 70%)`,
                      border: `4px solid ${colors.ring}55`,
                      boxShadow: phase === "running"
                        ? `0 0 80px -10px ${colors.ring}30, 0 24px 64px -20px ${colors.ring}25`
                        : "0 20px 60px -20px rgba(0,0,0,0.07)",
                    }}
                    onClick={phase === "running" ? handlePause : phase === "paused" ? handleResume : undefined}
                  >
                    <AnimatePresence mode="wait">
                      {phase === "paused" ? (
                        <motion.span key="paused" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-5xl">⏸</motion.span>
                      ) : (
                        <motion.p key={`icon-${breathPhaseIdx % breathPhases.length}`}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-5xl"
                        >
                          {exercise.icon}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Compteur de cycles */}
                {phase === "running" && totalCycles > 1 && (
                  <motion.p key={cycleCount}
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-xs font-semibold tabular-nums"
                    style={{ color: colors.ring }}
                  >
                    Cycle {cycleCount + 1} / {totalCycles}
                  </motion.p>
                )}

                {/* Contrôles */}
                <div className="flex gap-3 w-full">
                  <button onClick={handleRestart}
                    className="p-3.5 rounded-xl bg-white border border-black/8 hover:bg-black/3 transition-colors">
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {phase === "running" ? (
                    <button onClick={handlePause}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-black/8 text-sm font-medium text-foreground">
                      <Pause className="w-4 h-4" /> Pause
                    </button>
                  ) : (
                    <button onClick={handleResume}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold"
                      style={{ background: colors.ring }}>
                      <Play className="w-4 h-4 fill-white" /> Reprendre
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══ MODE GUIDÉ — running/paused ══ */}
            {phase !== "intro" && phase !== "done" && uxMode === "guided" && (
              <motion.div key="guided"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 w-full max-w-md"
              >
                {/* Barre de progression Duolingo (dots) */}
                <div className="flex gap-1.5 items-center">
                  {steps.map((_, i) => (
                    <div key={i}
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: i === stepIndex ? 28 : 8,
                        background: i <= stepIndex ? colors.ring : "#e5e7eb",
                        opacity: i > stepIndex ? 0.4 : 1,
                      }}
                    />
                  ))}
                </div>

                {/* Icône */}
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                  style={{ background: colors.bg }}>
                  {exercise.icon}
                </div>

                {/* Étape courante — carte large */}
                <AnimatePresence mode="wait">
                  <motion.div key={`step-${stepIndex}`}
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.97 }}
                    className="w-full bg-white rounded-3xl p-8 border border-black/5 shadow-md text-center space-y-3"
                  >
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.ring }}>
                      Étape {stepIndex + 1} sur {steps.length}
                    </p>
                    <p className="font-display text-xl text-foreground leading-snug">
                      {steps[stepIndex]}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* CTA Étape suivante / Terminer */}
                <button onClick={handleNextStep}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-base transition-all active:scale-[0.98] shadow-md"
                  style={{ background: `linear-gradient(135deg, ${colors.ring} 0%, ${colors.ring}cc 100%)` }}
                >
                  {stepIndex < steps.length - 1 ? (
                    <><ChevronRight className="w-5 h-5" />Étape suivante</>
                  ) : (
                    <><Check className="w-5 h-5" />Terminer l'exercice</>
                  )}
                </button>

                {/* Pause / restart */}
                <div className="flex gap-3 w-full">
                  <button onClick={handleRestart}
                    className="p-3.5 rounded-xl bg-white border border-black/8 hover:bg-black/3 transition-colors">
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {phase === "running" ? (
                    <button onClick={handlePause}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-black/8 text-sm font-medium text-foreground">
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </button>
                  ) : (
                    <button onClick={handleResume}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold"
                      style={{ background: colors.ring }}>
                      <Play className="w-3.5 h-3.5 fill-white" /> Reprendre
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══ DONE — écran de félicitations ══ */}
            {phase === "done" && (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-4"
              >
                <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-md text-center space-y-5">
                  {/* Emoji trophée animé */}
                  <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.15 }}
                    className="text-6xl">🌿</motion.div>

                  <div>
                    <h2 className="font-display text-2xl text-foreground">Bravo !</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {exercise.name_fr} · séance terminée
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-2 italic leading-relaxed max-w-xs mx-auto">
                      {DONE_MESSAGES[exercise.category]}
                    </p>
                  </div>

                  {/* Auto-évaluation */}
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Comment s'est passée cette séance ?</p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <motion.button
                          key={star}
                          onClick={() => setSelectedStars(star)}
                          whileTap={{ scale: 0.85 }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + star * 0.08, type: "spring" }}
                        >
                          <Star className={`w-8 h-8 transition-colors ${
                            star <= selectedStars
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`} />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-stretch gap-3 pt-1">
                    <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: colors.bg }}>
                      <p className="font-display text-xl font-bold" style={{ color: colors.text }}>
                        {formatDuration(elapsed)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: colors.text + "99" }}>pratiqué</p>
                    </div>
                    <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: colors.bg }}>
                      <p className="font-display text-xl font-bold" style={{ color: colors.text }}>
                        {steps.length}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: colors.text + "99" }}>étapes</p>
                    </div>
                    {uxMode === "breathing" && cycleCount > 0 && (
                      <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: colors.bg }}>
                        <p className="font-display text-xl font-bold" style={{ color: colors.text }}>
                          {cycleCount}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: colors.text + "99" }}>cycles</p>
                      </div>
                    )}
                  </div>

                  {/* Enregistrement vocal */}
                  {exercise.voice_exercise && (
                    <VoiceCapture recorder={voiceRecorder} uploaded={voiceUploaded} />
                  )}

                  {/* Connexion praticien */}
                  {therapistName && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left"
                      style={{ background: "#2D5A4F12", border: "1px solid #2D5A4F20" }}>
                      <span className="text-2xl shrink-0">🩺</span>
                      <p className="text-xs leading-relaxed text-forest">
                        <span className="font-semibold">{therapistName}</span> voit votre progression
                        en temps réel. Chaque séance compte.
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Boutons done */}
                <div className="flex gap-3">
                  <button onClick={handleRestart}
                    className="p-3.5 rounded-xl bg-white border border-black/8 hover:bg-black/3 transition-colors">
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button onClick={handleComplete} disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-base transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg"
                    style={{ background: "linear-gradient(135deg, #2D5A4F 0%, #1E3D35 100%)" }}
                  >
                    <Check className="w-5 h-5" />
                    {isSaving ? "Enregistrement…" : "Valider la séance"}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Panneau droit desktop ─────────── */}
        <aside className="hidden lg:flex flex-col w-96 bg-white border-l border-black/6">
          <div className="flex-1 overflow-y-auto p-7 space-y-7">

            {/* Intro : description + bénéfice clinique */}
            {phase === "intro" && (
              <>
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{exercise.description_fr}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: colors.bg }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.ring }}>
                    Bénéfice clinique
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
                    {CAT_BENEFITS[exercise.category]}
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>⏱ Durée : {formatDuration(totalDuration)}</p>
                  <p>📋 {steps.length} étapes guidées</p>
                  {uxMode === "breathing" && <p>🔄 ~{totalCycles} cycles</p>}
                </div>
              </>
            )}

            {/* En séance : liste des étapes avec suivi */}
            {phase !== "intro" && phase !== "done" && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {uxMode === "guided"
                    ? `Étapes · ${stepIndex + 1} / ${steps.length}`
                    : `Instructions · ${steps.length} étapes`
                  }
                </p>
                {steps.map((step, i) => {
                  const isActive = uxMode === "guided" && i === stepIndex && phase !== "intro"
                  const isDone   = uxMode === "guided" && i < stepIndex
                  return (
                    <div key={i} className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${
                      isActive ? "border border-black/8" : ""
                    }`}
                      style={isActive ? { background: colors.bg } : {}}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold"
                        style={{
                          background: isDone ? colors.ring : isActive ? colors.ring + "25" : "#f3f4f6",
                          color: isDone ? "white" : isActive ? colors.ring : "#9ca3af",
                        }}>
                        {isDone ? "✓" : i + 1}
                      </div>
                      <p className={`text-sm leading-relaxed ${
                        isActive ? "text-foreground font-medium"
                          : isDone ? "text-muted-foreground/60 line-through"
                          : "text-muted-foreground"
                      }`}>
                        {step}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Stats fin */}
            {phase === "done" && (
              <div className="space-y-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Résultats</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-3 text-center" style={{ background: colors.bg }}>
                    <p className="font-display text-lg font-bold" style={{ color: colors.text }}>{formatDuration(elapsed)}</p>
                    <p className="text-[10px] text-muted-foreground">durée</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: colors.bg }}>
                    <p className="font-display text-lg font-bold" style={{ color: colors.text }}>{steps.length}</p>
                    <p className="text-[10px] text-muted-foreground">étapes</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contrôles desktop */}
          <div className="p-5 border-t border-black/6 space-y-2">
            {phase === "intro" && (
              <p className="text-xs text-center text-muted-foreground py-1">
                Lancez la séance depuis le panneau principal
              </p>
            )}
            {phase === "running" && uxMode === "guided" && (
              <button onClick={handleNextStep}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold"
                style={{ background: `linear-gradient(135deg, ${colors.ring} 0%, ${colors.ring}cc 100%)` }}>
                {stepIndex < steps.length - 1
                  ? <><ChevronRight className="w-4 h-4" />Étape suivante</>
                  : <><Check className="w-4 h-4" />Terminer l'exercice</>
                }
              </button>
            )}
            {phase === "running" && uxMode === "breathing" && (
              <button onClick={handlePause}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-muted/50 border border-black/8 text-sm font-medium text-foreground">
                <Pause className="w-4 h-4" /> Pause
              </button>
            )}
            {phase === "paused" && (
              <div className="flex gap-2">
                <button onClick={handleRestart} className="p-3.5 rounded-xl border border-black/8 hover:bg-black/3 transition-colors">
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={handleResume}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold"
                  style={{ background: colors.ring }}>
                  <Play className="w-4 h-4 fill-white" /> Reprendre
                </button>
              </div>
            )}
            {phase === "done" && (
              <div className="flex gap-2">
                <button onClick={handleRestart} className="p-3.5 rounded-xl border border-black/8 hover:bg-black/3 transition-colors">
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={handleComplete} disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #2D5A4F 0%, #1E3D35 100%)" }}>
                  <Check className="w-4 h-4" />
                  {isSaving ? "Enregistrement…" : "Valider"}
                </button>
              </div>
            )}
          </div>
        </aside>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// VoiceCapture — widget enregistrement séance
// ─────────────────────────────────────────────

function VoiceCapture({ recorder, uploaded }: { recorder: UseVoiceRecorderReturn; uploaded: boolean }) {
  const { state, audioUrl, durationSeconds, start, stop, reset, error } = recorder

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  if (uploaded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100"
      >
        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="text-xs text-emerald-700 font-medium">
          Prise vocale envoyée à votre praticien ✓
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
      className="rounded-2xl bg-violet-50 border border-violet-100 p-4 space-y-3"
    >
      {/* Titre */}
      <div className="flex items-center gap-2">
        <Mic className="w-3.5 h-3.5 text-violet-600" />
        <p className="text-xs font-semibold text-violet-700">Prise vocale</p>
        <span className="ml-auto text-[10px] text-violet-400">pour votre praticien</span>
      </div>

      {/* Idle */}
      {state === "idle" && (
        <button
          onClick={start}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors"
        >
          <Mic className="w-3.5 h-3.5" />
          Enregistrer ma prise
        </button>
      )}

      {/* Recording */}
      {state === "recording" && (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {fmt(durationSeconds)}
          </span>
          <span className="text-[10px] text-violet-400 flex-1">max 60 s</span>
          <button
            onClick={stop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold transition-colors"
          >
            <Square className="w-3 h-3 fill-red-700" />
            Arrêter
          </button>
        </div>
      )}

      {/* Recorded */}
      {state === "recorded" && audioUrl && (
        <div className="space-y-2">
          <audio
            src={audioUrl}
            controls
            className="w-full h-9 rounded-lg"
            style={{ accentColor: "#7C3AED" }}
          />
          <div className="flex items-center justify-between">
            <button
              onClick={reset}
              className="text-[10px] text-violet-500 hover:text-violet-700 transition-colors underline underline-offset-2"
            >
              Recommencer
            </button>
            <span className="text-[10px] text-violet-400">{durationSeconds}s · sera envoyé à la validation</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[10px] text-red-600 leading-relaxed">{error}</p>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getUXMode(exercise: Exercise): UXMode {
  return BREATHING_CATEGORIES.includes(exercise.category) ? "breathing" : "guided"
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.min(1, Math.max(0, t))
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m${s > 0 ? ` ${s}s` : ""}` : `${s}s`
}

function getBreathPhases(exercise: Exercise): BreathPhase[] {
  const cat = exercise.category

  if (cat === "coherence_cardiaque") {
    if (exercise.id === "box_breathing") return [
      { label: "Inspirez",  durationMs: 4000, scale: 1.18, instruction: "par le nez · 4 s",     ringColor: "#DC2626" },
      { label: "Retenez",   durationMs: 4000, scale: 1.18, instruction: "poumons pleins · 4 s",  ringColor: "#B91C1C" },
      { label: "Expirez",   durationMs: 4000, scale: 0.92, instruction: "par la bouche · 4 s",   ringColor: "#991B1B" },
      { label: "Retenez",   durationMs: 4000, scale: 0.92, instruction: "poumons vides · 4 s",   ringColor: "#7F1D1D" },
    ]
    if (exercise.id === "respiration_478") return [
      { label: "Inspirez",  durationMs: 4000, scale: 1.18, instruction: "par le nez · 4 s",     ringColor: "#DC2626" },
      { label: "Retenez",   durationMs: 7000, scale: 1.18, instruction: "bloquez · 7 s",         ringColor: "#B91C1C" },
      { label: "Expirez",   durationMs: 8000, scale: 0.92, instruction: "par la bouche · 8 s",   ringColor: "#991B1B" },
    ]
    const is46 = exercise.id.includes("4_6")
    return [
      { label: "Inspirez",  durationMs: is46 ? 4000 : 5000, scale: 1.18, instruction: `par le nez · ${is46 ? 4 : 5} s`,  ringColor: "#DC2626" },
      { label: "Expirez",   durationMs: is46 ? 6000 : 5000, scale: 0.92, instruction: `par le nez · ${is46 ? 6 : 5} s`,  ringColor: "#991B1B" },
    ]
  }

  if (cat === "respiration_nasale") return [
    { label: "Inspirez nasale",  durationMs: 4000, scale: 1.14, instruction: "par le nez · 4 s",           ringColor: "#0284C7" },
    { label: "Expirez",          durationMs: 6000, scale: 0.92, instruction: "doucement par le nez · 6 s", ringColor: "#0369A1" },
  ]

  if (cat === "diaphragmatique") return [
    { label: "Gonflez le ventre",  durationMs: 4000, scale: 1.2,  instruction: "inspirez, ventre dehors · 4 s",  ringColor: "#D97706" },
    { label: "Retenez légèrement", durationMs: 2000, scale: 1.2,  instruction: "légère pause · 2 s",             ringColor: "#B45309" },
    { label: "Videz le ventre",    durationMs: 6000, scale: 0.9,  instruction: "expirez, ventre rentre · 6 s",   ringColor: "#92400E" },
  ]

  // relaxation / défaut
  return [
    { label: "Inspirez",  durationMs: 4000, scale: 1.15, instruction: "profondément · 4 s",  ringColor: "#0D9488" },
    { label: "Retenez",   durationMs: 2000, scale: 1.15, instruction: "doucement · 2 s",      ringColor: "#0F766E" },
    { label: "Expirez",   durationMs: 6000, scale: 0.92, instruction: "lentement · 6 s",      ringColor: "#134E4A" },
  ]
}

export default SessionLive
