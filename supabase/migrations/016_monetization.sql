-- ============================================================
-- Migration 016 — Monetization Tables
-- ============================================================

-- AI usage rate limiting (per user per day)
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  query_count INTEGER NOT NULL DEFAULT 0,
  token_count INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS ai_usage_user_date ON public.ai_usage(user_id, date);
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_usage_own" ON public.ai_usage FOR ALL USING (user_id = auth.uid());

-- One-time donations
CREATE TABLE IF NOT EXISTS public.donations (
  id                         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount_cents               INTEGER NOT NULL CHECK (amount_cents >= 100),
  currency                   TEXT NOT NULL DEFAULT 'USD',
  stripe_payment_intent_id   TEXT UNIQUE,
  stripe_customer_id         TEXT,
  status                     TEXT NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','succeeded','failed','refunded')),
  message                    TEXT,
  is_anonymous               BOOLEAN NOT NULL DEFAULT false,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS donations_user_id ON public.donations(user_id);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donations_own_read"   ON public.donations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "donations_insert"     ON public.donations FOR INSERT WITH CHECK (true);

-- Church Plus subscriptions
CREATE TABLE IF NOT EXISTS public.church_subscriptions (
  id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id               UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan                    TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','plus')),
  status                  TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','canceled','past_due','trialing')),
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.church_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "church_sub_admin_read" ON public.church_subscriptions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.church_members
    WHERE church_id = church_subscriptions.church_id
      AND user_id = auth.uid()
      AND role = 'admin'
  )
);

-- Feature flags (DB-backed, admin-managed)
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key                 TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  description         TEXT,
  is_enabled          BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage  INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  allowed_plans       TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feature_flags_public_read" ON public.feature_flags FOR SELECT USING (true);

-- Seed initial feature flags
INSERT INTO public.feature_flags (key, name, description, is_enabled, rollout_percentage, allowed_plans) VALUES
  ('ai_unlimited',        'Unlimited AI Queries',       'Remove AI daily query limit',                true, 100, ARRAY['premium','annual']),
  ('premium_plans',       'Premium Reading Plans',       'Access to premium curated reading plans',   true, 100, ARRAY['premium','annual']),
  ('journal_pdf_export',  'Journal PDF Export',          'Export journal as PDF',                     true, 100, ARRAY['premium','annual']),
  ('offline_audio',       'Offline Audio Downloads',     'Download audio chapters for offline use',   true, 100, ARRAY['premium','annual']),
  ('growth_dashboard',    'Spiritual Growth Dashboard',  'Weekly stats and growth charts',            true, 100, ARRAY['premium','annual']),
  ('church_attendance',   'Church Attendance Tracking',  'QR check-in and attendance reports',        true, 100, ARRAY['church_plus']),
  ('church_teams',        'Ministry Teams',              'Create and manage ministry teams',          true, 100, ARRAY['church_plus']),
  ('church_analytics',    'Church Analytics Dashboard',  'Member growth and engagement analytics',    true, 100, ARRAY['church_plus'])
ON CONFLICT (key) DO NOTHING;

-- Premium flag on reading plans
ALTER TABLE public.reading_plans
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;

-- Ensure all existing users have a subscriptions row (safe re-run)
INSERT INTO public.subscriptions (user_id, plan, status)
SELECT id, 'free', 'active' FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.subscriptions)
ON CONFLICT DO NOTHING;

-- Auto-create church_subscriptions row when a church is created
CREATE OR REPLACE FUNCTION public.handle_new_church()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.church_subscriptions (church_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_church_created ON public.churches;
CREATE TRIGGER on_church_created
  AFTER INSERT ON public.churches
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_church();

-- Backfill existing churches
INSERT INTO public.church_subscriptions (church_id, plan, status)
SELECT id, 'free', 'active' FROM public.churches
WHERE id NOT IN (SELECT church_id FROM public.church_subscriptions)
ON CONFLICT DO NOTHING;
