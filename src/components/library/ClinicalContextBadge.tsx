import { Stethoscope, AlertTriangle, BookOpen, Target, Activity, ChevronRight } from "lucide-react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getClinicalContext, hasClinicalContext } from "@/lib/clinicalContexts"
import type { ExerciseCategory } from "@/data/exercises"

interface ClinicalContextBadgeProps {
  category: string
  exerciseId?: string
  /** compact = chip mini sans le label, pour les cards denses */
  compact?: boolean
}

// ─────────────────────────────────────────────────────────────────
// Chip "Cadre clinique" — visible côté praticien uniquement.
// Le caller doit vérifier isTherapist avant de monter le composant.
// ─────────────────────────────────────────────────────────────────

export function ClinicalContextBadge({
  category,
  exerciseId,
  compact = false,
}: ClinicalContextBadgeProps) {
  if (!hasClinicalContext(category)) return null

  const ctx = getClinicalContext(category as ExerciseCategory, exerciseId)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label="Voir le cadre clinique"
          className={`
            inline-flex items-center gap-1 rounded-full
            bg-primary/10 text-primary border border-primary/20
            hover:bg-primary/15 transition-colors
            ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs font-medium"}
          `}
        >
          <Stethoscope className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
          {!compact && <span>Cadre clinique</span>}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="top"
        sideOffset={8}
        className="w-80 p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="bg-primary/5 px-4 py-3 border-b border-border">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">
            Cadre clinique
          </p>
          <p className="text-sm font-display text-foreground mt-0.5">
            {ctx.frameworkFull}
          </p>
        </div>

        {/* Corps */}
        <div className="px-4 py-3 space-y-3 text-xs">
          <Section icon={<Target className="w-3.5 h-3.5" />} title="Indication">
            {ctx.indication}
          </Section>

          <Section icon={<ChevronRight className="w-3.5 h-3.5" />} title="Mécanisme">
            {ctx.mechanism}
          </Section>

          <Section icon={<Activity className="w-3.5 h-3.5" />} title="Métriques suivies">
            <ul className="space-y-0.5 mt-0.5">
              {ctx.metrics.map((m) => (
                <li key={m} className="text-muted-foreground">• {m}</li>
              ))}
            </ul>
          </Section>

          {ctx.caution && (
            <div className="flex gap-2 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-2 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{ctx.caution}</p>
            </div>
          )}

          {ctx.reference && (
            <div className="pt-2 border-t border-border flex gap-2 text-[11px] text-muted-foreground">
              <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <p className="italic leading-relaxed">{ctx.reference}</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─────────────────────────────────────────────────────────────────
// Sub-component
// ─────────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-foreground font-medium mb-0.5">
        <span className="text-primary">{icon}</span>
        <span>{title}</span>
      </div>
      <div className="text-muted-foreground leading-relaxed pl-5">{children}</div>
    </div>
  )
}
