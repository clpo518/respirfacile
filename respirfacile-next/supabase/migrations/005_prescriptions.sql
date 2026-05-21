-- Migration 005 : Prescriptions d'exercices ortho → patient

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,           -- référence à lib/data/exercises.ts
  frequency_per_day INTEGER DEFAULT 1, -- nb de fois par jour
  frequency_label TEXT,                -- ex: "3x par jour", "1x le matin"
  duration_seconds INTEGER,            -- peut surcharger la durée par défaut
  notes TEXT,                          -- conseil personnalisé de l'ortho
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS prescriptions_patient_idx ON prescriptions(patient_id, is_active);
CREATE INDEX IF NOT EXISTS prescriptions_therapist_idx ON prescriptions(therapist_id);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Ortho voit et gère ses prescriptions
CREATE POLICY "therapist_own_prescriptions" ON prescriptions
  FOR ALL USING (therapist_id = auth.uid());

-- Patient voit ses prescriptions actives
CREATE POLICY "patient_own_prescriptions" ON prescriptions
  FOR SELECT USING (patient_id = auth.uid() AND is_active = true);

-- Service role
CREATE POLICY "service_role_prescriptions" ON prescriptions
  FOR ALL USING (auth.role() = 'service_role');
