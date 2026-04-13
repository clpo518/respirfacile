-- Allow patients to view their linked therapist's profile
-- This enables TherapistShareCard to show the linked therapist's info
CREATE POLICY "Patients can view linked therapist profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT linked_therapist_id 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND linked_therapist_id IS NOT NULL
  )
);