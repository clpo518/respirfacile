-- Create referrals table to track referral relationships
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, rewarded
  referrer_rewarded BOOLEAN NOT NULL DEFAULT false,
  referred_rewarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referred_id) -- Each user can only be referred once
);

-- Add referral_code to profiles (separate from therapist_code for clarity)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Add referral bonus tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_bonus_months INTEGER DEFAULT 0;

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies for referrals
CREATE POLICY "Users can view referrals they made"
ON public.referrals FOR SELECT
USING (referrer_id = auth.uid());

CREATE POLICY "Users can view their own referral record"
ON public.referrals FOR SELECT
USING (referred_id = auth.uid());

CREATE POLICY "System can insert referrals"
ON public.referrals FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update referrals"
ON public.referrals FOR UPDATE
USING (true);

-- Function to generate referral code on therapist signup
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_therapist = true AND NEW.referral_code IS NULL THEN
    NEW.referral_code := 'REF-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-generate referral code
CREATE TRIGGER generate_referral_code_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code();

-- Update existing therapists to have referral codes
UPDATE public.profiles 
SET referral_code = 'REF-' || UPPER(SUBSTRING(MD5(id::TEXT || NOW()::TEXT) FROM 1 FOR 6))
WHERE is_therapist = true AND referral_code IS NULL;