"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface MoodRingProps {
  compact?: boolean;
  userId?: string;
}

const MOODS = [
  { emoji: '😢', label: 'Très mal', value: 1 },
  { emoji: '😔', label: 'Pas bien', value: 2 },
  { emoji: '😐', label: 'Moyen', value: 3 },
  { emoji: '🙂', label: 'Bien', value: 4 },
  { emoji: '😄', label: 'Très bien', value: 5 },
];

export function MoodRing({ compact, userId }: MoodRingProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [alreadyLoggedToday, setAlreadyLoggedToday] = useState(false);
  const [todayMood, setTodayMood] = useState<number | null>(null);

  // Vérifier si l'humeur a déjà été enregistrée aujourd'hui
  useEffect(() => {
    if (!userId) return;
    const check = async () => {
      const supabase = createClient();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("mood_logs")
        .select("mood_score")
        .eq("user_id", userId)
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        setAlreadyLoggedToday(true);
        setTodayMood(data[0].mood_score);
      }
    };
    check();
  }, [userId]);

  const handleSelect = async (value: number) => {
    setSelected(value);
    if (!userId) return;
    try {
      const supabase = createClient();
      await supabase.from("mood_logs").insert({
        user_id: userId,
        mood_score: value,
        created_at: new Date().toISOString(),
      });
      setSaved(true);
    } catch (_) {
      setSaved(true);
    }
  };

  const moodLabel = (score: number) => MOODS.find(m => m.value === score)?.label ?? '';
  const moodEmoji = (score: number) => MOODS.find(m => m.value === score)?.emoji ?? '';

  // Déjà loggé aujourd'hui
  if (alreadyLoggedToday && todayMood !== null) {
    return (
      <div className={`bg-beige-50 border border-beige-300 rounded-2xl ${compact ? 'p-4' : 'p-6'} text-center`}>
        <p className="text-sm text-forest-600">
          Aujourd&apos;hui vous vous sentez <span className="font-semibold">{moodEmoji(todayMood)} {moodLabel(todayMood)}</span>
        </p>
        <p className="text-xs text-forest-400 mt-1">Votre humeur est suivie jour après jour pour mesurer l&apos;effet des séances.</p>
      </div>
    );
  }

  return (
    <div className={`bg-beige-50 border border-beige-300 rounded-2xl ${compact ? 'p-4' : 'p-6'} text-center`}>
      {saved ? (
        <div className="py-1">
          <p className="text-sm font-medium text-forest-700">
            ✓ Noté. Votre humeur est suivie pour situer l&apos;effet de vos séances sur votre bien-être.
          </p>
          <p className="text-xs text-forest-400 mt-1">
            Votre praticien peut aussi consulter cette évolution pour ajuster votre programme.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-forest-700 mb-0.5">Comment vous sentez-vous aujourd&apos;hui ?</p>
          <p className="text-xs text-forest-400 mb-3">
            Votre humeur des jours de séance est comparée à celle des autres jours : c&apos;est ce qui donne du sens à la courbe.
          </p>
          <div className="flex justify-center gap-3">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleSelect(mood.value)}
                title={mood.label}
                className={`text-2xl hover:scale-125 transition-all duration-150 rounded-full p-1 ${
                  selected === mood.value ? 'ring-2 ring-forest-500 scale-125' : ''
                }`}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
