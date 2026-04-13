-- Create therapist directory table for public visibility
CREATE TABLE public.therapist_directory (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_listed boolean NOT NULL DEFAULT false,
  display_name text NOT NULL,
  city text,
  zip_code text,
  specialties text[] DEFAULT '{}',
  website text,
  accepts_new_patients boolean NOT NULL DEFAULT true,
  bio text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.therapist_directory ENABLE ROW LEVEL SECURITY;

-- Public can view listed therapists (for directory page)
CREATE POLICY "Anyone can view listed therapists"
ON public.therapist_directory
FOR SELECT
USING (is_listed = true);

-- Therapists can view their own profile (even if not listed)
CREATE POLICY "Therapists can view their own directory profile"
ON public.therapist_directory
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Therapists can insert their own directory profile
CREATE POLICY "Therapists can create their own directory profile"
ON public.therapist_directory
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Therapists can update their own directory profile
CREATE POLICY "Therapists can update their own directory profile"
ON public.therapist_directory
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Therapists can delete their own directory profile
CREATE POLICY "Therapists can delete their own directory profile"
ON public.therapist_directory
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_therapist_directory_updated_at
BEFORE UPDATE ON public.therapist_directory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for search optimization
CREATE INDEX idx_therapist_directory_city ON public.therapist_directory(city) WHERE is_listed = true;
CREATE INDEX idx_therapist_directory_zip ON public.therapist_directory(zip_code) WHERE is_listed = true;
CREATE INDEX idx_therapist_directory_listed ON public.therapist_directory(is_listed) WHERE is_listed = true;