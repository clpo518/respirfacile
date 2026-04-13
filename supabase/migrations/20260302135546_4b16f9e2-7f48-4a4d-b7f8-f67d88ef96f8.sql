
-- Create journey_progress table
CREATE TABLE public.journey_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  step_index integer NOT NULL,
  exercise_id text NOT NULL,
  session_id uuid REFERENCES public.sessions(id),
  validated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, step_index, exercise_id)
);

-- Enable RLS
ALTER TABLE public.journey_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own journey progress"
ON public.journey_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journey progress"
ON public.journey_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journey progress"
ON public.journey_progress FOR DELETE
USING (auth.uid() = user_id);

-- Add current_journey_step to profiles
ALTER TABLE public.profiles
ADD COLUMN current_journey_step integer NOT NULL DEFAULT 0;
