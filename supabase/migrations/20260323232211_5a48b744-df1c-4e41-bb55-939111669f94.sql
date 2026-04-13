
CREATE OR REPLACE FUNCTION public.set_patient_target_sps(patient_uuid uuid, target_sps numeric)
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
  SET target_wpm = ROUND(target_sps * 60 / 1.8),
      updated_at = NOW()
  WHERE id = patient_uuid;
END;
$$;
