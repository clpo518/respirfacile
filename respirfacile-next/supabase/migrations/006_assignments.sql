-- Table pour tracker la complétion quotidienne des exercices prescrits
-- Chaque session complète peut être liée à une prescription
-- L'ortho peut voir quels exercices ont été faits jour par jour

-- Ajouter une colonne prescription_id dans sessions pour lier une séance à une prescription
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL;

-- Vue matérialisée (ou vue simple) pour savoir si un exercice prescrit a été fait aujourd'hui
CREATE OR REPLACE VIEW prescription_completion AS
SELECT
  p.id as prescription_id,
  p.patient_id,
  p.therapist_id,
  p.exercise_id,
  p.frequency_per_day,
  p.frequency_label,
  p.notes,
  COALESCE(daily.sessions_today, 0) as sessions_today,
  COALESCE(weekly.sessions_this_week, 0) as sessions_this_week,
  CASE
    WHEN COALESCE(daily.sessions_today, 0) >= p.frequency_per_day THEN 'done'
    WHEN COALESCE(daily.sessions_today, 0) > 0 THEN 'partial'
    ELSE 'pending'
  END as status_today
FROM prescriptions p
LEFT JOIN (
  SELECT
    prescription_id,
    COUNT(*) as sessions_today
  FROM sessions
  WHERE
    prescription_id IS NOT NULL
    AND DATE(created_at) = CURRENT_DATE
  GROUP BY prescription_id
) daily ON daily.prescription_id = p.id
LEFT JOIN (
  SELECT
    prescription_id,
    COUNT(*) as sessions_this_week
  FROM sessions
  WHERE
    prescription_id IS NOT NULL
    AND created_at >= DATE_TRUNC('week', NOW())
  GROUP BY prescription_id
) weekly ON weekly.prescription_id = p.id
WHERE p.is_active = TRUE;

-- RLS sur la vue : pas de RLS directe sur les vues, la sécurité vient des tables sous-jacentes
-- (prescriptions et sessions ont déjà RLS)

-- Index pour accélérer les requêtes de complétion
CREATE INDEX IF NOT EXISTS sessions_prescription_date_idx ON sessions(prescription_id, created_at)
  WHERE prescription_id IS NOT NULL;
