-- Add columns to the media table for moderation
ALTER TABLE "public"."media" 
  ADD COLUMN IF NOT EXISTS "moderation_reason" TEXT,
  ADD COLUMN IF NOT EXISTS "moderated_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "moderated_by" UUID REFERENCES auth.users(id);

-- Create index for improved moderation queries
CREATE INDEX IF NOT EXISTS "idx_media_status" ON "public"."media" ("status");
CREATE INDEX IF NOT EXISTS "idx_media_moderated_at" ON "public"."media" ("moderated_at");
CREATE INDEX IF NOT EXISTS "idx_media_moderated_by" ON "public"."media" ("moderated_by");

-- Create a table for moderation logs
CREATE TABLE IF NOT EXISTS "public"."moderation_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "media_id" UUID NOT NULL REFERENCES public.media(id) ON DELETE CASCADE,
  "action" TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'reset', 'deleted')),
  "reason" TEXT,
  "moderator_id" UUID NOT NULL REFERENCES auth.users(id),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for moderation logs
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_media_id" ON "public"."moderation_logs" ("media_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_moderator_id" ON "public"."moderation_logs" ("moderator_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_action" ON "public"."moderation_logs" ("action");
CREATE INDEX IF NOT EXISTS "idx_moderation_logs_created_at" ON "public"."moderation_logs" ("created_at");

-- Add RLS policies for moderation logs
ALTER TABLE "public"."moderation_logs" ENABLE ROW LEVEL SECURITY;

-- Allow moderators to view logs for their events
CREATE POLICY "Moderators can view moderation logs for their events" 
  ON "public"."moderation_logs"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.media m
      JOIN public.events e ON m.event_id = e.id
      WHERE 
        m.id = moderation_logs.media_id 
        AND e.organizer_id = auth.uid()
    )
  );

-- Allow admin to view all logs
CREATE POLICY "Admins can view all moderation logs" 
  ON "public"."moderation_logs"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow moderators to insert logs for their events
CREATE POLICY "Moderators can insert moderation logs for their events" 
  ON "public"."moderation_logs"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.media m
      JOIN public.events e ON m.event_id = e.id
      WHERE 
        m.id = moderation_logs.media_id 
        AND e.organizer_id = auth.uid()
    )
  );

-- Add notify trigger for new moderation actions
CREATE OR REPLACE FUNCTION public.handle_moderation_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'moderation_action',
    json_build_object(
      'action', NEW.action,
      'media_id', NEW.media_id,
      'moderator_id', NEW.moderator_id,
      'created_at', NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for moderation notifications
DROP TRIGGER IF EXISTS notify_moderation_action ON public.moderation_logs;
CREATE TRIGGER notify_moderation_action
  AFTER INSERT ON public.moderation_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_moderation_notification(); 