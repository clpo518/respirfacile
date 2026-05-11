import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { usePatientProgram } from "@/hooks/usePatientProgram"
import { EXERCISES, EXERCISES_BY_CATEGORY } from "@/data/exercises"
import { AppLayout } from "@/components/AppLayout"
import { ClinicalContextBadge } from "@/components/library/ClinicalContextBadge"
import { motion } from "framer-motion"
import { Clock, ChevronRight } from "lucide-react"
import type { ExerciseCategory } from "@/data/exercises"

// ─────────────────────────────────────────────
// Practice — bibliothèque d'exercices
// ─────────────────────────────────────────────

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  pause_controlee: "Pause Contrôlée",
  coherence_cardiaque: "Cohérence Cardiaque",
  respiration_nasale: "Respiration Nasale",
  myofonctionnel: "Myofonctionnel",
  diaphragmatique: "Diaphragmatique",
  relaxation: "Relaxation",
}

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as ExerciseCategory[]

const Practice = () => {
  const navigate = useNavigate()
  const { profile, isTherapist } = useAuth()
  const { program, todayExercises } = usePatientProgram()

  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | "all">("all")

  // Exercices filtrés
  const filteredExercises = activeCategory === "all"
    ? EXERCISES
    : (EXERCISES_BY_CATEGORY[activeCategory] ?? [])

  // Exercices du programme du patient (pour badge "Dans votre programme")
  const programExerciseIds = new Set(todayExercises.map(e => e.id))

  return (
    <AppLayout>
      <div className="pb-24 lg:pb-8">

        {/* ── Header ──────────────────────────── */}
        <header className="px-5 pt-10 lg:pt-12 pb-2">
          <p className="text-sm text-muted-foreground">Explorer</p>
          <h1 className="font-display text-2xl text-foreground mt-0.5">Tous les exercices</h1>
        </header>

        <div className="px-5 mt-5 space-y-5">

          {/* ── Filtres catégories ────────────── */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-5 px-5">
            <CategoryChip
              label="Tout"
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            />
            {ALL_CATEGORIES.map(cat => (
              <CategoryChip
                key={cat}
                label={CATEGORY_LABELS[cat]}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>

          {/* ── Liste exercices : 1 col mobile, 2 col desktop ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {filteredExercises.map((ex, i) => {
              const isInProgram = programExerciseIds.has(ex.id)
              const isContraindicated = program?.profile_type
                ? ex.contraindications?.includes(program.profile_type as any)
                : false

              return (
                <motion.button
                  key={ex.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => {
                    if (!isContraindicated) navigate(`/session-live?exercise=${ex.id}`)
                  }}
                  disabled={isContraindicated}
                  className={`
                    w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left
                    ${isContraindicated
                      ? "opacity-40 bg-muted border-border cursor-not-allowed"
                      : "bg-card border-border hover:border-primary/30 hover:shadow-soft cursor-pointer"
                    }
                  `}
                >
                  {/* Icône */}
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 text-2xl">
                    {ex.icon}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">{ex.name_fr}</p>
                      {isInProgram && !isContraindicated && (
                        <span className="badge-active text-[10px] px-2 py-0.5">Programme</span>
                      )}
                      {isContraindicated && (
                        <span className="badge-warning text-[10px] px-2 py-0.5">Non recommandé</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {ex.description_fr}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDuration(ex.duration_seconds)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS[ex.category as ExerciseCategory] ?? ex.category}
                      </span>
                      {isTherapist && (
                        <ClinicalContextBadge
                          category={ex.category}
                          exerciseId={ex.id}
                          compact
                        />
                      )}
                    </div>
                  </div>

                  {!isContraindicated && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </motion.button>
              )
            })}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
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

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        shrink-0 px-4 py-2 rounded-pill text-xs font-medium transition-all duration-200
        ${active
          ? "bg-primary text-white shadow-soft"
          : "bg-card border border-border text-muted-foreground hover:border-primary/30"
        }
      `}
    >
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return m > 0 ? `${m} min` : `${seconds}s`
}

export default Practice
