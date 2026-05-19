import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { usePatientProgram } from "@/hooks/usePatientProgram"
import { EXERCISES, EXERCISES_BY_CATEGORY } from "@/data/exercises"
import { AppLayout } from "@/components/AppLayout"
import { motion } from "framer-motion"
import { Clock, Play, Mic } from "lucide-react"
import type { ExerciseCategory } from "@/data/exercises"

// ─────────────────────────────────────────────
// Practice — bibliothèque d'exercices (desktop-first)
// ─────────────────────────────────────────────

const CATEGORIES: { id: ExerciseCategory | "all"; label: string; emoji: string; bg: string; chip: string }[] = [
  { id: "all",              label: "Tout",               emoji: "🌿", bg: "bg-forest/10",     chip: "bg-forest/10 text-forest" },
  { id: "pause_controlee",  label: "Pause Contrôlée",    emoji: "🫁", bg: "bg-emerald-50",    chip: "bg-emerald-100 text-emerald-700" },
  { id: "coherence_cardiaque", label: "Cohérence Cardiaque", emoji: "❤️", bg: "bg-red-50",   chip: "bg-red-100 text-red-700" },
  { id: "respiration_nasale",  label: "Respiration Nasale", emoji: "👃", bg: "bg-sky-50",    chip: "bg-sky-100 text-sky-700" },
  { id: "myofonctionnel",   label: "Myofonctionnel",     emoji: "👅", bg: "bg-violet-50",    chip: "bg-violet-100 text-violet-700" },
  { id: "diaphragmatique",  label: "Diaphragmatique",    emoji: "🌬️", bg: "bg-orange-50",   chip: "bg-orange-100 text-orange-700" },
  // "relaxation" retiré du filtre — aucun exercice dans cette catégorie pour l'instant
]

const Practice = () => {
  const navigate = useNavigate()
  const { isTherapist } = useAuth()
  const { todayExercises } = usePatientProgram()
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | "all">("all")

  const programExerciseIds = new Set(todayExercises.map(e => e.id))

  const filteredExercises = activeCategory === "all"
    ? EXERCISES
    : (EXERCISES_BY_CATEGORY[activeCategory] ?? [])

  const activeCatMeta = CATEGORIES.find(c => c.id === activeCategory)!

  return (
    <AppLayout>
      <div className="pb-24 lg:pb-10">

        {/* ── Header ──────────────────────────── */}
        <header className="px-6 pt-10 lg:pt-12 pb-2">
          <p className="text-sm text-muted-foreground">Explorer</p>
          <h1 className="font-display text-2xl text-foreground mt-0.5">Tous les exercices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredExercises.length} exercice{filteredExercises.length > 1 ? "s" : ""}
            {activeCategory !== "all" && ` · ${activeCatMeta.label}`}
          </p>
        </header>

        <div className="mt-5 space-y-5">

          {/* ── Filtres ──────────────────────────── */}
          <div className="px-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as ExerciseCategory | "all")}
                className={`
                  shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-pill text-xs font-medium transition-all duration-200
                  ${activeCategory === cat.id
                    ? "bg-primary text-white shadow-soft"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/30"}
                `}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* ── Grille exercices ─────────────────── */}
          {/* Mobile: 1 col · md: 2 col · lg: 3 col */}
          <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredExercises.map((ex, i) => {
              const catMeta   = CATEGORIES.find(c => c.id === ex.category)
              const inProgram = programExerciseIds.has(ex.id)

              return (
                <motion.button
                  key={ex.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }}
                  onClick={() => navigate(`/session-live?exercise=${ex.id}`)}
                  className="group flex flex-col rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-soft transition-all duration-200 text-left overflow-hidden"
                >
                  {/* Bandeau couleur catégorie */}
                  <div className={`h-24 ${catMeta?.bg ?? "bg-muted"} flex items-center justify-center relative overflow-hidden`}>
                    {/* Overlay hover */}
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors" />
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                      {ex.icon}
                    </span>
                    {/* Badge programme */}
                    {inProgram && (
                      <span className="absolute top-2 right-2 text-[9px] font-semibold bg-primary text-white px-2 py-0.5 rounded-full">
                        Programme
                      </span>
                    )}
                    {/* Badge vocal */}
                    {ex.voice_exercise && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-semibold bg-white/80 text-violet-700 px-2 py-0.5 rounded-full shadow-sm">
                        <Mic className="w-2.5 h-2.5" /> Vocal
                      </span>
                    )}
                  </div>

                  {/* Contenu card */}
                  <div className="flex flex-col flex-1 p-4 gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{ex.name_fr}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {ex.description_fr}
                      </p>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap mt-auto pt-2 border-t border-border/60">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDuration(ex.duration_seconds)}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${catMeta?.chip ?? "bg-muted text-muted-foreground"}`}>
                        {catMeta?.label ?? ex.category}
                      </span>
                      {/* Niveau */}
                      <span className="ml-auto">
                        <DifficultyBadge level={ex.difficulty} />
                      </span>
                    </div>
                  </div>

                  {/* CTA pied de card */}
                  <div className="px-4 pb-3">
                    <div className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors text-primary text-xs font-semibold">
                      <Play className="w-3 h-3 fill-primary" />
                      Commencer
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-16 px-6">
              <span className="text-3xl mb-3 block">🔍</span>
              <p className="text-muted-foreground text-sm">Aucun exercice dans cette catégorie</p>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  )
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function DifficultyBadge({ level }: { level: 1 | 2 | 3 }) {
  const map: Record<1 | 2 | 3, { label: string; cls: string }> = {
    1: { label: "Débutant",      cls: "bg-emerald-50 text-emerald-700" },
    2: { label: "Intermédiaire", cls: "bg-amber-50   text-amber-700" },
    3: { label: "Avancé",        cls: "bg-rose-50    text-rose-700" },
  }
  const { label, cls } = map[level]
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDuration(s: number): string {
  const m = Math.floor(s / 60)
  return m > 0 ? `${m} min` : `${s}s`
}

export default Practice
