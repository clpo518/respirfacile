-- Permet à n'importe qui (y compris non-authentifié) de vérifier
-- qu'un code PRO existe, sans exposer d'autres données.
-- Nécessaire pour la validation du code lors de l'inscription patient.

CREATE POLICY "public_can_lookup_therapist_code" ON profiles
  FOR SELECT
  USING (
    role = 'therapist'
    AND therapist_code IS NOT NULL
  );
