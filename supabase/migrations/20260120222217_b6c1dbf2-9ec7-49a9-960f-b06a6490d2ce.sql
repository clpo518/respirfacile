-- Create clinical_notes table for private therapist notes
CREATE TABLE public.clinical_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_private BOOLEAN NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;

-- Only the therapist who created the note can view it (NEVER the patient)
CREATE POLICY "Therapists can view their own notes"
ON public.clinical_notes
FOR SELECT
USING (auth.uid() = therapist_id);

-- Therapists can create notes for their linked patients
CREATE POLICY "Therapists can create notes for their patients"
ON public.clinical_notes
FOR INSERT
WITH CHECK (
  auth.uid() = therapist_id 
  AND patient_id IN (
    SELECT id FROM public.profiles WHERE linked_therapist_id = auth.uid()
  )
);

-- Therapists can update their own notes
CREATE POLICY "Therapists can update their own notes"
ON public.clinical_notes
FOR UPDATE
USING (auth.uid() = therapist_id);

-- Therapists can delete their own notes
CREATE POLICY "Therapists can delete their own notes"
ON public.clinical_notes
FOR DELETE
USING (auth.uid() = therapist_id);

-- Create index for faster queries
CREATE INDEX idx_clinical_notes_patient ON public.clinical_notes(patient_id);
CREATE INDEX idx_clinical_notes_therapist ON public.clinical_notes(therapist_id);