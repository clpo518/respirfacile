-- ============================================================
-- RESPIRFACILE — Migration 001 : Schéma initial
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE profiles (utilisateurs)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('patient', 'therapist', 'admin', 'solo_patient', 'kine')) DEFAULT 'patient',
  -- Thérapeute
  therapist_code TEXT UNIQUE,
  specialty TEXT, -- 'orthophonie' | 'kinesitherapie' | 'autre'
  subscription_status TEXT CHECK (subscription_status IN ('trialing', 'active', 'canceled', 'past_due', 'incomplete')) DEFAULT 'trialing',
  subscription_tier TEXT CHECK (subscription_tier IN ('starter', 'pro', 'cabinet')),
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  -- Patient
  patient_profile TEXT CHECK (patient_profile IN ('adult_saos_mild', 'adult_saos_severe', 'adult_tmof', 'adult_mixed', 'child_7_12', 'child_2_6')),
  uses_cpap BOOLEAN DEFAULT FALSE,
  age INTEGER,
  -- Commun
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_therapist_code ON profiles(therapist_code);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);

-- RLS profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "therapist_sees_patients" ON profiles
  FOR SELECT USING (
    role = 'patient' AND EXISTS (
      SELECT 1 FROM therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
      AND tp.patient_id = profiles.id
    )
  );

CREATE POLICY "admin_sees_all" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- TABLE therapist_patients (lien ortho → patient)
-- ============================================================
CREATE TABLE IF NOT EXISTS therapist_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(therapist_id, patient_id)
);

CREATE INDEX IF NOT EXISTS idx_tp_therapist ON therapist_patients(therapist_id);
CREATE INDEX IF NOT EXISTS idx_tp_patient ON therapist_patients(patient_id);

ALTER TABLE therapist_patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "therapist_manages_patients" ON therapist_patients
  FOR ALL USING (therapist_id = auth.uid());

CREATE POLICY "patient_sees_own_link" ON therapist_patients
  FOR SELECT USING (patient_id = auth.uid());

-- ============================================================
-- TABLE sessions (séances réalisées)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES profiles(id),
  exercise_id TEXT NOT NULL,
  exercise_category TEXT,
  duration_seconds INTEGER,
  metrics JSONB DEFAULT '{}',
  score INTEGER,
  score_unit TEXT DEFAULT 'pas',
  comfort_level INTEGER CHECK (comfort_level BETWEEN 1 AND 5),
  notes TEXT,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_therapist ON sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exercise ON sessions(exercise_id);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_own_sessions" ON sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "therapist_patient_sessions" ON sessions
  FOR SELECT USING (
    therapist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
      AND tp.patient_id = sessions.user_id
    )
  );

CREATE POLICY "admin_all_sessions" ON sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- TABLE email_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_email_logs" ON email_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- TRIGGER : updated_at automatique sur profiles
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGER : Créer profile automatiquement après signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
