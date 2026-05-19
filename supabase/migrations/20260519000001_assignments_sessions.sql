-- Table assignments : prescriptions ortho → patient
CREATE TABLE IF NOT EXISTS public.assignments (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at         timestamptz DEFAULT now() NOT NULL,
  patient_id         uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  therapist_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_category  text        NOT NULL,
  exercise_id        text,
  message            text,
  status             text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','cancelled')),
  target_sessions    int         NOT NULL DEFAULT 1 CHECK (target_sessions BETWEEN 1 AND 100),
  sessions_per_week  int         NOT NULL DEFAULT 1 CHECK (sessions_per_week BETWEEN 1 AND 7),
  completed_sessions int         NOT NULL DEFAULT 0 CHECK (completed_sessions >= 0)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_assignments_patient_id    ON public.assignments (patient_id);
CREATE INDEX IF NOT EXISTS idx_assignments_therapist_id  ON public.assignments (therapist_id);

-- RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Orthophoniste : toutes opérations sur ses propres prescriptions
CREATE POLICY IF NOT EXISTS "therapist_full_access" ON public.assignments
  FOR ALL USING (therapist_id = auth.uid())
  WITH CHECK (therapist_id = auth.uid());

-- Patient : lecture seule de ses prescriptions
CREATE POLICY IF NOT EXISTS "patient_read_own" ON public.assignments
  FOR SELECT USING (patient_id = auth.uid());

COMMENT ON TABLE public.assignments IS 'Prescriptions d''exercices envoyées par un orthophoniste à un patient.';
