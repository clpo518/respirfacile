import { useNavigate, Link, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { usePatientProgram } from "@/hooks/usePatientProgram"
import { supabase } from "@/integrations/supabase/client"
import { EXERCISES } from "@/data/exercises"
import { AppLayout } from "@/components/AppLayout"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  Play, ChevronRight, Settings, Clock,
  TrendingUp, Calendar, ArrowRight,
  Dumbbell, CheckCircle2, Award, Activity,
  Stethoscope, Star,
} from "lucide-react"

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
  myofonctionnel:      "Myofonctionnel",
  diaphragmatique:     "Diaphragmatique",
  relaxation:          "Relaxation",
}

// ─────────────────────────────────────────────

const Dashboard = () => {
  const navigate   = useNavigate()
  const { profile, isTherapist, user } = useAuth()
  const {
    program, programLoading,
    todayExercises, weekDays, stats,
    recentSessions, weekSessions,
  } = usePatientProgram()

  const [therapistName, setTherapistName] = useState<string | null>(null)

  // Récupère le nom du praticien lié
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

  if (isTherapist) return <Navigate to="/patients" replace />

  const firstName    = profile?.full_name?.split(" ")[0] ?? "vous"
  const greeting     = getGreeting()
  const nextExercise = todayExercises.find(e => !e.completed) ?? todayExercises[0]
  const allDoneToday = todayExercises.length > 0 && todayExercises.every(e => e.completed)
  const totalMinutes = Math.round(recentSessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) / 60)
  const profileMeta  = program?.profile_type ? PROFILE_LABELS[program.profile_type] : null

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
                    <p className="text-xs text-white/60">Prescrit par</p>
                    <p className="text-sm font-semibold text-white">
                      {therapistName ?? "Votre orthophoniste"}
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
                  Votre praticien configure votre programme basé sur votre profil.
                  Vous recevrez vos exercices dès la prochaine consultation.
                </p>

                {/* Stats scientifiques */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15">
                  {[
                    { value: "−50%",  label: "IAH en moyenne",      icon: TrendingUp },
                    { value: "15 min", label: "par jour",            icon: Clock },
                    { value: "9",      label: "études cliniques",    icon: Award },
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
                    {totalMinutes} min de rééducation · votre praticien voit votre progression
                  </p>
                </div>
                <Activity className="w-4 h-4 text-primary shrink-0" />
              </motion.div>
            )}

            {/* CTA explorer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.36 }}
            >
              <Button
                className="w-full btn-forest py-3.5 gap-2"
                onClick={() => navigate("/practice")}
              >
                <Dumbbell className="w-4 h-4" />
                Explorer les 13 exercices du programme
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
                    {therapistName ? `Suivi par ${therapistName}` : "Suivi par votre orthophoniste"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Progression transmise en temps réel · {stats.totalSessions} séance{stats.totalSessions !== 1 ? "s" : ""} validée{stats.totalSessions !== 1 ? "s" : ""}
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
                  { value: `${stats.currentWeek}/8`, label: "Semaine",      color: "text-forest" },
                  { value: stats.sessionsThisWeek,   label: "Cette sem.",   color: "text-primary" },
                  { value: stats.totalSessions,      label: "Total séances", color: "text-primary" },
                  { value: `${totalMinutes}min`,     label: "Pratiqué",     color: "text-amber-600" },
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
                    Votre séance est validée. Votre orthophoniste voit votre progression en temps réel.
                  </p>
                  <button
                    onClick={() => navigate("/practice")}
                    className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline mt-1"
                  >
                    Explorer d'autres exercices <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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
