
CREATE POLICY "Therapists can view their patients recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.profiles
    WHERE linked_therapist_id = auth.uid()
  )
);
