-- Add multi-session fields to assignments
-- target_sessions: total number of sessions the patient must do
-- sessions_per_week: prescribed weekly frequency
-- completed_sessions: tracked automatically when patient completes sessions

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS target_sessions INT NOT NULL DEFAULT 1
    CHECK (target_sessions BETWEEN 1 AND 100),
  ADD COLUMN IF NOT EXISTS sessions_per_week INT NOT NULL DEFAULT 1
    CHECK (sessions_per_week BETWEEN 1 AND 7),
  ADD COLUMN IF NOT EXISTS completed_sessions INT NOT NULL DEFAULT 0
    CHECK (completed_sessions >= 0);
