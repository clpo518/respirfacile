-- ============================================================
-- RESPIRFACILE — Migration 002 : Programmes + Badges
-- ============================================================

-- ============================================================
-- TABLE patient_programs
-- ============================================================
CREATE TABLE IF NOT EXISTS patient_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES profiles(id),
  profile_type TEXT CHECK (profile_type IN (
    'adult_saos_mild', 'adult_saos_severe', 'adult_tmof', 'adult_mixed', 'child_7_12', 'child_2_6'
  )),
  week_number INTEGER DEFAULT 1,
  current_exercise_index INTEGER DEFAULT 0,
  jokers_used INTEGER DEFAULT 0 CHECK (jokers_used >= 0),
  jokers_reset_at DATE,
  is_active BOOLEAN DEFAULT TRUE,
  objectives TEXT[], -- ['mieux_dormir', 'reduire_ronflements', 'respiration_nasale', 'autre']
  availability TEXT[], -- ['matin', 'midi', 'soir']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_programs_patient ON patient_programs(patient_id);
CREATE INDEX IF NOT EXISTS idx_programs_therapist ON patient_programs(therapist_id);

ALTER TABLE patient_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_own_program" ON patient_programs
  FOR ALL USING (patient_id = auth.uid());

CREATE POLICY "therapist_patient_program" ON patient_programs
  FOR ALL USING (
    therapist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
      AND tp.patient_id = patient_programs.patient_id
    )
  );

CREATE TRIGGER programs_updated_at
  BEFORE UPDATE ON patient_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Reset jokers hebdomadaire
CREATE OR REPLACE FUNCTION reset_weekly_jokers()
RETURNS void AS $$
  UPDATE patient_programs
  SET jokers_used = 0, jokers_reset_at = CURRENT_DATE
  WHERE jokers_reset_at < CURRENT_DATE - INTERVAL '7 days'
    OR jokers_reset_at IS NULL;
$$ LANGUAGE sql;

-- ============================================================
-- TABLE user_badges
-- ============================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL CHECK (badge_id IN (
    'first_session', 'week_1', 'pause_20', 'pause_25',
    'nasale_master', 'coherence_30', 'month_1'
  )),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_badges_user ON user_badges(user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_own_badges" ON user_badges
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "therapist_patient_badges" ON user_badges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
      AND tp.patient_id = user_badges.user_id
    )
  );

-- ============================================================
-- TABLE session_notes (notes cliniques ortho)
-- ============================================================
CREATE TABLE IF NOT EXISTS session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_visible_to_patient BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_patient ON session_notes(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_therapist ON session_notes(therapist_id);

ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "therapist_own_notes" ON session_notes
  FOR ALL USING (therapist_id = auth.uid());

CREATE POLICY "patient_reads_visible_notes" ON session_notes
  FOR SELECT USING (
    patient_id = auth.uid() AND is_visible_to_patient = TRUE
  );

-- ============================================================
-- TABLE parental_consents (Post-MVP)
-- ============================================================
CREATE TABLE IF NOT EXISTS parental_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  guardian_email TEXT NOT NULL,
  guardian_name TEXT NOT NULL,
  consent_given BOOLEAN DEFAULT FALSE,
  consent_given_at TIMESTAMPTZ,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE parental_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "therapist_manages_consents" ON parental_consents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
      AND tp.patient_id = parental_consents.patient_id
    )
  );
