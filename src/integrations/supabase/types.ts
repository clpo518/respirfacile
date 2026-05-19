// ============================================================
// Types Supabase générés manuellement pour respirfacile
// À régénérer avec : supabase gen types typescript --local > src/integrations/supabase/types.ts
// après avoir appliqué les migrations sur un projet Supabase local ou distant.
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Enums ────────────────────────────────────────────────────

export type UserRole = "patient" | "therapist" | "kine" | "admin" | "solo_patient"
export type SubscriptionStatus = "trialing" | "active" | "canceled" | "past_due" | "incomplete"
export type SubscriptionTier = "starter" | "pro" | "cabinet"
export type PatientProfileType =
  | "adult_saos_mild"
  | "adult_saos_severe"
  | "adult_tmof"
  | "adult_mixed"
  | "child_7_12"
  | "child_2_6"

// ── Database ──────────────────────────────────────────────────

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: UserRole
          therapist_code: string | null
          profession_rpps: string | null
          subscription_status: SubscriptionStatus | null
          subscription_tier: SubscriptionTier | null
          trial_ends_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          onboarding_completed: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          role?: UserRole
          therapist_code?: string | null
          profession_rpps?: string | null
          subscription_status?: SubscriptionStatus | null
          subscription_tier?: SubscriptionTier | null
          trial_ends_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          onboarding_completed?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          role?: UserRole
          therapist_code?: string | null
          profession_rpps?: string | null
          subscription_status?: SubscriptionStatus | null
          subscription_tier?: SubscriptionTier | null
          trial_ends_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          onboarding_completed?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      therapist_patients: {
        Row: {
          id: string
          therapist_id: string
          patient_id: string
          status: "active" | "inactive" | "pending"
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          therapist_id: string
          patient_id: string
          status?: "active" | "inactive" | "pending"
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          therapist_id?: string
          patient_id?: string
          status?: "active" | "inactive" | "pending"
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_patients_therapist_id_fkey"
            columns: ["therapist_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_patients_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      patient_programs: {
        Row: {
          id: string
          patient_id: string
          therapist_id: string | null
          profile_type: PatientProfileType
          week_number: number
          jokers_used: number
          jokers_reset_at: string | null
          is_active: boolean
          custom_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          therapist_id?: string | null
          profile_type: PatientProfileType
          week_number?: number
          jokers_used?: number
          jokers_reset_at?: string | null
          is_active?: boolean
          custom_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          therapist_id?: string | null
          profile_type?: PatientProfileType
          week_number?: number
          jokers_used?: number
          jokers_reset_at?: string | null
          is_active?: boolean
          custom_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_programs_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_programs_therapist_id_fkey"
            columns: ["therapist_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          therapist_id: string | null
          program_id: string | null
          exercise_id: string
          exercise_category: string | null
          duration_seconds: number
          completed: boolean
          score: number | null
          metrics: Json
          recording_url: string | null
          recording_shared_until: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          therapist_id?: string | null
          program_id?: string | null
          exercise_id: string
          exercise_category?: string | null
          duration_seconds?: number
          completed?: boolean
          score?: number | null
          metrics?: Json
          recording_url?: string | null
          recording_shared_until?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          therapist_id?: string | null
          program_id?: string | null
          exercise_id?: string
          exercise_category?: string | null
          duration_seconds?: number
          completed?: boolean
          score?: number | null
          metrics?: Json
          recording_url?: string | null
          recording_shared_until?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      parental_consents: {
        Row: {
          id: string
          patient_id: string
          guardian_email: string
          guardian_name: string
          consent_given: boolean
          consent_given_at: string | null
          token: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          guardian_email: string
          guardian_name: string
          consent_given?: boolean
          consent_given_at?: string | null
          token?: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          guardian_email?: string
          guardian_name?: string
          consent_given?: boolean
          consent_given_at?: string | null
          token?: string
          expires_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parental_consents_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      email_logs: {
        Row: {
          id: string
          user_id: string | null
          email_type: string
          recipient_email: string
          metadata: Json
          status: string
          sent_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email_type: string
          recipient_email: string
          metadata?: Json
          status?: string
          sent_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email_type?: string
          recipient_email?: string
          metadata?: Json
          status?: string
          sent_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_weekly_jokers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_therapist_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      user_role: UserRole
      subscription_status_type: SubscriptionStatus
      subscription_tier_type: SubscriptionTier
      patient_profile_type: PatientProfileType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ── Helper types ──────────────────────────────────────────────

type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

export type ProfileRow           = Tables<"profiles">
export type TherapistPatientRow  = Tables<"therapist_patients">
export type PatientProgramRow    = Tables<"patient_programs">
export type SessionRow           = Tables<"sessions">
export type UserBadgeRow         = Tables<"user_badges">
export type ParentalConsentRow   = Tables<"parental_consents">
export type EmailLogRow          = Tables<"email_logs">

export type SessionInsert        = TablesInsert<"sessions">
export type PatientProgramInsert = TablesInsert<"patient_programs">
