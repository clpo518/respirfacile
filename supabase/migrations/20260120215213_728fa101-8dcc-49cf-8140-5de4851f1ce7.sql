-- Remove the daily session limit trigger (we're pivoting to content lock model)
DROP TRIGGER IF EXISTS enforce_session_limit ON public.sessions;
DROP FUNCTION IF EXISTS public.check_session_limit();