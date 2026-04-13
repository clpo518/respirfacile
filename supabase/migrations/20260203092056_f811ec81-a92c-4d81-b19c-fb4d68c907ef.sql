-- 1. Créer une fonction SECURITY DEFINER pour vérifier si l'utilisateur est le thérapeute lié
CREATE OR REPLACE FUNCTION public.is_linked_therapist(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = profile_id
      AND linked_therapist_id = auth.uid()
  )
$$;

-- 2. Supprimer l'ancienne politique problématique
DROP POLICY IF EXISTS "Therapists can view their patients profiles" ON public.profiles;

-- 3. Recréer la politique en utilisant la fonction SECURITY DEFINER
CREATE POLICY "Therapists can view their patients profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR public.is_linked_therapist(id)
);