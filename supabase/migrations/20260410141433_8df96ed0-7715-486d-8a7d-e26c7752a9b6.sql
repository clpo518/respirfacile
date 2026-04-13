CREATE OR REPLACE FUNCTION public.increment_battery_count(therapist_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET battery_count = battery_count + 1,
      updated_at = NOW()
  WHERE id = therapist_uuid
    AND is_therapist = true;
END;
$$;