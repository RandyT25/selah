-- ============================================================
-- Migration 018 — Church Plus Tables
-- ============================================================

-- Attendance tracking
CREATE TABLE IF NOT EXISTS public.church_attendance (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id       UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  event_id        UUID REFERENCES public.church_events(id) ON DELETE CASCADE NOT NULL,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_in_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_in_method TEXT NOT NULL DEFAULT 'qr' CHECK (check_in_method IN ('qr','manual','self')),
  checked_in_by   UUID REFERENCES public.profiles(id),
  guest_name      TEXT,
  UNIQUE(event_id, user_id)
);
CREATE INDEX IF NOT EXISTS attendance_event   ON public.church_attendance(event_id);
CREATE INDEX IF NOT EXISTS attendance_church  ON public.church_attendance(church_id, checked_in_at DESC);
ALTER TABLE public.church_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance_admin_all" ON public.church_attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.church_members WHERE church_id = church_attendance.church_id AND user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "attendance_member_read_own" ON public.church_attendance FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "attendance_self_checkin"    ON public.church_attendance FOR INSERT WITH CHECK (user_id = auth.uid());

-- Ministry teams
CREATE TABLE IF NOT EXISTS public.church_teams (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id   UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  leader_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS teams_church ON public.church_teams(church_id);
ALTER TABLE public.church_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_member_read" ON public.church_teams FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.church_members WHERE church_id = church_teams.church_id AND user_id = auth.uid())
);
CREATE POLICY "teams_admin_write" ON public.church_teams FOR ALL USING (
  EXISTS (SELECT 1 FROM public.church_members WHERE church_id = church_teams.church_id AND user_id = auth.uid() AND role = 'admin')
);

CREATE TABLE IF NOT EXISTS public.church_team_members (
  team_id   UUID REFERENCES public.church_teams(id) ON DELETE CASCADE NOT NULL,
  user_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);
ALTER TABLE public.church_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_members_read" ON public.church_team_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.church_teams ct
    JOIN public.church_members cm ON cm.church_id = ct.church_id AND cm.user_id = auth.uid()
    WHERE ct.id = church_team_members.team_id
  )
);
CREATE POLICY "team_members_admin_write" ON public.church_team_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.church_teams ct
    JOIN public.church_members cm ON cm.church_id = ct.church_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
    WHERE ct.id = church_team_members.team_id
  )
);

-- Event registration columns (add to existing church_events)
ALTER TABLE public.church_events
  ADD COLUMN IF NOT EXISTS registration_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_capacity          INTEGER,
  ADD COLUMN IF NOT EXISTS registration_closes_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.church_event_registrations (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id      UUID REFERENCES public.church_events(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status        TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered','waitlisted','canceled')),
  UNIQUE(event_id, user_id)
);
CREATE INDEX IF NOT EXISTS registrations_event ON public.church_event_registrations(event_id);
ALTER TABLE public.church_event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "registrations_own" ON public.church_event_registrations FOR ALL USING (user_id = auth.uid());
CREATE POLICY "registrations_admin_read" ON public.church_event_registrations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.church_events ce
    JOIN public.church_members cm ON cm.church_id = ce.church_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
    WHERE ce.id = church_event_registrations.event_id
  )
);

-- QR check-in tokens (short-lived, server-verified)
CREATE TABLE IF NOT EXISTS public.checkin_tokens (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id   UUID REFERENCES public.church_events(id) ON DELETE CASCADE NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS checkin_tokens_event ON public.checkin_tokens(event_id);
CREATE INDEX IF NOT EXISTS checkin_tokens_token ON public.checkin_tokens(token);
ALTER TABLE public.checkin_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checkin_tokens_admin" ON public.checkin_tokens FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.church_events ce
    JOIN public.church_members cm ON cm.church_id = ce.church_id AND cm.user_id = auth.uid() AND cm.role = 'admin'
    WHERE ce.id = checkin_tokens.event_id
  )
);
CREATE POLICY "checkin_tokens_public_read" ON public.checkin_tokens FOR SELECT USING (expires_at > NOW());
