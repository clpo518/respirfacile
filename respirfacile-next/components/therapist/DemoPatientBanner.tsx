'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Données fictives du patient démo
const DEMO_PATIENT = {
  full_name: 'Marie Dupont (démo)',
  email: 'demo@respirfacile.fr',
  profile_type: 'adult_saos_mild',
};

const DEMO_SESSIONS = [
  { exercise_id: 'pause_controlee_decouverte', score: 12, duration_seconds: 280, metrics: { pause_steps: 12 }, days_ago: 0 },
  { exercise_id: 'coherence_5_5', score: null, duration_seconds: 310, metrics: { cycles_completed: 5 }, days_ago: 1 },
  { exercise_id: 'pause_controlee_decouverte', score: 15, duration_seconds: 290, metrics: { pause_steps: 15 }, days_ago: 2 },
  { exercise_id: 'nasale_guerrier', score: null, duration_seconds: 185, metrics: { duration_nasal_only: 185 }, days_ago: 3 },
  { exercise_id: 'coherence_5_5', score: null, duration_seconds: 305, metrics: { cycles_completed: 5 }, days_ago: 4 },
  { exercise_id: 'pause_20', score: 20, duration_seconds: 420, metrics: { pause_duration: 20, comfort_level: 3 }, days_ago: 5 },
  { exercise_id: 'pause_controlee_decouverte', score: 18, duration_seconds: 295, metrics: { pause_steps: 18 }, days_ago: 6 },
  { exercise_id: 'langue_palais', score: null, duration_seconds: 122, metrics: { hold_duration: 122 }, days_ago: 7 },
  { exercise_id: 'coherence_5_5', score: null, duration_seconds: 308, metrics: { cycles_completed: 5 }, days_ago: 8 },
  { exercise_id: 'pause_20', score: 22, duration_seconds: 425, metrics: { pause_duration: 22, comfort_level: 4 }, days_ago: 10 },
  { exercise_id: 'nasale_guerrier', score: null, duration_seconds: 180, metrics: { duration_nasal_only: 180 }, days_ago: 12 },
  { exercise_id: 'coherence_5_5', score: null, duration_seconds: 300, metrics: { cycles_completed: 5 }, days_ago: 13 },
];

const DEMO_PRESCRIPTIONS = [
  { exercise_id: 'pause_controlee_decouverte', frequency_per_day: 1, frequency_label: '1× par jour', notes: 'Commencez doucement, notez votre score.' },
  { exercise_id: 'coherence_5_5', frequency_per_day: 2, frequency_label: '2× par jour', notes: null },
  { exercise_id: 'nasale_guerrier', frequency_per_day: 1, frequency_label: '1× par jour', notes: null },
];

export function DemoPatientBanner({ therapistId }: { therapistId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const createDemo = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Créer un profil patient fictif avec un UUID déterministe basé sur le therapistId
      // On utilise une email unique par ortho pour éviter les doublons
      const demoEmail = `demo-${therapistId.slice(0, 8)}@respirfacile-demo.fr`;

      // Vérifier si le patient démo existe déjà
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', demoEmail)
        .maybeSingle();

      let patientId: string;

      if (existing?.id) {
        patientId = existing.id;
      } else {
        // Créer via l'API de création de patient (insert direct dans profiles n'est possible qu'avec service_role)
        // On utilise une edge function ou on crée via la route API
        const res = await fetch('/api/demo/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ therapist_id: therapistId, demo_email: demoEmail }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        patientId = data.patient_id;
      }

      setDone(true);
      setTimeout(() => router.push(`/therapist/patients/${patientId}`), 800);
    } catch (err) {
      console.error('Demo creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-8">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-green-800 font-medium text-sm">Patient de démonstration créé. Redirection en cours…</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-copper-50 border border-amber-200 rounded-3xl px-6 py-5 mb-8 flex items-center gap-5">
      <div className="flex-shrink-0 text-3xl">🧪</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-900 text-sm mb-0.5">Essayez avec un patient de démonstration</p>
        <p className="text-amber-700 text-xs leading-relaxed">
          Voyez à quoi ressemble le suivi d'un patient avec 2 semaines d'exercices, des progressions réelles et un programme prescrit.
        </p>
      </div>
      <button
        onClick={createDemo}
        disabled={loading}
        className="flex-shrink-0 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white text-sm font-semibold rounded-2xl transition-colors whitespace-nowrap"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Création…
          </span>
        ) : (
          'Voir la démo →'
        )}
      </button>
    </div>
  );
}
