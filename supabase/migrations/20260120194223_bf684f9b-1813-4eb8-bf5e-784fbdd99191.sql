-- =====================================================
-- SECURITY FIX #1: Secure storage bucket access
-- Drop public policy, add authenticated-only access
-- =====================================================

-- Drop the public access policy
DROP POLICY IF EXISTS "Anyone can view recordings" ON storage.objects;

-- Create secure policy: only recording owner or their linked therapist can view
CREATE POLICY "Authenticated users can view own recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings' AND (
    -- Owner can view (user_id is first folder segment)
    auth.uid()::text = (storage.foldername(name))[1]
    OR 
    -- Linked therapist can view their patients' recordings
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id::text = (storage.foldername(name))[1]
      AND p.linked_therapist_id = auth.uid()
    )
  )
);

-- =====================================================
-- SECURITY FIX #2: Server-side session limit enforcement
-- Prevents free users from bypassing the 3 sessions/day limit
-- =====================================================

-- Create function to check session limits
CREATE OR REPLACE FUNCTION public.check_session_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_count INTEGER;
  is_prem BOOLEAN;
BEGIN
  -- Get premium status for the user
  SELECT is_premium INTO is_prem
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  -- Premium users have no limit
  IF is_prem IS TRUE THEN
    RETURN NEW;
  END IF;
  
  -- Count today's sessions for this user
  SELECT COUNT(*) INTO session_count
  FROM public.sessions
  WHERE user_id = NEW.user_id
  AND created_at >= CURRENT_DATE
  AND created_at < CURRENT_DATE + INTERVAL '1 day';
  
  -- Enforce limit of 3 sessions per day for free users
  IF session_count >= 3 THEN
    RAISE EXCEPTION 'Daily session limit reached. Upgrade to premium for unlimited sessions.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce session limits before insert
DROP TRIGGER IF EXISTS enforce_session_limit ON public.sessions;
CREATE TRIGGER enforce_session_limit
BEFORE INSERT ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.check_session_limit();