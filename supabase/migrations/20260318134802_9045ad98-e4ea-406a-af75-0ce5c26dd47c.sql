
CREATE OR REPLACE FUNCTION public.archive_patient(patient_uuid uuid, should_archive boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = patient_uuid
      AND linked_therapist_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized: you are not this patient''s therapist';
  END IF;

  UPDATE profiles
  SET is_archived = should_archive, updated_at = NOW()
  WHERE id = patient_uuid;
END;
$$;
