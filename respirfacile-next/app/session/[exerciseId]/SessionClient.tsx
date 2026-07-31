"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Exercise } from "@/lib/data/exercises";

interface Props {
  exercise: Exercise;
  userId: string;
}

type Phase = "intro" | "running" | "input" | "rating" | "done";

/** Libellés du ressenti, du plus difficile au plus confortable. */
const COMFORT_LABELS = ["", "Difficile", "Moyen", "Bien", "Très bien", "Excellent"] as const;

function ProgressRing({
  progress,
  size = 160,
  stroke = 10,
  color = "#2D5016",
}: {
  progress: number; // 0 to 1
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8DCC8" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

export default function SessionClient({ exercise, userId }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [elapsed, setElapsed] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [stars, setStars] = useState(0);
  const [saving, setSaving] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [paused, setPaused] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Le temps se lit sur l'horloge, il ne se compte pas en battements : un
  // setInterval est fortement ralenti dès que l'onglet passe en arrière-plan,
  // et une séance de respiration chronométrée dérivait de plusieurs dizaines
  // de secondes si le patient regardait son téléphone ailleurs.
  const startedAtRef = useRef<number | null>(null);
  const pausedTotalRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);

  const duration = exercise.duration_seconds;

  useEffect(() => {
    if (phase !== "running" || paused) return;
    if (startedAtRef.current === null) startedAtRef.current = Date.now();

    const tick = () => {
      const started = startedAtRef.current;
      if (started === null) return;
      const next = Math.floor((Date.now() - started - pausedTotalRef.current) / 1000);
      setElapsed(next);

      const instrCount = exercise.instructions_fr.length;
      const step = Math.max(1, Math.floor(duration / instrCount));
      setCurrentInstruction(Math.min(Math.floor(next / step), instrCount - 1));

      if (next >= duration) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase(exercise.requiresInput ? "input" : "rating");
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, paused, duration, exercise.instructions_fr.length, exercise.requiresInput]);

  const togglePause = useCallback(() => {
    setPaused((wasPaused) => {
      if (wasPaused) {
        // Reprise : le temps passé en pause ne compte pas dans la séance.
        if (pausedAtRef.current !== null) {
          pausedTotalRef.current += Date.now() - pausedAtRef.current;
          pausedAtRef.current = null;
        }
      } else {
        pausedAtRef.current = Date.now();
      }
      return !wasPaused;
    });
  }, []);

  const handleFinishEarly = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase(exercise.requiresInput ? "input" : "rating");
  }, [exercise.requiresInput]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);

    const inputScore =
      exercise.requiresInput && inputValue ? parseInt(inputValue, 10) : null;

    try {
      const res = await fetch("/api/session/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise_id: exercise.id,
          duration_seconds: Math.max(elapsed, 1),
          // Mesure objective d'un côté, ressenti de l'autre. Le ressenti
          // partait auparavant dans `score`, où il se confondait avec un
          // résultat clinique sur la fiche du praticien.
          score: inputScore,
          comfort_rating: stars > 0 ? stars : null,
          completed: true,
        }),
      });
      if (!res.ok) throw new Error("save failed");
    } catch {
      // Ne jamais annoncer « enregistrée » sur un échec : le patient croirait
      // que son praticien voit la séance, et personne ne s'en apercevrait.
      setSaving(false);
      setSaveError(
        "Votre séance n'a pas pu être enregistrée. Vérifiez votre connexion et réessayez.",
      );
      return;
    }

    setSaving(false);
    setPhase("done");
    setTimeout(() => router.push("/exercises"), 1800);
  }, [stars, exercise.requiresInput, exercise.id, inputValue, elapsed, router]);

  const progress = Math.min(elapsed / duration, 1);
  const remaining = Math.max(duration - elapsed, 0);
  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");

  // ── INTRO ───────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-beige-200 flex flex-col">
        <header className="bg-beige-100/90 backdrop-blur border-b border-beige-300 px-4 py-3 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-full bg-beige-300 hover:bg-beige-400 transition-colors flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-forest-700" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-semibold text-forest-800 text-sm">{exercise.name_fr}</span>
          </div>
        </header>

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
          {/* Hero */}
          <div className="bg-beige-100 rounded-3xl border border-beige-300 p-8 text-center shadow-sm">
            <div className="text-6xl mb-4">{exercise.emoji}</div>
            <h1 className="text-2xl font-bold text-forest-800 mb-2">{exercise.name_fr}</h1>
            <p className="text-forest-500 text-sm leading-relaxed max-w-sm mx-auto">
              {exercise.description_fr}
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-forest-500">
              <span className="bg-beige-200 px-3 py-1 rounded-full">
                ⏱ {Math.floor(duration / 60)} min
              </span>
              {exercise.sets && (
                <span className="bg-beige-200 px-3 py-1 rounded-full">
                  🔄 {exercise.sets} cycles
                </span>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-beige-100 rounded-3xl border border-beige-300 p-6 shadow-sm">
            <h2 className="font-semibold text-forest-800 mb-4 flex items-center gap-2">
              <span>📋</span> Comment faire
            </h2>
            <ol className="space-y-3">
              {exercise.instructions_fr.map((instr, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-forest-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-forest-500/10 text-forest-700 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{instr}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {exercise.tips_fr && exercise.tips_fr.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="font-semibold text-amber-800 mb-2 text-sm flex items-center gap-1.5">
                <span>💡</span> Conseils
              </h3>
              <ul className="space-y-1.5">
                {exercise.tips_fr.map((tip, i) => (
                  <li key={i} className="text-sm text-amber-800 leading-relaxed">• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => setPhase("running")}
            className="w-full py-4 bg-forest-600 hover:bg-forest-700 text-white font-bold text-lg rounded-2xl transition-colors shadow-md active:scale-[0.98]"
          >
            Commencer la séance →
          </button>
        </main>
      </div>
    );
  }

  // ── RUNNING ─────────────────────────────────────────────────────────────────
  if (phase === "running") {
    return (
      <div className="min-h-screen bg-forest-800 flex flex-col text-white">
        <header className="px-4 py-3 flex items-center justify-between max-w-2xl mx-auto w-full">
          <button
            onClick={handleFinishEarly}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Terminer
          </button>
          <span className="text-white/80 text-sm font-medium">{exercise.name_fr}</span>
          <div className="w-16" />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">
          {/* Timer ring */}
          <div className="relative">
            <ProgressRing progress={progress} size={200} stroke={12} color="#C4A882" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold font-mono text-beige-100">{mins}:{secs}</span>
              <span className="text-white/60 text-xs mt-1">restantes</span>
            </div>
          </div>

          {/* Current instruction */}
          <div className="max-w-sm text-center space-y-2">
            <p className="text-white/50 text-xs uppercase tracking-widest">Étape {currentInstruction + 1}</p>
            <p className="text-white text-lg leading-relaxed font-medium">
              {exercise.instructions_fr[currentInstruction]}
            </p>
          </div>

          {/* All steps mini */}
          <div className="flex gap-1.5">
            {exercise.instructions_fr.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i <= currentInstruction ? "bg-copper-400 w-6" : "bg-white/20 w-3"
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 mt-4 w-full max-w-sm">
            {/* Une séance thérapeutique doit pouvoir s'interrompre : une quinte
                de toux, un enfant qui appelle. Sans pause, le patient n'avait
                que le choix d'abandonner. */}
            <button
              onClick={togglePause}
              className="w-full px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-semibold text-sm transition-colors"
            >
              {paused ? "▶︎ Reprendre" : "⏸ Mettre en pause"}
            </button>
            <button
              onClick={handleFinishEarly}
              className="w-full px-8 py-3 bg-beige-200 hover:bg-beige-100 rounded-2xl text-forest-800 font-semibold text-sm transition-colors"
            >
              {exercise.requiresInput ? "J'ai terminé, noter mon score →" : "Séance terminée →"}
            </button>
          </div>

          {paused && (
            <p className="text-white/70 text-sm text-center max-w-xs">
              Séance en pause. Prenez le temps qu&apos;il vous faut, le chronomètre vous attend.
            </p>
          )}
        </main>
      </div>
    );
  }

  // ── INPUT (requiresInput exercises) ─────────────────────────────────────────
  if (phase === "input") {
    return (
      <div className="min-h-screen bg-beige-200 flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-8 max-w-md mx-auto w-full">
          <div className="text-6xl">{exercise.emoji}</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-forest-800 mb-2">Votre score</h2>
            <p className="text-forest-500 text-sm">
              {exercise.inputLabel || "Entrez votre résultat"}
            </p>
          </div>

          <div className="w-full">
            <div className="bg-beige-100 rounded-2xl border border-beige-300 p-6 flex items-center gap-4">
              <input
                type="number"
                inputMode="numeric"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0"
                className="flex-1 text-5xl font-bold text-forest-800 bg-transparent outline-none text-center"
                autoFocus
              />
              {exercise.inputUnit && (
                <span className="text-forest-400 text-lg font-medium flex-shrink-0">
                  {exercise.inputUnit}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setPhase("rating")}
            disabled={!inputValue}
            className="w-full py-4 bg-forest-600 hover:bg-forest-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-colors"
          >
            Continuer →
          </button>
        </main>
      </div>
    );
  }

  // ── RATING ───────────────────────────────────────────────────────────────────
  if (phase === "rating") {
    return (
      <div className="min-h-screen bg-beige-200 flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-8 max-w-md mx-auto w-full">
          <div className="text-6xl">🎉</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-forest-800 mb-2">Séance terminée !</h2>
            <p className="text-forest-500 text-sm">Comment s'est passée cette séance ?</p>
          </div>

          {/* Stars */}
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setStars(star)}
                className="text-4xl transition-transform hover:scale-110 active:scale-95"
                style={{ filter: star <= stars ? "none" : "grayscale(1) opacity(0.4)" }}
              >
                ⭐
              </button>
            ))}
          </div>
          {stars > 0 && (
            <p className="text-sm text-forest-500 -mt-4">{COMFORT_LABELS[stars]}</p>
          )}

          {saveError && (
            <div
              role="alert"
              className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {saveError}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-forest-600 hover:bg-forest-700 disabled:opacity-60 text-white font-bold text-lg rounded-2xl transition-colors"
          >
            {saving ? "Enregistrement…" : saveError ? "Réessayer" : "Valider la séance ✓"}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm text-forest-400 hover:text-forest-600 transition-colors disabled:opacity-50"
          >
            Passer sans noter
          </button>
        </main>
      </div>
    );
  }

  // ── DONE ─────────────────────────────────────────────────────────────────────
  const doneMinutes = Math.max(1, Math.round(Math.max(elapsed, exercise.duration_seconds) / 60));
  const scoreLabel = stars > 0 ? COMFORT_LABELS[stars] : null;

  return (
    <div className="min-h-screen bg-beige-200 flex flex-col items-center justify-center px-6 gap-6 text-center">
      {/* Confetti-style emoji burst */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <span className="absolute text-4xl animate-ping opacity-30">🎉</span>
        <span className="text-6xl relative z-10">✅</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-forest-800">Bravo !</h2>
        <p className="text-forest-500 text-sm mt-1">Séance enregistrée avec succès</p>
      </div>

      {/* Résumé */}
      <div className="w-full max-w-xs bg-beige-100 rounded-2xl border border-beige-300 p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-forest-500">Exercice</span>
          <span className="font-semibold text-forest-800">{exercise.emoji} {exercise.name_fr}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-forest-500">Durée</span>
          <span className="font-semibold text-forest-800">{doneMinutes} min</span>
        </div>
        {stars > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-forest-500">Ressenti</span>
            <span className="font-semibold text-copper-700">{"⭐".repeat(stars)} {scoreLabel}</span>
          </div>
        )}
        {inputValue && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-forest-500">{exercise.inputLabel}</span>
            <span className="font-semibold text-forest-800">{inputValue} {exercise.inputUnit}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-forest-400 animate-pulse">Retour aux exercices…</p>
    </div>
  );
}
