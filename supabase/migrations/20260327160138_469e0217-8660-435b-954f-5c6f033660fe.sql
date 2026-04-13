-- Allow therapists to update their patients' sessions (e.g. clear recording_url)
CREATE POLICY "Therapists can update their patients sessions"
ON public.sessions
FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT id FROM profiles WHERE linked_therapist_id = auth.uid()
  )
)
WITH CHECK (
  user_id IN (
    SELECT id FROM profiles WHERE linked_therapist_id = auth.uid()
  )
);