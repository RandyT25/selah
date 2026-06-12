-- ============================================================
-- CHURCHES: add geolocation columns
-- ============================================================
ALTER TABLE public.churches
  ADD COLUMN IF NOT EXISTS latitude  NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6);

-- ============================================================
-- NOTIFICATIONS: extend allowed types
-- ============================================================
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check CHECK (type IN (
    'verse_of_day', 'reading_reminder', 'prayer_reminder',
    'friend_request', 'friend_accepted', 'comment_reply',
    'prayer_prayed', 'plan_completed', 'streak_milestone',
    'devotional_published', 'system',
    'church_joined', 'church_event'
  ));

-- ============================================================
-- TRIGGER: notify prayer owner when someone prays
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_prayer_prayed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_prayer_title TEXT;
  v_actor_name TEXT;
BEGIN
  SELECT user_id, title
    INTO v_owner_id, v_prayer_title
    FROM public.prayer_requests
   WHERE id = NEW.prayer_id;

  -- Skip if praying for own request
  IF v_owner_id IS NULL OR v_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(display_name, full_name, 'Someone')
    INTO v_actor_name
    FROM public.profiles
   WHERE id = NEW.user_id;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    v_owner_id,
    'prayer_prayed',
    v_actor_name || ' prayed for you',
    '"' || LEFT(v_prayer_title, 60) || '" received a prayer',
    jsonb_build_object('prayer_id', NEW.prayer_id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_prayer_interaction_insert ON public.prayer_interactions;
CREATE TRIGGER on_prayer_interaction_insert
  AFTER INSERT ON public.prayer_interactions
  FOR EACH ROW
  WHEN (NEW.type = 'pray')
  EXECUTE FUNCTION public.notify_prayer_prayed();

-- ============================================================
-- TRIGGER: notify church admins when a member joins
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_church_joined()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_church_name TEXT;
  v_joiner_name TEXT;
  admin_rec     RECORD;
BEGIN
  -- Only for regular member joins, not admin creation
  IF NEW.role != 'member' THEN
    RETURN NEW;
  END IF;

  SELECT name INTO v_church_name
    FROM public.churches WHERE id = NEW.church_id;

  SELECT COALESCE(display_name, full_name, 'Someone')
    INTO v_joiner_name
    FROM public.profiles WHERE id = NEW.user_id;

  FOR admin_rec IN
    SELECT user_id FROM public.church_members
     WHERE church_id = NEW.church_id
       AND role = 'admin'
       AND user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      admin_rec.user_id,
      'church_joined',
      v_joiner_name || ' joined ' || v_church_name,
      'A new member has joined your church',
      jsonb_build_object('church_id', NEW.church_id, 'user_id', NEW.user_id)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_church_member_insert ON public.church_members;
CREATE TRIGGER on_church_member_insert
  AFTER INSERT ON public.church_members
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_church_joined();

-- Grant permissions on new trigger functions
GRANT EXECUTE ON FUNCTION public.notify_prayer_prayed() TO service_role;
GRANT EXECUTE ON FUNCTION public.notify_church_joined() TO service_role;
