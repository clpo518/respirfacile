-- Migration 004 : Table session_notes pour les notes cliniques ortho → patient

CREATE TABLE IF NOT EXISTS session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  visible_to_patient BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS session_notes_patient_idx ON session_notes(patient_id);
CREATE INDEX IF NOT EXISTS session_notes_therapist_idx ON session_notes(therapist_id);
CREATE INDEX IF NOT EXISTS session_notes_created_at_idx ON session_notes(created_at DESC);

-- RLS
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

-- Ortho voit et écrit les notes de SES patients uniquement
CREATE POLICY "therapist_own_notes" ON session_notes
  FOR ALL USING (therapist_id = auth.uid());

-- Patient voit uniquement les notes marquées visible_to_patient = true
CREATE POLICY "patient_visible_notes" ON session_notes
  FOR SELECT USING (
    patient_id = auth.uid() AND visible_to_patient = true
  );

-- Service role (Edge Functions, admin) a accès complet
CREATE POLICY "service_role_all" ON session_notes
  FOR ALL USING (auth.role() = 'service_role');
