
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_name text NOT NULL,
  event_category text NOT NULL DEFAULT 'interaction',
  event_data jsonb DEFAULT '{}'::jsonb,
  page_path text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events (event_name);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events (user_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only admins can read analytics (via service role)"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (false);
