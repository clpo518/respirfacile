-- Add birth_year column to profiles table for age-based calibration
ALTER TABLE public.profiles
ADD COLUMN birth_year integer;

-- Add comment explaining the column purpose
COMMENT ON COLUMN public.profiles.birth_year IS 'User birth year for age-based SPS target calibration (Van Zaalen norms)';