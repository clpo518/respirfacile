export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_category: string
          event_data: Json | null
          event_name: string
          id: string
          page_path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_category?: string
          event_data?: Json | null
          event_name: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      assessments: {
        Row: {
          completed_at: string | null
          created_at: string
          guest_birth_year: number | null
          guest_gender: string | null
          guest_name: string | null
          id: string
          patient_id: string | null
          results: Json
          started_at: string
          status: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          guest_birth_year?: number | null
          guest_gender?: string | null
          guest_name?: string | null
          id?: string
          patient_id?: string | null
          results?: Json
          started_at?: string
          status?: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          guest_birth_year?: number | null
          guest_gender?: string | null
          guest_name?: string | null
          id?: string
          patient_id?: string | null
          results?: Json
          started_at?: string
          status?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          completed_at: string | null
          completed_session_id: string | null
          created_at: string
          exercise_category: string
          exercise_id: string | null
          id: string
          message: string | null
          patient_id: string
          status: string
          therapist_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_session_id?: string | null
          created_at?: string
          exercise_category: string
          exercise_id?: string | null
          id?: string
          message?: string | null
          patient_id: string
          status?: string
          therapist_id: string
        }
        Update: {
          completed_at?: string | null
          completed_session_id?: string | null
          created_at?: string
          exercise_category?: string
          exercise_id?: string | null
          id?: string
          message?: string | null
          patient_id?: string
          status?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_completed_session_id_fkey"
            columns: ["completed_session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          is_private: boolean
          patient_id: string
          therapist_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_private?: boolean
          patient_id: string
          therapist_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_private?: boolean
          patient_id?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_progress: {
        Row: {
          exercise_id: string
          id: string
          session_id: string | null
          step_index: number
          user_id: string
          validated_at: string
        }
        Insert: {
          exercise_id: string
          id?: string
          session_id?: string | null
          step_index: number
          user_id: string
          validated_at?: string
        }
        Update: {
          exercise_id?: string
          id?: string
          session_id?: string | null
          step_index?: number
          user_id?: string
          validated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_progress_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          battery_count: number
          birth_year: number | null
          clinical_tags: string[] | null
          created_at: string
          current_journey_step: number
          current_streak: number
          daily_goal: number
          fluency_goal: string | null
          full_name: string | null
          id: string
          is_archived: boolean | null
          is_premium: boolean
          is_therapist: boolean
          last_activity_date: string | null
          last_engagement_email_at: string | null
          linked_therapist_id: string | null
          longest_streak: number
          onboarding_completed_at: string | null
          referral_bonus_months: number | null
          referral_code: string | null
          seats_limit: number | null
          stripe_customer_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
          target_wpm: number | null
          therapist_code: string | null
          today_minutes: number
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
        }
        Insert: {
          battery_count?: number
          birth_year?: number | null
          clinical_tags?: string[] | null
          created_at?: string
          current_journey_step?: number
          current_streak?: number
          daily_goal?: number
          fluency_goal?: string | null
          full_name?: string | null
          id: string
          is_archived?: boolean | null
          is_premium?: boolean
          is_therapist?: boolean
          last_activity_date?: string | null
          last_engagement_email_at?: string | null
          linked_therapist_id?: string | null
          longest_streak?: number
          onboarding_completed_at?: string | null
          referral_bonus_months?: number | null
          referral_code?: string | null
          seats_limit?: number | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          target_wpm?: number | null
          therapist_code?: string | null
          today_minutes?: number
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Update: {
          battery_count?: number
          birth_year?: number | null
          clinical_tags?: string[] | null
          created_at?: string
          current_journey_step?: number
          current_streak?: number
          daily_goal?: number
          fluency_goal?: string | null
          full_name?: string | null
          id?: string
          is_archived?: boolean | null
          is_premium?: boolean
          is_therapist?: boolean
          last_activity_date?: string | null
          last_engagement_email_at?: string | null
          linked_therapist_id?: string | null
          longest_streak?: number
          onboarding_completed_at?: string | null
          referral_bonus_months?: number | null
          referral_code?: string | null
          seats_limit?: number | null
          stripe_customer_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          target_wpm?: number | null
          therapist_code?: string | null
          today_minutes?: number
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_linked_therapist_id_fkey"
            columns: ["linked_therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referred_id: string
          referred_rewarded: boolean
          referrer_id: string
          referrer_rewarded: boolean
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_id: string
          referred_rewarded?: boolean
          referrer_id: string
          referrer_rewarded?: boolean
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referred_id?: string
          referred_rewarded?: boolean
          referrer_id?: string
          referrer_rewarded?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean
          session_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          session_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_comments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          avg_wpm: number
          created_at: string
          duration_seconds: number
          exercise_type: string | null
          id: string
          max_wpm: number
          notes: string | null
          patient_sentiment: string | null
          recording_url: string | null
          target_wpm: number | null
          user_id: string
          word_timestamps: Json | null
          wpm_data: Json | null
        }
        Insert: {
          avg_wpm?: number
          created_at?: string
          duration_seconds?: number
          exercise_type?: string | null
          id?: string
          max_wpm?: number
          notes?: string | null
          patient_sentiment?: string | null
          recording_url?: string | null
          target_wpm?: number | null
          user_id: string
          word_timestamps?: Json | null
          wpm_data?: Json | null
        }
        Update: {
          avg_wpm?: number
          created_at?: string
          duration_seconds?: number
          exercise_type?: string | null
          id?: string
          max_wpm?: number
          notes?: string | null
          patient_sentiment?: string | null
          recording_url?: string | null
          target_wpm?: number | null
          user_id?: string
          word_timestamps?: Json | null
          wpm_data?: Json | null
        }
        Relationships: []
      }
      therapist_directory: {
        Row: {
          accepts_new_patients: boolean
          bio: string | null
          city: string | null
          created_at: string
          display_name: string
          id: string
          is_listed: boolean
          specialties: string[] | null
          updated_at: string
          user_id: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          accepts_new_patients?: boolean
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_listed?: boolean
          specialties?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          accepts_new_patients?: boolean
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_listed?: boolean
          specialties?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_patient: {
        Args: { patient_uuid: string; should_archive: boolean }
        Returns: undefined
      }
      can_add_patient: { Args: { therapist_uuid: string }; Returns: boolean }
      count_active_patients: {
        Args: { therapist_uuid: string }
        Returns: number
      }
      find_therapist_by_code: {
        Args: { code: string }
        Returns: {
          full_name: string
          id: string
          therapist_code: string
        }[]
      }
      get_linked_therapist_info: {
        Args: never
        Returns: {
          full_name: string
          id: string
          therapist_code: string
        }[]
      }
      increment_battery_count: {
        Args: { therapist_uuid: string }
        Returns: undefined
      }
      increment_referral_bonus: {
        Args: { user_id: string }
        Returns: undefined
      }
      is_linked_therapist: { Args: { profile_id: string }; Returns: boolean }
      is_therapist_subscription_valid: {
        Args: { therapist_uuid: string }
        Returns: boolean
      }
      set_patient_target_sps: {
        Args: { patient_uuid: string; target_sps: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
