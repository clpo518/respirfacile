
-- Fix all therapists who got 7-day trials instead of 30 days due to race condition
UPDATE profiles
SET trial_end_date = trial_start_date + INTERVAL '30 days',
    updated_at = NOW()
WHERE is_therapist = true
  AND trial_start_date IS NOT NULL
  AND trial_end_date IS NOT NULL
  AND EXTRACT(EPOCH FROM (trial_end_date - trial_start_date)) < (10 * 86400);
