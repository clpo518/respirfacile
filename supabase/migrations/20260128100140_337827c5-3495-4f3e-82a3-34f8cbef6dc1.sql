-- Supprimer l'ancienne contrainte
ALTER TABLE public.profiles 
DROP CONSTRAINT profiles_linked_therapist_id_fkey;

-- Recréer avec ON DELETE SET NULL
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_linked_therapist_id_fkey 
FOREIGN KEY (linked_therapist_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;