import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Send, User, Check, Clock, Zap } from "lucide-react"
import {
  exerciseCategories,
  getExercisesByCategory,
  type Exercise,
  type ExerciseCategory,
} from "@/data/exercises"

interface AssignExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedPatientId?: string
  preselectedPatientName?: string
}

const SESSION_CHIPS = [1, 3, 5, 10]
const WEEK_CHIPS = [1, 2, 3, 5, 7]

const DIFFICULTY_DOTS: Record<number, string> = {
  1: "Facile",
  2: "Intermédiaire",
  3: "Avancé",
}

export default function AssignExerciseModal({
  isOpen,
  onClose,
  preselectedPatientId,
  preselectedPatientName,
}: AssignExerciseModalProps) {
  const { user } = useAuth()

  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | "">("")
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [targetSessions, setTargetSessions] = useState(5)
  const [sessionsPerWeek, setSessionsPerWeek] = useState(5)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory("")
      setSelectedExercise(null)
      setTargetSessions(5)
      setSessionsPerWeek(5)
      setNote("")
    }
  }, [isOpen])

  const exercisesInCategory = selectedCategory
    ? getExercisesByCategory(selectedCategory as ExerciseCategory)
    : []

  const weeksEstimate = sessionsPerWeek > 0
    ? Math.ceil(targetSessions / sessionsPerWeek)
    : null

  const canSubmit = !!preselectedPatientId && !!selectedCategory

  const handleSubmit = async () => {
    if (!canSubmit || !user) return
    setLoading(true)

    const { error } = await (supabase as any).from("assignments").insert({
      patient_id: preselectedPatientId,
      therapist_id: user.id,
      exercise_category: selectedExercise?.category ?? selectedCategory,
      exercise_id: selectedExercise?.id ?? null,
      message: note.trim() || null,
      status: "pending",
      target_sessions: targetSessions,
      sessions_per_week: sessionsPerWeek,
    })

    setLoading(false)

    if (error) {
      console.error("Error creating assignment:", error)
      toast.error("Impossible d'envoyer la prescription")
      return
    }

    // Notify patient (fire-and-forget)
    const exerciseTitle =
      selectedExercise?.name_fr ??
      exerciseCategories.find(c => c.id === selectedCategory)?.title ??
      selectedCategory
    supabase.functions.invoke("notify-prescription", {
      body: {
        patientId: preselectedPatientId,
        therapistId: user.id,
        exerciseTitle,
        message: note.trim() || undefined,
      },
    }).catch(() => {})

    toast.success("Prescription envoyée !")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] p-0 overflow-hidden border-0 gap-0 flex flex-col">

        {/* ── Header gradient ──────────────────────── */}
        <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 pt-8 pb-6 text-center shrink-0">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 mb-3"
          >
            <Send className="w-6 h-6 text-primary" />
          </motion.div>
          <h2 className="font-display text-xl font-bold tracking-tight">Prescrire un exercice</h2>
          {preselectedPatientName && (
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{preselectedPatientName}</p>
            </div>
          )}
        </div>

        {/* ── Corps scrollable ─────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 min-h-0">

          {/* ── Catégorie ─────────────────────────── */}
          <section className="space-y-3">
            <SectionLabel>Catégorie d'exercice</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {exerciseCategories.map(cat => {
                const active = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id as ExerciseCategory)
                      setSelectedExercise(null)
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left
                      ${active
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
                      }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="leading-tight flex-1">{cat.title}</span>
                    {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </section>

          {/* ── Exercice spécifique ───────────────── */}
          <AnimatePresence>
            {selectedCategory && exercisesInCategory.length > 0 && (
              <motion.section
                key="exercises"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-3"
              >
                <SectionLabel>
                  Exercice précis{" "}
                  <span className="font-normal normal-case text-muted-foreground/70">(optionnel)</span>
                </SectionLabel>
                <div className="space-y-2">
                  {exercisesInCategory.map(ex => {
                    const active = selectedExercise?.id === ex.id
                    return (
                      <button
                        key={ex.id}
                        onClick={() => setSelectedExercise(active ? null : ex)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                          ${active
                            ? "bg-primary/10 border-primary/40"
                            : "bg-card border-border hover:border-primary/20"
                          }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 text-xl">
                          {ex.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${active ? "text-primary" : "text-foreground"}`}>
                            {ex.name_fr}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {Math.floor(ex.duration_seconds / 60)} min
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {DIFFICULTY_DOTS[ex.difficulty] ?? ""}
                            </span>
                          </div>
                        </div>
                        {active && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* ── Fréquence ─────────────────────────── */}
          <section className="space-y-4">
            <SectionLabel>Fréquence</SectionLabel>

            {/* Total séances */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Nombre de séances à faire</p>
              <div className="flex flex-wrap gap-2">
                {SESSION_CHIPS.map(n => (
                  <ChipButton
                    key={n}
                    active={targetSessions === n}
                    onClick={() => setTargetSessions(n)}
                  >
                    {n} {n === 1 ? "séance" : "séances"}
                  </ChipButton>
                ))}
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={SESSION_CHIPS.includes(targetSessions) ? "" : targetSessions}
                  onChange={e => {
                    const v = parseInt(e.target.value, 10)
                    if (!isNaN(v) && v >= 1 && v <= 100) setTargetSessions(v)
                  }}
                  placeholder="Autre…"
                  className="w-24 px-3 py-1.5 rounded-full text-sm border border-border bg-card focus:outline-none focus:border-primary/50 text-foreground"
                />
              </div>
            </div>

            {/* Par semaine */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Par semaine</p>
              <div className="flex flex-wrap gap-2">
                {WEEK_CHIPS.map(n => (
                  <ChipButton
                    key={n}
                    active={sessionsPerWeek === n}
                    onClick={() => setSessionsPerWeek(n)}
                  >
                    {n}×/sem
                  </ChipButton>
                ))}
              </div>
            </div>

            {/* Résumé estimé */}
            {weeksEstimate !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-primary/8 border border-primary/15"
              >
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm text-foreground leading-snug">
                  <span className="font-semibold">{targetSessions} séances</span> à raison de{" "}
                  <span className="font-semibold">{sessionsPerWeek}×/semaine</span>
                  {" "}— environ{" "}
                  <span className="font-semibold text-primary">
                    {weeksEstimate} semaine{weeksEstimate > 1 ? "s" : ""}
                  </span>
                </p>
              </motion.div>
            )}
          </section>

          {/* ── Note ──────────────────────────────── */}
          <section className="space-y-2">
            <SectionLabel>
              Note pour le patient{" "}
              <span className="font-normal normal-case text-muted-foreground/70">(optionnel)</span>
            </SectionLabel>
            <Textarea
              placeholder="Ex: Pratiquez de préférence le matin, juste après le lever…"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
            />
          </section>

        </div>

        {/* ── Footer ──────────────────────────────── */}
        <div className="px-6 py-4 border-t border-border/60 flex gap-3 shrink-0 bg-card">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="rounded-xl flex-[2] gap-2 font-semibold h-11"
          >
            <Send className="w-4 h-4" />
            {loading ? "Envoi en cours…" : "Envoyer la prescription"}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {children}
    </p>
  )
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150
        ${active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-card border-border text-foreground hover:border-primary/40"
        }`}
    >
      {children}
    </button>
  )
}
