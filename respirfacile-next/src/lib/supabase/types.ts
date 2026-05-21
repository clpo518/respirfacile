// ============================================================
// RESPIRFACILE — Types Supabase manuels
// ============================================================
// À régénérer en prod avec : supabase gen types typescript > src/lib/supabase/types.ts

export type UserRole = 'patient' | 'therapist' | 'admin' | 'solo_patient' | 'kine';
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'past_due' | 'incomplete';
export type SubscriptionTier = 'starter' | 'pro' | 'cabinet';
export type PatientProfileType = 'adult_saos_mild' | 'adult_saos_severe' | 'adult_tmof' | 'adult_mixed' | 'child_7_12' | 'child_2_6';
export type BadgeId = 'first_session' | 'week_1' | 'pause_20' | 'pause_25' | 'nasale_master' | 'coherence_30' | 'month_1';
export type TherapistPatientStatus = 'active' | 'inactive' | 'archived';
export type ExerciseCategory = 'pause_controlee' | 'coherence_cardiaque' | 'respiration_nasale' | 'myofonctionnel' | 'diaphragmatique' | 'relaxation';

// ============================================================
// TABLE: profiles
// ============================================================
export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  therapist_code: string | null;
  specialty: string | null;
  subscription_status: SubscriptionStatus | null;
  subscription_tier: SubscriptionTier | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  patient_profile: PatientProfileType | null;
  uses_cpap: boolean;
  age: number | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// TABLE: therapist_patients
// ============================================================
export interface TherapistPatient {
  id: string;
  therapist_id: string;
  patient_id: string;
  status: TherapistPatientStatus;
  created_at: string;
}

// ============================================================
// TABLE: sessions
// ============================================================
export interface Session {
  id: string;
  user_id: string;
  therapist_id: string | null;
  exercise_id: string;
  exercise_category: ExerciseCategory | null;
  duration_seconds: number | null;
  metrics: Record<string, unknown>;
  score: number | null;
  score_unit: string;
  comfort_level: number | null;
  notes: string | null;
  completed: boolean;
  created_at: string;
}

// ============================================================
// TABLE: patient_programs
// ============================================================
export interface PatientProgram {
  id: string;
  patient_id: string;
  therapist_id: string | null;
  profile_type: PatientProfileType | null;
  week_number: number;
  current_exercise_index: number;
  jokers_used: number;
  jokers_reset_at: string | null;
  is_active: boolean;
  objectives: string[] | null;
  availability: string[] | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// TABLE: user_badges
// ============================================================
export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: BadgeId;
  earned_at: string;
}

// ============================================================
// TABLE: journal_entries
// ============================================================
export interface JournalEntry {
  id: string;
  user_id: string;
  week_number: number | null;
  wellbeing_score: number | null;
  sleep_score: number | null;
  sleep_improvements: string[];
  sessions_done: number | null;
  exercise_difficulty: 'Trop faciles' | 'Bien adaptés' | 'Trop difficiles' | null;
  motivation_issue: 'Oui' | 'Non' | 'Parfois' | null;
  free_text: string | null;
  proud_moment: string | null;
  nasal_score: number | null;
  anxiety_level: 'Non' | 'Un peu' | 'Oui' | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// TABLE: journal_therapist_notes
// ============================================================
export interface JournalTherapistNote {
  id: string;
  journal_entry_id: string;
  therapist_id: string;
  note_text: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// TABLE: session_notes
// ============================================================
export interface SessionNote {
  id: string;
  therapist_id: string;
  patient_id: string;
  content: string;
  is_visible_to_patient: boolean;
  created_at: string;
}

// ============================================================
// TABLE: parental_consents
// ============================================================
export interface ParentalConsent {
  id: string;
  patient_id: string | null;
  guardian_email: string;
  guardian_name: string;
  consent_given: boolean;
  consent_given_at: string | null;
  token: string;
  created_at: string;
}

// ============================================================
// TABLE: email_logs
// ============================================================
export interface EmailLog {
  id: string;
  user_id: string | null;
  email_type: string;
  recipient_email: string;
  status: 'sent' | 'failed' | 'pending';
  metadata: Record<string, unknown>;
  sent_at: string;
}

// ============================================================
// TYPE HELPERS
// ============================================================

export type ProfileWithPatients = Profile & {
  therapist_patients?: TherapistPatient[];
};

export type SessionWithProfile = Session & {
  profiles?: Pick<Profile, 'full_name' | 'email'>;
};

export type JournalEntryWithNotes = JournalEntry & {
  journal_therapist_notes?: JournalTherapistNote[];
};
