-- Allow therapists to insert sessions for their linked patients (live_session mode)
CREATE POLICY "Therapists can insert sessions for their patients"
ON public.sessions
FOR INSERT
WITH CHECK (
  auth.uid() != user_id
  AND user_id IN (
    SELECT id FROM public.profiles WHERE linked_therapist_id = auth.uid()
  )
  AND exercise_type = 'live_session'
);
