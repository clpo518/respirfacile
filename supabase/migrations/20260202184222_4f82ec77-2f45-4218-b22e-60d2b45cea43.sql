CREATE OR REPLACE FUNCTION public.increment_referral_bonus(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE profiles
  SET 
    referral_bonus_months = COALESCE(referral_bonus_months, 0) + 1,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$;