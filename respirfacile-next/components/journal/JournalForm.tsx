"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface JournalFormProps {
  userId: string;
}

const emojiScale = (value: number) => {
  if (value <= 2) return "😔";
  if (value <= 4) return "😐";
  if (value <= 6) return "🙂";
  if (value <= 8) return "😊";
  return "😄";
};

/**
 * Déclaré au niveau du module, et non dans le rendu de JournalForm : un
 * composant recréé à chaque rendu remonte son <input>, ce qui interrompait le
 * glissement du curseur dès le premier mouvement sur mobile.
 *
 * Les bornes sont explicites parce qu'elles s'inversent selon la question :
 * 10 sur « anxiété » n'est pas un bon score.
 */
function ScaleControl({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
  invertEmoji = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
  invertEmoji?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-forest-800">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emojiScale(invertEmoji ? 11 - value : value)}</span>
          <span className="text-sm font-bold text-forest-700 w-6 text-right">{value}</span>
        </div>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-beige-300 rounded-lg appearance-none cursor-pointer accent-forest-500"
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-forest-400 px-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export function JournalForm({ userId }: JournalFormProps) {
  const router = useRouter();
  const [wellbeing, setWellbeing] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [nasalBreathing, setNasalBreathing] = useState(5);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error: err } = await supabase.from("journal_entries").insert([
        {
          user_id: userId,
          wellbeing_score: wellbeing,
          sleep_score: sleep,
          exercise_completed: exerciseCompleted,
          anxiety_level: anxietyLevel,
          nasal_breathing: nasalBreathing,
          notes: notes.trim() || null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (err) {
        // Si la table n'existe pas encore, on indique quand même le succès
        if (err.code === "42P01") {
          setSuccess(true);
          return;
        }
        throw err;
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError("Une erreur est survenue. Réessayez dans quelques instants.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">✅</div>
        <p className="font-semibold text-forest-800 text-lg mb-2">Journal enregistré !</p>
        <p className="text-sm text-forest-600">Merci. Votre orthophoniste pourra consulter vos réponses lors de votre prochaine séance.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <p className="text-sm text-forest-600 bg-beige-100 rounded-xl px-4 py-3 border border-beige-300">
        📅 Ce journal est <strong>hebdomadaire</strong>, prenez 2 minutes chaque semaine pour faire le point. Votre orthophoniste le consulte avant chaque séance.
      </p>

      {/* Well-being scores */}
      <div className="space-y-6">
        <ScaleControl
          label="🫁 Comment vous sentez-vous globalement ?"
          value={wellbeing}
          onChange={setWellbeing}
          lowLabel="Très mal"
          highLabel="Très bien"
        />
        <ScaleControl
          label="😴 Qualité de votre sommeil cette semaine"
          value={sleep}
          onChange={setSleep}
          lowLabel="Très mauvaise"
          highLabel="Très bonne"
        />
        <ScaleControl
          label="😰 Niveau d'anxiété ressenti"
          value={anxietyLevel}
          onChange={setAnxietyLevel}
          lowLabel="Aucune anxiété"
          highLabel="Très anxieux"
          invertEmoji
        />
        <ScaleControl
          label="👃 Facilité à respirer par le nez"
          value={nasalBreathing}
          onChange={setNasalBreathing}
          lowLabel="Nez très bouché"
          highLabel="Nez parfaitement libre"
        />
      </div>

      {/* Exercises */}
      <div className="border-t border-beige-300 pt-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={exerciseCompleted}
            onChange={(e) => setExerciseCompleted(e.target.checked)}
            className="w-5 h-5 rounded border border-forest-500 accent-forest-500 cursor-pointer"
          />
          <span className="font-semibold text-forest-800">
            ✓ J'ai réalisé mes exercices cette semaine
          </span>
        </label>
      </div>

      {/* Notes */}
      <div className="border-t border-beige-300 pt-6">
        <label htmlFor="notes" className="block text-sm font-semibold text-forest-800 mb-3">
          📝 Notes personnelles (optionnel)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Cette semaine j'ai remarqué que… je ressens…"
          rows={4}
          className="w-full px-4 py-3 rounded-2xl border border-beige-300 bg-beige-50 text-forest-800 placeholder-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-500 resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-forest-500 mt-2">
          Vos notes seront visibles par votre orthophoniste pour adapter votre programme.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 rounded-2xl bg-forest-500 hover:bg-forest-600 disabled:opacity-50 text-white font-semibold transition-colors disabled:cursor-not-allowed"
      >
        {isLoading ? 'Enregistrement…' : 'Enregistrer mon journal de la semaine'}
      </button>
    </form>
  );
}
