// ============================================================
// RESPIRFACILE — Types Supabase manuels
// Régénérer avec: supabase gen types typescript --local > lib/supabase/types.ts
// ============================================================

export type UserRole = 'patient' | 'therapist' | 'admin' | 'solo_patient' | 'kine'
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'past_due' | 'incomplete'
export type SubscriptionTier = 'starter' | 'pro' | 'cabinet'
export type PatientProfileType =
  | 'adult_saos_mild'
  | 'adult_saos_severe'
  | 'adult_tmof'
  | 'adult_mixed'
  | 'child_7_12'
  | 'child_2_6'

// ------------------------------------------------------------------
// profiles
// ------------------------------------------------------------------
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: UserRole
  therapist_code: string | null
  specialty: string | null
  subscription_status: SubscriptionStatus
  subscription_tier: SubscriptionTier | null
  trial_ends_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  max_patients: number
  created_at: string
  updated_at: string
}

// ------------------------------------------------------------------
// therapist_patients
// ------------------------------------------------------------------
export interface TherapistPatient {
  id: string
  therapist_id: string
  patient_id: string
  status: 'active' | 'inactive' | 'discharged'
  notes: string | null
  created_at: string
}

// ------------------------------------------------------------------
// sessions
// ------------------------------------------------------------------
export interface Session {
  id: string
  user_id: string
  therapist_id: string | null
  exercise_id: string
  exercise_category: string | null
  duration_seconds: number | null
  metrics: Record<string, unknown> | null
  score: number | null
  notes: string | null
  completed: boolean
  created_at: string
}

// ------------------------------------------------------------------
// patient_programs
// ------------------------------------------------------------------
export interface PatientProgram {
  id: string
  patient_id: string
  therapist_id: string | null
  profile_type: PatientProfileType
  week_number: number
  jokers_used: number
  jokers_reset_at: string | null
  is_active: boolean
  created_at: string
}

// ------------------------------------------------------------------
// user_badges
// ------------------------------------------------------------------
export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

// ------------------------------------------------------------------
// session_notes
// ------------------------------------------------------------------
export interface SessionNote {
  id: string
  session_id: string
  therapist_id: string
  patient_id: string
  content: string
  created_at: string
}

// ------------------------------------------------------------------
// journal_entries
// ------------------------------------------------------------------
export interface JournalEntry {
  id: string
  patient_id: string
  therapist_id: string | null
  week_number: number
  // Bien-être
  wellbeing_score: number | null
  // Sommeil
  sleep_score: number | null
  sleep_less_snoring: boolean
  sleep_fewer_wakeups: boolean
  // Séances
  sessions_done: number
  session_difficulty: 'too_easy' | 'just_right' | 'too_hard' | null
  session_motivation: number | null
  // Texte libre
  free_text: string | null
  proud_moment: string | null
  // Respiration
  nasal_breathing_score: number | null
  anxiety_level: 'Non' | 'Un peu' | 'Oui' | null
  // Meta
  created_at: string
  updated_at: string
}

// ------------------------------------------------------------------
// email_logs
// ------------------------------------------------------------------
export interface EmailLog {
  id: string
  user_id: string | null
  email_type: string
  recipient_email: string
  sent_at: string
  status: 'sent' | 'failed' | 'bounced'
}

// ------------------------------------------------------------------
// parental_consents
// ------------------------------------------------------------------
export interface ParentalConsent {
  id: string
  patient_id: string
  guardian_email: string
  guardian_name: string
  consent_given: boolean
  consent_given_at: string | null
  token: string
  created_at: string
}

// ------------------------------------------------------------------
// Helper types
// ------------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      therapist_patients: { Row: TherapistPatient; Insert: Partial<TherapistPatient>; Update: Partial<TherapistPatient> }
      sessions: { Row: Session; Insert: Partial<Session>; Update: Partial<Session> }
      patient_programs: { Row: PatientProgram; Insert: Partial<PatientProgram>; Update: Partial<PatientProgram> }
      user_badges: { Row: UserBadge; Insert: Partial<UserBadge>; Update: Partial<UserBadge> }
      session_notes: { Row: SessionNote; Insert: Partial<SessionNote>; Update: Partial<SessionNote> }
      journal_entries: { Row: JournalEntry; Insert: Partial<JournalEntry>; Update: Partial<JournalEntry> }
      email_logs: { Row: EmailLog; Insert: Partial<EmailLog>; Update: Partial<EmailLog> }
      parental_consents: { Row: ParentalConsent; Insert: Partial<ParentalConsent>; Update: Partial<ParentalConsent> }
    }
  }
}
