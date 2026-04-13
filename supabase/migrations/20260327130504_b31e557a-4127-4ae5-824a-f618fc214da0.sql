-- Allow therapists to delete recordings of their linked patients
CREATE POLICY "Therapists can delete their patients recordings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.profiles
    WHERE linked_therapist_id = auth.uid()
  )
);
