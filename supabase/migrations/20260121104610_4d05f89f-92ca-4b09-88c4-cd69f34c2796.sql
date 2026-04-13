-- Add exercise_type column to sessions table to track if it was reading or improvisation
ALTER TABLE public.sessions 
ADD COLUMN exercise_type text DEFAULT 'reading';

-- Add comment to explain the column
COMMENT ON COLUMN public.sessions.exercise_type IS 'Type of exercise: reading, improvisation, repetition, warmup';