-- ============================================================
-- RESPIRFACILE — Journal de bord : création réelle de la table
-- ============================================================
--
-- Constat du 31/07/2026 : `journal_entries` n'existait PAS en base. La
-- migration 003 la décrivait mais n'a jamais été appliquée, et son schéma ne
-- correspondait pas au formulaire (nasal_score 1-5 au lieu de
-- nasal_breathing 1-10, anxiety_level en TEXT au lieu d'un entier, colonnes
-- exercise_completed et notes absentes).
--
-- Conséquence : le patient remplissait son journal hebdomadaire, voyait
-- « Journal enregistré ! », et rien n'était écrit. Le formulaire interceptait
-- explicitement l'erreur « table inexistante » pour afficher un succès.
--
-- Cette migration crée la table telle que l'application l'utilise réellement,
-- de façon idempotente, et rattrape le cas où la 003 aurait été appliquée
-- partiellement quelque part.

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INTEGER,
  -- Toutes les échelles patient sont sur 1 à 10, sans exception : une échelle
  -- sur 5 ici et sur 10 ailleurs rendait les écrans praticien faux.
  wellbeing_score INTEGER CHECK (wellbeing_score BETWEEN 1 AND 10),
  sleep_score INTEGER CHECK (sleep_score BETWEEN 1 AND 10),
  anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 10),
  nasal_breathing INTEGER CHECK (nasal_breathing BETWEEN 1 AND 10),
  exercise_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rattrapage si une version antérieure de la table existe déjà.
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS nasal_breathing INTEGER;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS exercise_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS week_number INTEGER;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal_entries(user_id, created_at DESC);

-- ============================================================
-- RLS, dans la même migration que la table. Jamais reporté.
-- ============================================================

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_own_journal" ON journal_entries;
CREATE POLICY "patient_own_journal" ON journal_entries
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "patient_create_journal" ON journal_entries;
CREATE POLICY "patient_create_journal" ON journal_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "patient_update_journal" ON journal_entries;
CREATE POLICY "patient_update_journal" ON journal_entries
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "patient_delete_journal" ON journal_entries;
CREATE POLICY "patient_delete_journal" ON journal_entries
  FOR DELETE USING (user_id = auth.uid());

-- Le praticien lit, mais n'écrit jamais dans le journal de son patient :
-- c'est la parole du patient, pas un dossier de soin partagé en écriture.
DROP POLICY IF EXISTS "therapist_patient_journal" ON journal_entries;
CREATE POLICY "therapist_patient_journal" ON journal_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM therapist_patients tp
      WHERE tp.therapist_id = auth.uid()
        AND tp.patient_id = journal_entries.user_id
    )
  );
