-- Add trial_end_date for B2C autonomous users (7-day free trial)
-- This is NON-DESTRUCTIVE: does not modify any existing column or policy
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_end_date timestamp with time zone DEFAULT NULL;

-- Add a comment for clarity
COMMENT ON COLUMN public.profiles.trial_end_date IS 'End date of the 7-day free trial for B2C autonomous patients (NULL for B2B patients)';
