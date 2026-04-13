
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Therapists can insert sessions for their patients" ON public.sessions;

-- Create new policy allowing therapists to insert sessions for their patients with any exercise type
CREATE POLICY "Therapists can insert sessions for their patients"
ON public.sessions
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() <> user_id)
  AND (user_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.linked_therapist_id = auth.uid()
  ))
);
