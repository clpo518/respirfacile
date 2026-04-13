-- Drop overly permissive policies
DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "System can update referrals" ON public.referrals;

-- Create proper INSERT policy - only allow inserting referral for self as referred
CREATE POLICY "Users can create their own referral record"
ON public.referrals FOR INSERT
WITH CHECK (referred_id = auth.uid());

-- Create proper UPDATE policy - referrers can update their referrals status
CREATE POLICY "Referrers can update their referrals"
ON public.referrals FOR UPDATE
USING (referrer_id = auth.uid());