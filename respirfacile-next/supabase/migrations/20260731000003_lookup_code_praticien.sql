-- ============================================================
-- RESPIRFACILE — Fin de la fuite des profils praticiens
-- ============================================================
--
-- La politique `public_can_lookup_therapist_code` accordait un SELECT au rôle
-- `public`, donc y compris à `anon`, sur TOUTES les colonnes des profils
-- praticiens ayant un code. Vérifié le 31/07/2026 : un simple visiteur pouvait
-- lister les 11 praticiens de la base, adresses électroniques comprises.
--
-- Or un seul écran a besoin de cette lecture : l'inscription patient, qui
-- convertit un code en identifiant de praticien. Elle n'a jamais eu besoin de
-- lire quoi que ce soit d'autre.
--
-- La politique est donc remplacée par une fonction qui ne renvoie que l'UUID,
-- et rien d'autre.

CREATE OR REPLACE FUNCTION public.therapist_id_for_code(p_code TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM profiles
  WHERE therapist_code = upper(btrim(p_code))
    AND role = 'therapist'
    -- Garde-fou : un code vide ou trop court ne doit jamais rapprocher d'un
    -- praticien au hasard.
    AND length(btrim(p_code)) >= 6
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.therapist_id_for_code(TEXT) IS
  'Convertit un code praticien en identifiant, sans exposer le profil. Utilisée par l''inscription patient.';

REVOKE ALL ON FUNCTION public.therapist_id_for_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.therapist_id_for_code(TEXT) TO anon, authenticated;

DROP POLICY IF EXISTS "public_can_lookup_therapist_code" ON profiles;
