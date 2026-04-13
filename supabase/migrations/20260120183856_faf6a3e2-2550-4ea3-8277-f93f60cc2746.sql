-- Create assignments table for therapist prescriptions
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_category TEXT NOT NULL,
  exercise_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_session_id UUID REFERENCES public.sessions(id)
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Therapists can create assignments for their patients
CREATE POLICY "Therapists can create assignments for their patients"
ON public.assignments
FOR INSERT
WITH CHECK (
  therapist_id = auth.uid() AND
  patient_id IN (
    SELECT id FROM public.profiles WHERE linked_therapist_id = auth.uid()
  )
);

-- Therapists can view assignments they created
CREATE POLICY "Therapists can view their assignments"
ON public.assignments
FOR SELECT
USING (therapist_id = auth.uid());

-- Patients can view their own assignments
CREATE POLICY "Patients can view their assignments"
ON public.assignments
FOR SELECT
USING (patient_id = auth.uid());

-- Patients can update their own assignments (to mark as completed)
CREATE POLICY "Patients can update their assignments"
ON public.assignments
FOR UPDATE
USING (patient_id = auth.uid());

-- Therapists can update their assignments
CREATE POLICY "Therapists can update their assignments"
ON public.assignments
FOR UPDATE
USING (therapist_id = auth.uid());

-- Therapists can delete their assignments
CREATE POLICY "Therapists can delete their assignments"
ON public.assignments
FOR DELETE
USING (therapist_id = auth.uid());

-- Create index for fast lookups
CREATE INDEX idx_assignments_patient_pending ON public.assignments(patient_id, status) WHERE status = 'pending';
CREATE INDEX idx_assignments_therapist ON public.assignments(therapist_id);