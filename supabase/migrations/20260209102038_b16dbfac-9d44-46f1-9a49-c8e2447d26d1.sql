-- Update the referral code trigger to also generate codes for ALL users (not just therapists)
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'REF-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Generate referral codes for existing users without one
UPDATE public.profiles 
SET referral_code = 'REF-' || UPPER(SUBSTRING(MD5(id::TEXT || NOW()::TEXT) FROM 1 FOR 6))
WHERE referral_code IS NULL;