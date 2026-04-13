CREATE POLICY "Therapists can upload recordings for their patients"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.profiles WHERE linked_therapist_id = auth.uid()
  )
);