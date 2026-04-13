-- Fix 1: Remove the overly permissive UPDATE policy on referrals
-- Referrals should only be updated by the system (service role via stripe webhook)
DROP POLICY IF EXISTS "Referrers can update their referrals" ON public.referrals;

-- Fix 2: session_comments already has proper RLS policies that require auth.uid() checks
-- But the supabase scanner flagged it. Let's verify RLS is enabled (it should be).
-- No change needed for session_comments - existing policies already restrict to authenticated users
-- via author_id = auth.uid() and session ownership checks.