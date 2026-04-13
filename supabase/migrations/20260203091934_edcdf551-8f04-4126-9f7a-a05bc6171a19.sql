-- 1. Supprimer la politique RLS qui cause la récursion infinie
DROP POLICY IF EXISTS "Patients can view linked therapist profile" ON public.profiles;

-- 2. Créer une fonction SECURITY DEFINER pour récupérer les infos du thérapeute lié
-- Cette approche évite la récursion car la fonction bypass le RLS
CREATE OR REPLACE FUNCTION public.get_linked_therapist_info()
RETURNS TABLE (
  id uuid,
  full_name text,
  therapist_code text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.therapist_code
  FROM profiles p
  INNER JOIN profiles patient ON patient.linked_therapist_id = p.id
  WHERE patient.id = auth.uid()
$$;