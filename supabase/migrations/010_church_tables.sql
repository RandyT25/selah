-- ============================================================
-- CHURCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.churches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  province TEXT,
  denomination TEXT,
  pastor_name TEXT,
  website TEXT,
  logo_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS churches_city ON public.churches(city);
CREATE INDEX IF NOT EXISTS churches_created_by ON public.churches(created_by);

-- ============================================================
-- CHURCH MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.church_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(church_id, user_id)
);

-- ============================================================
-- CHURCH EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.church_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  is_online BOOLEAN NOT NULL DEFAULT false,
  online_url TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_type TEXT CHECK (recurrence_type IN ('weekly', 'biweekly', 'monthly')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS church_events_church_id ON public.church_events(church_id);
CREATE INDEX IF NOT EXISTS church_events_date ON public.church_events(event_date);

-- ============================================================
-- AUTO-UPDATE member_count
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_church_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.churches SET member_count = member_count + 1 WHERE id = NEW.church_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.churches SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.church_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER church_member_count_trigger
AFTER INSERT OR DELETE ON public.church_members
FOR EACH ROW EXECUTE FUNCTION public.sync_church_member_count();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "churches_read"   ON public.churches FOR SELECT USING (true);
CREATE POLICY "churches_create" ON public.churches FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "churches_update" ON public.churches FOR UPDATE USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM public.church_members WHERE church_id = churches.id AND user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "churches_delete" ON public.churches FOR DELETE USING (created_by = auth.uid());

ALTER TABLE public.church_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "church_members_read"   ON public.church_members FOR SELECT USING (true);
CREATE POLICY "church_members_join"   ON public.church_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "church_members_leave"  ON public.church_members FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "church_members_update" ON public.church_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.church_members cm WHERE cm.church_id = church_members.church_id AND cm.user_id = auth.uid() AND cm.role = 'admin')
);

ALTER TABLE public.church_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "church_events_read"   ON public.church_events FOR SELECT USING (true);
CREATE POLICY "church_events_create" ON public.church_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.church_members WHERE church_id = church_events.church_id AND user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "church_events_update" ON public.church_events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.church_members WHERE church_id = church_events.church_id AND user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "church_events_delete" ON public.church_events FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.church_members WHERE church_id = church_events.church_id AND user_id = auth.uid() AND role = 'admin')
);
