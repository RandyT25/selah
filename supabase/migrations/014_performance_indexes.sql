-- ============================================================
-- Migration 014 — Performance Indexes
-- ============================================================

-- Notification bell (most frequent query: unread count per user)
CREATE INDEX IF NOT EXISTS notifications_unread
  ON public.notifications(user_id, created_at DESC)
  WHERE is_read = false;

-- Dashboard prayer wall
CREATE INDEX IF NOT EXISTS prayer_requests_public_recent
  ON public.prayer_requests(created_at DESC)
  WHERE is_public = true AND is_answered = false;

-- Church listing with filters
CREATE INDEX IF NOT EXISTS churches_city_verified
  ON public.churches(city, is_verified);

-- Plan progress active plans (dashboard + plans page)
CREATE INDEX IF NOT EXISTS plan_progress_user_active
  ON public.plan_progress(user_id, started_at DESC)
  WHERE is_active = true;

-- Journal entries list (journal page)
CREATE INDEX IF NOT EXISTS journal_entries_user_recent
  ON public.journal_entries(user_id, created_at DESC)
  WHERE is_private = true;

-- Push subscriptions active (cron daily send)
CREATE INDEX IF NOT EXISTS push_subscriptions_active
  ON public.push_subscriptions(user_id)
  WHERE endpoint IS NOT NULL;
