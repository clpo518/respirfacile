-- ============================================================
-- RESPIRFACILE — Migration 003 : Journal de bord
-- ============================================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INTEGER,
  wellbeing_score INTEGER CHECK (wellbeing_score >= 1 AND wellbeing_score <= 10),
  sleep_score INTEGER CHECK (sleep_score >= 1 AND sleep_score <= 10),
  sleep_improvements TEXT[] DEFAULT '{}',
  sessions_done INTEGER CHECK (sessions_done >= 0 AND sessions_done <= 7),
  exercise_difficulty TEXT CHECK (exercise_difficulty IN ('Trop faciles', 'Bien adaptés', 'Trop difficiles')),
  motivation_issue TEXT CHECK (motivation_issue IN ('Oui', 'Non', 'Parfois')),
  free_text TEXT,
  proud_moment TEXT,
  nasal_score INTEGER CHECK (nasal_score >= 1 AND nasal_score <= 5),
  anxiety_level TEXT CHECK (anxiety_level IN ('Non', 'Un peu', 'Oui')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_user_week ON journal_entries(user_id, week_number);

-- RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Patient voit ses propres entrées
CREATE POLICY "patient_own_journal" ON journal_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "patient_create_journal" ON journal_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "patient_update_journal" ON journal_entries
  FOR UPDATE USING (user_id = auth.uid());

-- Thérapeute voit les entrées de SES patients
CREATE POLICY "therapist_patient_journal" ON journal_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
      AND tp.patient_id = journal_entries.user_id
    )
  );

-- ============================================================
-- TABLE journal_therapist_notes
-- ============================================================
CREATE TABLE IF NOT EXISTS journal_therapist_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_notes_entry ON journal_therapist_notes(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_notes_therapist ON journal_therapist_notes(therapist_id);

ALTER TABLE journal_therapist_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "therapist_own_notes" ON journal_therapist_notes
  FOR ALL USING (therapist_id = auth.uid());

CREATE POLICY "therapist_create_notes" ON journal_therapist_notes
  FOR INSERT WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "patient_reads_journal_notes" ON journal_therapist_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = journal_therapist_notes.journal_entry_id
      AND je.user_id = auth.uid()
    )
  );

