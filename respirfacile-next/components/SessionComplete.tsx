"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EXERCISES } from "@/lib/data/exercises";
import confetti from "canvas-confetti";

interface SessionCompleteProps {
  exerciseId: string;
  score: number | null;
  previousScore: number | null;
  duration: number;
}

const BADGE_NAMES: Record<string, string> = {
  first_session: "Premier souffle",
  week_1: "Semaine 1",
  pause_20: "Pause 20s",
  pause_25: "Pause 25s",
  nasale_master: "Nez libre",
  coherence_30: "Rythme parfait",
  month_1: "1 mois",
};

export default function SessionComplete({
  exerciseId,
  score,
  previousScore,
  duration,
}: SessionCompleteProps) {
  const router = useRouter();
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [nextExercise, setNextExercise] = useState<(typeof EXERCISES)[0] | null>(null);
  const [sessionsThisWeek, setSessionsThisWeek] = useState<number>(0);
  const [visible, setVisible] = useState(false);

  const improvement =
    score != null && previousScore != null ? score - previousScore : null;

  const currentExercise = EXERCISES.find((e) => e.id === exerciseId);

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setVisible(true), 50);

    // Confetti si bonne progression
    if (score && (improvement === null || improvement >= 0)) {
      setTimeout(() => {
        confetti({
          particleCount: improvement && improvement > 2 ? 120 : 60,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#2D5016', '#a8c87a', '#8B4513', '#f5f0e8', '#c8e0a0'],
        });
      }, 300);
    }

    // Badges + stats
    const loadData = async () => {
      const supabase = createClient();

      // Badges
      try {
        const res = await fetch("/api/check-badges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exerciseId, score }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.new_badges?.length > 0) setNewBadges(data.new_badges);
        }
      } catch {}

      // Sessions cette semaine
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const { count } = await supabase
          .from('sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', weekStart.toISOString());
        setSessionsThisWeek(count || 0);

        // Prochain exercice prescrit non-fait aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: prescriptions } = await supabase
          .from('prescriptions')
          .select('exercise_id')
          .eq('patient_id', user.id)
          .eq('is_active', true)
          .neq('exercise_id', exerciseId);

        if (prescriptions?.length) {
          const { data: doneSessions } = await supabase
            .from('sessions')
            .select('exercise_id')
            .eq('user_id', user.id)
            .gte('created_at', today.toISOString());

          const doneIds = new Set((doneSessions || []).map((s: any) => s.exercise_id));
          const pending = prescriptions.find((p: any) => !doneIds.has(p.exercise_id));
          if (pending) {
            const ex = EXERCISES.find((e) => e.id === pending.exercise_id);
            if (ex) setNextExercise(ex);
          }
        }
      }
    };

    loadData();
  }, [exerciseId, score, improvement]);

  const getMainMessage = () => {
    if (newBadges.length > 0) return { emoji: "🏅", text: "Badge débloqué !" };
    if (improvement !== null && improvement > 3) return { emoji: "🚀", text: `+${improvement} pas !` };
    if (improvement !== null && improvement > 0) return { emoji: "📈", text: `Progression !" ` };
    if (score !== null && score >= 25) return { emoji: "🏆", text: "Score parfait !" };
    if (score !== null && score >= 20) return { emoji: "💪", text: "Excellent score !" };
    return { emoji: "🎉", text: "Séance terminée !" };
  };

  const mainMsg = getMainMessage();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-900/60 backdrop-blur-sm"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
        style={{
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header coloré */}
        <div className="bg-gradient-to-br from-forest-700 to-forest-600 px-6 pt-8 pb-6 text-center">
          <div className="text-5xl mb-3">{mainMsg.emoji}</div>
          <h2 className="text-white text-2xl font-bold mb-1">{mainMsg.text}</h2>
          <p className="text-forest-200 text-sm">{currentExercise?.name_fr}</p>
        </div>

        {/* Stats */}
        <div className="px-6 py-5">

          {/* Score si applicable */}
          {score !== null && (
            <div className="flex items-center justify-center gap-6 mb-5 py-4 bg-beige-50 rounded-2xl border border-beige-200">
              <div className="text-center">
                <p className="text-3xl font-bold text-forest-800">{score}</p>
                <p className="text-xs text-forest-400 mt-0.5">pas aujourd'hui</p>
              </div>
              {previousScore !== null && (
                <>
                  <div className="text-forest-300 text-2xl">→</div>
                  <div className="text-center">
                    <p className={`text-xl font-bold ${improvement !== null && improvement > 0 ? 'text-green-600' : improvement !== null && improvement < 0 ? 'text-red-500' : 'text-forest-400'}`}>
                      {improvement !== null && improvement > 0 ? `+${improvement}` : improvement !== null && improvement < 0 ? `${improvement}` : '='}
                    </p>
                    <p className="text-xs text-forest-400 mt-0.5">vs dernière fois</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Durée + séances semaine */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 text-center bg-beige-50 rounded-2xl py-3 border border-beige-200">
              <p className="font-bold text-forest-800">{Math.round(duration / 60)} min</p>
              <p className="text-xs text-forest-400">durée</p>
            </div>
            <div className="flex-1 text-center bg-beige-50 rounded-2xl py-3 border border-beige-200">
              <p className="font-bold text-forest-800">{sessionsThisWeek}</p>
              <p className="text-xs text-forest-400">séances cette sem.</p>
            </div>
          </div>

          {/* Badges débloqués */}
          {newBadges.length > 0 && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
              <p className="text-sm font-semibold text-amber-800">
                🏅 {BADGE_NAMES[newBadges[0]] || newBadges[0]}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">Ajouté à votre collection !</p>
            </div>
          )}

          {/* Prochain exercice */}
          {nextExercise && (
            <div className="mb-5 bg-forest-50 border border-forest-200 rounded-2xl px-4 py-3">
              <p className="text-xs text-forest-500 mb-1 font-medium uppercase tracking-wide">Prochain exercice</p>
              <div className="flex items-center gap-2">
                <span className="text-xl">{nextExercise.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-forest-800">{nextExercise.name_fr}</p>
                  <p className="text-xs text-forest-500">{Math.floor(nextExercise.duration_seconds / 60)} min</p>
                </div>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            {nextExercise ? (
              <button
                onClick={() => router.push(`/session/${nextExercise.id}`)}
                className="w-full py-3.5 bg-forest-600 hover:bg-forest-700 text-white font-semibold rounded-2xl transition-colors"
              >
                Enchaîner {nextExercise.emoji} →
              </button>
            ) : null}
            <button
              onClick={() => router.push('/dashboard?celebration=1')}
              className={`w-full py-3.5 font-semibold rounded-2xl transition-colors ${
                nextExercise
                  ? 'bg-beige-100 hover:bg-beige-200 text-forest-700 border border-beige-300'
                  : 'bg-forest-600 hover:bg-forest-700 text-white'
              }`}
            >
              {nextExercise ? 'Retour au tableau de bord' : 'Retour au tableau de bord 🏠'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
