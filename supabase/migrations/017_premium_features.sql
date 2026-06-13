-- ============================================================
-- Migration 017 — Premium Features Tables
-- ============================================================

-- Weekly stats cache for growth dashboard (avoids expensive on-demand aggregation)
CREATE TABLE IF NOT EXISTS public.user_stats_weekly (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_start    DATE NOT NULL,
  chapters_read INTEGER NOT NULL DEFAULT 0,
  journal_entries INTEGER NOT NULL DEFAULT 0,
  prayers_offered INTEGER NOT NULL DEFAULT 0,
  ai_queries    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);
CREATE INDEX IF NOT EXISTS user_stats_weekly_user ON public.user_stats_weekly(user_id, week_start DESC);
ALTER TABLE public.user_stats_weekly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stats_own" ON public.user_stats_weekly FOR ALL USING (user_id = auth.uid());
