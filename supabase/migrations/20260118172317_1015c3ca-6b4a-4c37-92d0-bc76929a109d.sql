-- Add is_therapist column to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_therapist BOOLEAN DEFAULT false NOT NULL;

-- Add therapist_code for inviting patients
ALTER TABLE public.profiles 
ADD COLUMN therapist_code TEXT UNIQUE;

-- Add linked_therapist_id for patients linked to a therapist
ALTER TABLE public.profiles 
ADD COLUMN linked_therapist_id UUID REFERENCES public.profiles(id);

-- Create index for therapist lookups
CREATE INDEX idx_profiles_therapist_code ON public.profiles(therapist_code) WHERE therapist_code IS NOT NULL;
CREATE INDEX idx_profiles_linked_therapist ON public.profiles(linked_therapist_id) WHERE linked_therapist_id IS NOT NULL;

-- Policy for therapists to view their linked patients
CREATE POLICY "Therapists can view their patients profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR auth.uid() = linked_therapist_id);

-- Policy for therapists to view their patients sessions
CREATE POLICY "Therapists can view their patients sessions"
  ON public.sessions FOR SELECT
  USING (
    auth.uid() = user_id OR 
    user_id IN (SELECT id FROM public.profiles WHERE linked_therapist_id = auth.uid())
  );