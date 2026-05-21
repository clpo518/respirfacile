-- Messagerie in-app ortho → patient
-- Messages unidirectionnels (ortho envoie, patient lit)
-- Peut devenir bidirectionnel post-MVP

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('therapist', 'patient')),
  read_at TIMESTAMPTZ NULL,         -- NULL = non lu par le destinataire
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour charger les conversations rapidement
CREATE INDEX messages_therapist_patient_idx ON messages(therapist_id, patient_id, created_at DESC);
CREATE INDEX messages_patient_unread_idx ON messages(patient_id, read_at) WHERE read_at IS NULL;

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- L'ortho voit tous ses messages avec tous ses patients
CREATE POLICY "therapist_own_messages" ON messages
  FOR ALL USING (therapist_id = auth.uid());

-- Le patient voit ses messages avec son ortho
CREATE POLICY "patient_own_messages" ON messages
  FOR ALL USING (patient_id = auth.uid());
