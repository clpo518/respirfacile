-- Add gamification columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS today_minutes integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_goal integer NOT NULL DEFAULT 3;

-- Add an index on last_activity_date for efficient sorting by risk
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity_date ON public.profiles(last_activity_date);