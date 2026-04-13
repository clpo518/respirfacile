CREATE OR REPLACE FUNCTION public.is_therapist_subscription_valid(therapist_uuid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = therapist_uuid
      AND is_therapist = true
      AND (
        -- Active paid subscription
        subscription_status = 'active'
        -- Or trial_end_date in the future (covers manual extensions & standard trials)
        OR (trial_end_date IS NOT NULL AND trial_end_date > NOW())
        -- Legacy fallback: trial_start_date within 30 days
        OR (subscription_plan = 'trial' AND trial_start_date > NOW() - INTERVAL '30 days')
      )
  );
$$;