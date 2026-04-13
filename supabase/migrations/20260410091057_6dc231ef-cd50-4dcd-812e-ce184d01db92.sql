
-- Table for clinical battery assessments (Batterie d'Évaluation du Bredouillement)
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_birth_year INTEGER,
  guest_gender TEXT CHECK (guest_gender IN ('M', 'F', NULL)),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Only the therapist who created it can access
CREATE POLICY "Therapists can view their own assessments"
ON public.assessments FOR SELECT
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create assessments"
ON public.assessments FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their own assessments"
ON public.assessments FOR UPDATE
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete their own assessments"
ON public.assessments FOR DELETE
USING (auth.uid() = therapist_id);

-- Auto-update updated_at
CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
