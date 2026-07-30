import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

const DEMO_SESSIONS = [
  { exercise_id: 'pause_controlee_decouverte', exercise_category: 'pause_controlee', score: 12, duration_seconds: 280, metrics: { pause_steps: 12 }, completed: true, days_ago: 0 },
  { exercise_id: 'coherence_5_5', exercise_category: 'coherence_cardiaque', score: null, duration_seconds: 310, metrics: { cycles_completed: 5 }, completed: true, days_ago: 1 },
  { exercise_id: 'pause_controlee_decouverte', exercise_category: 'pause_controlee', score: 15, duration_seconds: 290, metrics: { pause_steps: 15 }, completed: true, days_ago: 2 },
  { exercise_id: 'nasale_guerrier', exercise_category: 'respiration_nasale', score: null, duration_seconds: 185, metrics: { duration_nasal_only: 185 }, completed: true, days_ago: 3 },
  { exercise_id: 'coherence_5_5', exercise_category: 'coherence_cardiaque', score: null, duration_seconds: 305, metrics: { cycles_completed: 5 }, completed: true, days_ago: 4 },
  { exercise_id: 'pause_20', exercise_category: 'pause_controlee', score: 20, duration_seconds: 420, metrics: { pause_duration: 20, comfort_level: 3 }, completed: true, days_ago: 5 },
  { exercise_id: 'pause_controlee_decouverte', exercise_category: 'pause_controlee', score: 18, duration_seconds: 295, metrics: { pause_steps: 18 }, completed: true, days_ago: 6 },
  { exercise_id: 'langue_palais', exercise_category: 'myofonctionnel', score: null, duration_seconds: 122, metrics: { hold_duration: 122 }, completed: true, days_ago: 7 },
  { exercise_id: 'coherence_5_5', exercise_category: 'coherence_cardiaque', score: null, duration_seconds: 308, metrics: { cycles_completed: 5 }, completed: true, days_ago: 8 },
  { exercise_id: 'pause_20', exercise_category: 'pause_controlee', score: 22, duration_seconds: 425, metrics: { pause_duration: 22, comfort_level: 4 }, completed: true, days_ago: 10 },
  { exercise_id: 'nasale_guerrier', exercise_category: 'respiration_nasale', score: null, duration_seconds: 180, metrics: { duration_nasal_only: 180 }, completed: true, days_ago: 12 },
  { exercise_id: 'coherence_5_5', exercise_category: 'coherence_cardiaque', score: null, duration_seconds: 300, metrics: { cycles_completed: 5 }, completed: true, days_ago: 13 },
];

const DEMO_PRESCRIPTIONS = [
  { exercise_id: 'pause_controlee_decouverte', frequency_per_day: 1, frequency_label: '1× par jour', notes: 'Commencez doucement, notez votre score à chaque séance.' },
  { exercise_id: 'coherence_5_5', frequency_per_day: 2, frequency_label: '2× par jour', notes: null },
  { exercise_id: 'nasale_guerrier', frequency_per_day: 1, frequency_label: '1× par jour', notes: null },
];

const DEMO_MESSAGE = "Bravo Marie, vos scores progressent bien ! Continuez la cohérence cardiaque 2× par jour, c'est vraiment ce qui fait la différence sur la qualité du sommeil. On voit ensemble les résultats à la prochaine séance. 🌿";

function daysAgoToISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(9, 30, 0, 0);
  return d.toISOString();
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { therapist_id, demo_email } = await req.json();
  if (therapist_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Admin client pour créer des utilisateurs (nécessite SUPABASE_SERVICE_ROLE_KEY)
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Vérifier si le patient démo existe déjà
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', demo_email)
    .maybeSingle();

  if (existingProfile?.id) {
    return NextResponse.json({ patient_id: existingProfile.id });
  }

  // Créer un utilisateur fictif (sans vrai compte auth, on insère directement dans profiles)
  // On génère un UUID stable basé sur l'email
  const digest = createHash('sha256').update(demo_email).digest('hex');
  const patientId = [
    digest.slice(0, 8),
    digest.slice(8, 12),
    `4${digest.slice(13, 16)}`,
    digest.slice(16, 20),
    digest.slice(20, 32),
  ].join('-');

  // Créer le profil patient démo
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: patientId,
      email: demo_email,
      full_name: 'Marie Dupont',
      role: 'patient',
      profile_type: 'adult_saos_mild',
    });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Lier le patient à l'ortho
  await supabaseAdmin
    .from('therapist_patients')
    .upsert({ therapist_id, patient_id: patientId, status: 'active' });

  // Insérer les séances fictives
  const sessionsToInsert = DEMO_SESSIONS.map(s => ({
    user_id: patientId,
    therapist_id,
    exercise_id: s.exercise_id,
    exercise_category: s.exercise_category,
    score: s.score,
    duration_seconds: s.duration_seconds,
    metrics: s.metrics,
    completed: true,
    created_at: daysAgoToISO(s.days_ago),
  }));
  await supabaseAdmin.from('sessions').insert(sessionsToInsert);

  // Insérer les prescriptions
  const prescriptionsToInsert = DEMO_PRESCRIPTIONS.map(p => ({
    therapist_id,
    patient_id: patientId,
    exercise_id: p.exercise_id,
    frequency_per_day: p.frequency_per_day,
    frequency_label: p.frequency_label,
    notes: p.notes,
    is_active: true,
  }));
  await supabaseAdmin.from('prescriptions').insert(prescriptionsToInsert);

  // Insérer un message de l'ortho
  await supabaseAdmin.from('messages').insert({
    therapist_id,
    patient_id: patientId,
    content: DEMO_MESSAGE,
    sender_role: 'therapist',
    created_at: daysAgoToISO(1),
  });

  return NextResponse.json({ patient_id: patientId });
}
