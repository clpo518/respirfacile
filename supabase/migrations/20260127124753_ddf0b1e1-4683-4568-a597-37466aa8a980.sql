-- Add word_timestamps column for disfluency analysis
ALTER TABLE public.sessions 
ADD COLUMN word_timestamps JSONB DEFAULT NULL;

COMMENT ON COLUMN public.sessions.word_timestamps IS 
  'Word-level timestamps from Deepgram for disfluency analysis';