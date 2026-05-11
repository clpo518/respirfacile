// ─────────────────────────────────────────────────────────────────
// Page de preview éphémère pour valider visuellement
// le composant <ClinicalContextBadge /> sur l'ensemble du catalogue.
//
// ⚠️ À RETIRER APRÈS VALIDATION (route + import dans App.tsx)
// ─────────────────────────────────────────────────────────────────

import { ClinicalContextBadge } from "@/components/library/ClinicalContextBadge"
import { EXERCISES, EXERCISE_FAMILIES } from "@/data/exercises"
import { Clock } from "lucide-react"

export default function PreviewClinicalBadges() {
  return (
    <div className="min-h-screen bg-background py-10 px-5">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            Preview éphémère — à retirer après validation
          </p>
          <h1 className="font-display text-3xl text-foreground mt-1">
            Cadre clinique sur les exercices
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Cette page rend le composant <code className="text-primary">&lt;ClinicalContextBadge /&gt;</code>{" "}
            sur l'ensemble du catalogue. Chaque exercice expose son cadre clinique au praticien
            via un popover. Côté patient, le badge n'est jamais monté (vérifié dans Practice.tsx).
          </p>
        </header>

        <section className="space-y-8">
          {EXERCISE_FAMILIES.map((fam) => {
            const exercises = EXERCISES.filter((e) => e.category === fam.id)
            if (exercises.length === 0) return null
            return (
              <div key={fam.id}>
                <h2 className="font-display text-lg text-foreground flex items-center gap-2 mb-3">
                  <span className="text-2xl">{fam.icon}</span>
                  {fam.label}
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card"
                    >
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 text-2xl">
                        {ex.family_icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {ex.name_fr}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {ex.description_fr}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {Math.round(ex.duration_seconds / 60) || 1} min
                          </span>
                          <ClinicalContextBadge category={ex.category} exerciseId={ex.id} compact />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </section>

        <footer className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Pour tester en conditions réelles : se connecter en tant que praticien
            (orthophoniste / kinésithérapeute) puis ouvrir <code>/practice</code>.
            Le badge n'apparaît que si <code>isTherapist === true</code>.
          </p>
        </footer>
      </div>
    </div>
  )
}
