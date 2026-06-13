-- ============================================================
-- Migration 015 — Onboarding & User Goal Columns
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_step   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS signup_source     TEXT CHECK (signup_source IN ('web', 'pwa', 'google'));

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS denomination                   TEXT,
  ADD COLUMN IF NOT EXISTS reading_goal_chapters_per_week INTEGER NOT NULL DEFAULT 5
    CHECK (reading_goal_chapters_per_week BETWEEN 1 AND 49);

-- Mark all existing users as onboarding complete so they aren't redirected
UPDATE public.profiles
  SET onboarding_completed = true
  WHERE onboarding_completed = false;
