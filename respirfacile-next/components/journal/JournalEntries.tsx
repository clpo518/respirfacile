"use client";

interface JournalEntry {
  id: string;
  created_at: string;
  wellbeing_score: number;
  sleep_score: number;
  anxiety_level: number;
  nasal_breathing: number;
  exercise_completed: boolean;
  notes: string | null;
}

interface JournalEntriesProps {
  entries: JournalEntry[];
}

export function JournalEntries({ entries }: JournalEntriesProps) {
  const emojiScale = (value: number) => {
    if (value <= 2) return "😔";
    if (value <= 4) return "😐";
    if (value <= 6) return "🙂";
    if (value <= 8) return "😊";
    return "😄";
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (entries.length === 0) {
    return (
      <div className="bg-beige-100 rounded-3xl border border-beige-300 p-12 shadow-beige text-center">
        <div className="text-5xl mb-4">📔</div>
        <p className="font-semibold text-forest-800 mb-2">Votre journal est en attente…</p>
        <p className="text-forest-600">Chaque semaine, partagez vos sensations et vos observations. Cela aidera votre orthophoniste à adapter votre programme.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-beige-100 rounded-3xl border border-beige-300 p-6 shadow-beige hover:shadow-lg transition-shadow">
          {/* Header with date */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-beige-300">
            <p className="text-sm font-semibold text-forest-800">{formatDate(entry.created_at)}</p>
            {entry.exercise_completed && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-forest-100 text-forest-700 text-xs font-medium">
                ✓ Exercices complétés
              </span>
            )}
          </div>

          {/* Scores grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl mb-1">{emojiScale(entry.wellbeing_score)}</div>
              <p className="text-xs text-forest-500 mb-1">Bien-être</p>
              <p className="font-bold text-forest-800">{entry.wellbeing_score}/10</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{emojiScale(entry.sleep_score)}</div>
              <p className="text-xs text-forest-500 mb-1">Sommeil</p>
              <p className="font-bold text-forest-800">{entry.sleep_score}/10</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{emojiScale(entry.anxiety_level)}</div>
              <p className="text-xs text-forest-500 mb-1">Anxiété</p>
              <p className="font-bold text-forest-800">{entry.anxiety_level}/10</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{emojiScale(entry.nasal_breathing)}</div>
              <p className="text-xs text-forest-500 mb-1">Respiration nasale</p>
              <p className="font-bold text-forest-800">{entry.nasal_breathing}/10</p>
            </div>
          </div>

          {/* Notes */}
          {entry.notes && (
            <div className="bg-beige-50 rounded-2xl p-4 border border-beige-200">
                            <p className="text-sm text-stone-600">{(entry as any).free_text || (entry as any).notes || ""}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
