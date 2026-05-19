-- Permet à un patient de créer son propre lien therapist_patients lors de l'inscription
-- (quand il renseigne un code Pro)
-- SECURITY: le patient ne peut s'insérer qu'en tant que patient_id = auth.uid()
CREATE POLICY "patient_can_link_to_therapist"
  ON public.therapist_patients FOR INSERT
  WITH CHECK (patient_id = auth.uid());

-- Fonction SECURITY DEFINER pour vérifier un code Pro et retourner l'id du thérapeute
-- Appellable par n'importe quel utilisateur authentifié
CREATE OR REPLACE FUNCTION public.get_therapist_id_by_code(pro_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t_id UUID;
BEGIN
  SELECT id INTO t_id
  FROM public.profiles
  WHERE therapist_code = upper(trim(pro_code))
    AND role IN ('therapist', 'kine');
  RETURN t_id;
END;
$$;

-- Grant d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.get_therapist_id_by_code(TEXT) TO authenticated;
