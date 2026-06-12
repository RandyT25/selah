-- ============================================================
-- CHURCH ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.church_announcements (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id    UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  author_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content      TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS church_announcements_church_id
  ON public.church_announcements(church_id, created_at DESC);

ALTER TABLE public.church_announcements ENABLE ROW LEVEL SECURITY;

-- Members can read announcements of churches they belong to
CREATE POLICY "Church members can read announcements"
  ON public.church_announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.church_members
      WHERE church_id = church_announcements.church_id
        AND user_id = auth.uid()
    )
  );

-- Admins can create announcements
CREATE POLICY "Church admins can create announcements"
  ON public.church_announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.church_members
      WHERE church_id = church_announcements.church_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Admins can delete announcements
CREATE POLICY "Church admins can delete announcements"
  ON public.church_announcements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.church_members
      WHERE church_id = church_announcements.church_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- ============================================================
-- NOTIFICATIONS: add church_announcement type
-- ============================================================
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check CHECK (type IN (
    'verse_of_day', 'reading_reminder', 'prayer_reminder',
    'friend_request', 'friend_accepted', 'comment_reply',
    'prayer_prayed', 'plan_completed', 'streak_milestone',
    'devotional_published', 'system',
    'church_joined', 'church_event', 'church_announcement'
  ));

-- ============================================================
-- TRIGGER: notify members when admin posts announcement
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_church_announcement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_church_name TEXT;
  v_author_name TEXT;
  member_rec    RECORD;
BEGIN
  SELECT name INTO v_church_name FROM public.churches WHERE id = NEW.church_id;
  SELECT COALESCE(display_name, full_name, 'Admin') INTO v_author_name
    FROM public.profiles WHERE id = NEW.author_id;

  FOR member_rec IN
    SELECT user_id FROM public.church_members
     WHERE church_id = NEW.church_id AND user_id != NEW.author_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      member_rec.user_id,
      'church_announcement',
      v_church_name || ': New announcement',
      LEFT(NEW.content, 100),
      jsonb_build_object('church_id', NEW.church_id, 'announcement_id', NEW.id)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_church_announcement_insert ON public.church_announcements;
CREATE TRIGGER on_church_announcement_insert
  AFTER INSERT ON public.church_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_church_announcement();

-- ============================================================
-- TRIGGER: notify members when a new event is created
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_church_event_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_church_name TEXT;
  member_rec    RECORD;
BEGIN
  SELECT name INTO v_church_name FROM public.churches WHERE id = NEW.church_id;

  FOR member_rec IN
    SELECT user_id FROM public.church_members
     WHERE church_id = NEW.church_id AND user_id != NEW.created_by
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      member_rec.user_id,
      'church_event',
      v_church_name || ': New event added',
      NEW.title || ' — ' || NEW.event_date::TEXT,
      jsonb_build_object('church_id', NEW.church_id, 'event_id', NEW.id)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_church_event_insert ON public.church_events;
CREATE TRIGGER on_church_event_insert
  AFTER INSERT ON public.church_events
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_church_event_created();

GRANT EXECUTE ON FUNCTION public.notify_church_announcement() TO service_role;
GRANT EXECUTE ON FUNCTION public.notify_church_event_created()  TO service_role;
