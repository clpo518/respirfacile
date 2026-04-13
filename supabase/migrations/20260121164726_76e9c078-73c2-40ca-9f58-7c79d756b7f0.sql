-- Create a security definer function to lookup therapist by code
-- This bypasses RLS to allow patients to find therapists by their code
CREATE OR REPLACE FUNCTION public.find_therapist_by_code(code TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  therapist_code TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.therapist_code
  FROM profiles p
  WHERE p.therapist_code = UPPER(TRIM(code))
    AND p.is_therapist = true
  LIMIT 1;
$$;