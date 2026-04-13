-- Add patient sentiment column to sessions table
ALTER TABLE public.sessions 
ADD COLUMN patient_sentiment TEXT 
CHECK (patient_sentiment IN ('too_slow', 'comfortable', 'too_fast'));