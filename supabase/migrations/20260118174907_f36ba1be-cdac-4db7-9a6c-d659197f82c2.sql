-- Create comments table for therapist feedback on sessions
CREATE TABLE public.session_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_comments ENABLE ROW LEVEL SECURITY;

-- Index for faster lookups
CREATE INDEX idx_session_comments_session ON public.session_comments(session_id);
CREATE INDEX idx_session_comments_author ON public.session_comments(author_id);

-- Therapists can insert comments on their patients' sessions
CREATE POLICY "Therapists can add comments to their patients sessions"
  ON public.session_comments FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN profiles p ON s.user_id = p.id
      WHERE p.linked_therapist_id = auth.uid()
    )
  );

-- Users can view comments on their own sessions OR therapists can view comments they wrote
CREATE POLICY "Users can view comments on their sessions"
  ON public.session_comments FOR SELECT
  USING (
    author_id = auth.uid() OR
    session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
  );

-- Authors can update their own comments
CREATE POLICY "Authors can update their comments"
  ON public.session_comments FOR UPDATE
  USING (author_id = auth.uid());

-- Authors can delete their own comments
CREATE POLICY "Authors can delete their comments"
  ON public.session_comments FOR DELETE
  USING (author_id = auth.uid());

-- Patients can mark comments as read
CREATE POLICY "Patients can mark comments as read"
  ON public.session_comments FOR UPDATE
  USING (
    session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
  );