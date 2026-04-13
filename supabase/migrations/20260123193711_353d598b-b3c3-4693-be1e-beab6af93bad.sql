-- Add target_wpm column to sessions table to store the patient's goal
ALTER TABLE public.sessions ADD COLUMN target_wpm integer DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.sessions.target_wpm IS 'The target speed (WPM) the patient aimed for during this exercise';