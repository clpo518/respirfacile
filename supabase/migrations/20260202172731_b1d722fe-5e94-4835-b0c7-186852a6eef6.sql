-- 1. Ajouter les colonnes pour les Orthophonistes (système B2B)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS seats_limit INTEGER DEFAULT 3;

-- 2. Ajouter la colonne d'archivage pour les Patients
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- 3. Initialiser trial_start_date pour les thérapeutes existants
UPDATE public.profiles 
SET trial_start_date = created_at 
WHERE is_therapist = true AND trial_start_date IS NULL;

-- 4. Créer une fonction pour compter les patients actifs d'un thérapeute
CREATE OR REPLACE FUNCTION public.count_active_patients(therapist_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.profiles
  WHERE linked_therapist_id = therapist_uuid
    AND is_archived = false;
$$;

-- 5. Créer une fonction pour vérifier si un thérapeute a un abonnement valide
CREATE OR REPLACE FUNCTION public.is_therapist_subscription_valid(therapist_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = therapist_uuid
      AND is_therapist = true
      AND (
        -- Trial valide (moins de 30 jours)
        (subscription_plan = 'trial' AND trial_start_date > NOW() - INTERVAL '30 days')
        -- Ou abonnement actif
        OR subscription_status = 'active'
      )
  );
$$;

-- 6. Créer une fonction pour vérifier si un thérapeute peut ajouter un patient
CREATE OR REPLACE FUNCTION public.can_add_patient(therapist_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    public.count_active_patients(therapist_uuid) < 
    COALESCE((SELECT seats_limit FROM public.profiles WHERE id = therapist_uuid), 3)
  ) AND public.is_therapist_subscription_valid(therapist_uuid);
$$;