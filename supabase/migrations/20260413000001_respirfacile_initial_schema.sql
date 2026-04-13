-- ============================================================
-- RESPIRFACILE — Migration initiale S0
-- App SAOS / TMOF — Thérapie myofonctionnelle orofaciale
-- Créée : Avril 2026
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'patient',
  'therapist',
  'kine',
  'admin',
  'solo_patient'
);

CREATE TYPE subscription_status_type AS ENUM (
  'trialing',
  'active',
  'canceled',
  'past_due',
  'incomplete'
);

CREATE TYPE subscription_tier_type AS ENUM (
  'starter',
  'pro',
  'cabinet'
);

CREATE TYPE patient_profile_type AS ENUM (
  'adult_saos_mild',
  'adult_saos_severe',
  'adult_tmof',
  'adult_mixed',
  'child_7_12',
  'child_2_6'
);

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  -- Thérapeute uniquement
  therapist_code TEXT UNIQUE,                       -- ex: "PRO-A3K9Z2"
  profession_rpps TEXT,                             -- numéro RPPS (optionnel)
  -- Abonnement
  subscription_status subscription_status_type DEFAULT 'trialing',
  subscription_tier subscription_tier_type,
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  -- Métadonnées
  onboarding_completed BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies profiles
CREATE POLICY "users_view_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "therapist_view_patient_profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
      AND tp.patient_id = profiles.id
      AND tp.status = 'active'
    )
  );

CREATE POLICY "admin_all_profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- TABLE: therapist_patients
-- ============================================================
CREATE TABLE public.therapist_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  notes TEXT,                                       -- notes privées du thérapeute
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(therapist_id, patient_id)
);

ALTER TABLE public.therapist_patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "therapist_manage_own_patients"
  ON public.therapist_patients FOR ALL
  USING (therapist_id = auth.uid());

CREATE POLICY "patient_view_own_therapist"
  ON public.therapist_patients FOR SELECT
  USING (patient_id = auth.uid());

-- ============================================================
-- TABLE: patient_programs
-- ============================================================
CREATE TABLE public.patient_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  profile_type patient_profile_type NOT NULL,
  week_number INTEGER NOT NULL DEFAULT 1,
  jokers_used INTEGER NOT NULL DEFAULT 0,           -- max 2/semaine
  jokers_reset_at DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  custom_notes TEXT,                                -- instructions spécifiques du thérapeute
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.patient_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_view_own_program"
  ON public.patient_programs FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "therapist_manage_patient_programs"
  ON public.patient_programs FOR ALL
  USING (therapist_id = auth.uid());

CREATE POLICY "patient_update_own_jokers"
  ON public.patient_programs FOR UPDATE
  USING (patient_id = auth.uid());

-- ============================================================
-- TABLE: sessions (séances réalisées)
-- ============================================================
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  program_id UUID REFERENCES public.patient_programs(id) ON DELETE SET NULL,
  -- Exercice
  exercise_id TEXT NOT NULL,                        -- ex: 'pause_controlee_decouverte'
  exercise_category TEXT,                           -- ex: 'pause_controlee'
  -- Résultats
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  score INTEGER,                                    -- score normalisé 0-100
  metrics JSONB DEFAULT '{}'::jsonb,                -- données brutes flexibles
  -- ex: {"pause_steps": 45, "pause_duration": 22, "comfort_level": 3}
  -- Enregistrement audio
  recording_url TEXT,                               -- URL Supabase Storage (expiration 7j pour partage)
  recording_shared_until TIMESTAMPTZ,               -- quand le lien partagé expire
  -- Métadonnées
  notes TEXT,                                       -- notes patient après séance
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_own_sessions"
  ON public.sessions FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "therapist_view_patient_sessions"
  ON public.sessions FOR SELECT
  USING (
    therapist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
      AND tp.patient_id = sessions.user_id
      AND tp.status = 'active'
    )
  );

-- ============================================================
-- TABLE: user_badges
-- ============================================================
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,                           -- ex: 'pause_20', 'week_1'
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_view_own_badges"
  ON public.user_badges FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "system_insert_badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "therapist_view_patient_badges"
  ON public.user_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
      AND tp.patient_id = user_badges.user_id
    )
  );

-- ============================================================
-- TABLE: parental_consents (Post-MVP)
-- ============================================================
CREATE TABLE public.parental_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guardian_email TEXT NOT NULL,
  guardian_name TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  consent_given_at TIMESTAMPTZ,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.parental_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_view_own_consent"
  ON public.parental_consents FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "therapist_manage_consents"
  ON public.parental_consents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
      AND tp.patient_id = parental_consents.patient_id
    )
  );

-- ============================================================
-- TABLE: email_logs
-- ============================================================
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,                         -- 'welcome', 'trial_expiring', 'billing_failed', etc.
  recipient_email TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_view_email_logs"
  ON public.email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.patient_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Génère code thérapeute unique PRO-XXXXXX
CREATE OR REPLACE FUNCTION public.generate_therapist_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    code := 'PRO-' || upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE therapist_code = code) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Création profil automatique à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_val user_role;
  therapist_code_val TEXT;
BEGIN
  -- Détermine le rôle depuis les métadonnées
  user_role_val := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role,
    'patient'::user_role
  );

  -- Génère un code thérapeute si c'est un ortho ou kiné
  IF user_role_val IN ('therapist', 'kine') THEN
    therapist_code_val := public.generate_therapist_code();
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    therapist_code,
    subscription_status,
    trial_ends_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role_val,
    therapist_code_val,
    CASE
      WHEN user_role_val IN ('therapist', 'kine') THEN 'trialing'::subscription_status_type
      ELSE NULL
    END,
    CASE
      WHEN user_role_val IN ('therapist', 'kine') THEN NOW() + INTERVAL '30 days'
      WHEN user_role_val = 'solo_patient' THEN NOW() + INTERVAL '7 days'
      ELSE NULL
    END
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reset hebdomadaire des jokers (à appeler via cron Supabase ou Edge Function)
CREATE OR REPLACE FUNCTION public.reset_weekly_jokers()
RETURNS void AS $$
  UPDATE public.patient_programs
  SET
    jokers_used = 0,
    jokers_reset_at = CURRENT_DATE
  WHERE
    jokers_reset_at < CURRENT_DATE - INTERVAL '7 days'
    OR jokers_reset_at IS NULL;
$$ LANGUAGE sql SET search_path = public;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Bucket enregistrements séances
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'session-recordings',
  'session-recordings',
  FALSE,
  52428800,                                         -- 50 MB max
  ARRAY['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mp4']
) ON CONFLICT (id) DO NOTHING;

-- Policies storage
CREATE POLICY "authenticated_upload_recording"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'session-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "user_view_own_recording"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'session-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "therapist_view_patient_recording"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'session-recordings'
    AND EXISTS (
      SELECT 1 FROM public.therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
      AND tp.patient_id = (storage.foldername(name))[1]::uuid
      AND tp.status = 'active'
    )
  );

CREATE POLICY "user_delete_own_recording"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'session-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- INDEX PERFORMANCES
-- ============================================================
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_therapist_id ON public.sessions(therapist_id);
CREATE INDEX idx_sessions_exercise_id ON public.sessions(exercise_id);
CREATE INDEX idx_sessions_created_at ON public.sessions(created_at DESC);
CREATE INDEX idx_therapist_patients_therapist ON public.therapist_patients(therapist_id);
CREATE INDEX idx_therapist_patients_patient ON public.therapist_patients(patient_id);
CREATE INDEX idx_patient_programs_patient ON public.patient_programs(patient_id);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
