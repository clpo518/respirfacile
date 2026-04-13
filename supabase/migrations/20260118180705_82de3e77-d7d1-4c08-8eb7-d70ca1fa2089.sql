-- Add is_premium column to profiles
ALTER TABLE public.profiles
ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT false;