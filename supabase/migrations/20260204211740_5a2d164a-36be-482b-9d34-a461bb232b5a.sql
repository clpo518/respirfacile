-- Add anti-spam cooldown column for engagement emails
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_engagement_email_at TIMESTAMPTZ DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.last_engagement_email_at IS 'Timestamp of last engagement email sent (for 7-day cooldown anti-spam)';