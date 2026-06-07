-- ============================================================
-- SELAH - Row Level Security Policies
-- Migration: 002_rls_policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_of_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- USER PREFERENCES POLICIES
-- ============================================================
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- BIBLE DATA POLICIES (Public read)
-- ============================================================
CREATE POLICY "Bible books are publicly readable"
  ON public.bible_books FOR SELECT
  USING (true);

CREATE POLICY "Bible chapters are publicly readable"
  ON public.bible_chapters FOR SELECT
  USING (true);

CREATE POLICY "Bible verses are publicly readable"
  ON public.bible_verses FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage bible data"
  ON public.bible_verses FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage bible books"
  ON public.bible_books FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage bible chapters"
  ON public.bible_chapters FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- VERSE HIGHLIGHTS POLICIES
-- ============================================================
CREATE POLICY "Users can view their own highlights"
  ON public.verse_highlights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create highlights"
  ON public.verse_highlights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlights"
  ON public.verse_highlights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights"
  ON public.verse_highlights FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- VERSE BOOKMARKS POLICIES
-- ============================================================
CREATE POLICY "Users can view their own bookmarks"
  ON public.verse_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks"
  ON public.verse_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.verse_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- VERSE NOTES POLICIES
-- ============================================================
CREATE POLICY "Users can view their own notes"
  ON public.verse_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public notes"
  ON public.verse_notes FOR SELECT
  USING (is_private = false);

CREATE POLICY "Users can create notes"
  ON public.verse_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON public.verse_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.verse_notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- READING PLANS POLICIES
-- ============================================================
CREATE POLICY "Published plans are viewable by everyone"
  ON public.reading_plans FOR SELECT
  USING (is_published = true OR auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Admins can create reading plans"
  ON public.reading_plans FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = author_id);

CREATE POLICY "Admins can update reading plans"
  ON public.reading_plans FOR UPDATE
  USING (public.is_admin() OR auth.uid() = author_id);

CREATE POLICY "Admins can delete reading plans"
  ON public.reading_plans FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- PLAN PROGRESS POLICIES
-- ============================================================
CREATE POLICY "Users can view their own progress"
  ON public.plan_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON public.plan_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.plan_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON public.plan_progress FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- DEVOTIONALS POLICIES
-- ============================================================
CREATE POLICY "Published devotionals are viewable by everyone"
  ON public.devotionals FOR SELECT
  USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can manage devotionals"
  ON public.devotionals FOR ALL
  USING (public.is_admin());

-- ============================================================
-- JOURNAL ENTRIES POLICIES
-- ============================================================
CREATE POLICY "Users can view their own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public journal entries"
  ON public.journal_entries FOR SELECT
  USING (is_private = false);

CREATE POLICY "Users can create journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- PRAYER REQUESTS POLICIES
-- ============================================================
CREATE POLICY "Users can view their own prayer requests"
  ON public.prayer_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public prayer requests"
  ON public.prayer_requests FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create prayer requests"
  ON public.prayer_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayer requests"
  ON public.prayer_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayer requests"
  ON public.prayer_requests FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- PRAYER INTERACTIONS POLICIES
-- ============================================================
CREATE POLICY "Authenticated users can view prayer interactions"
  ON public.prayer_interactions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create prayer interactions"
  ON public.prayer_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayer interactions"
  ON public.prayer_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- FRIENDSHIPS POLICIES
-- ============================================================
CREATE POLICY "Users can view their own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendship requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they're part of"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can delete their own friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ============================================================
-- COMMENTS POLICIES
-- ============================================================
CREATE POLICY "Non-deleted comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (is_deleted = false);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin());

-- ============================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role' OR public.is_admin());

-- ============================================================
-- READING HISTORY POLICIES
-- ============================================================
CREATE POLICY "Users can view their own reading history"
  ON public.reading_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reading history"
  ON public.reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading history"
  ON public.reading_history FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- VERSE OF THE DAY POLICIES (Public read)
-- ============================================================
CREATE POLICY "Verse of the day is publicly readable"
  ON public.verse_of_day FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage verse of the day"
  ON public.verse_of_day FOR ALL
  USING (public.is_admin());

-- ============================================================
-- ANALYTICS POLICIES
-- ============================================================
CREATE POLICY "Users can insert their own analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view analytics"
  ON public.analytics_events FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- PUSH SUBSCRIPTIONS POLICIES
-- ============================================================
CREATE POLICY "Users can manage their own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- AI CONVERSATIONS POLICIES
-- ============================================================
CREATE POLICY "Users can manage their own AI conversations"
  ON public.ai_conversations FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- COMMENT LIKES POLICIES
-- ============================================================
CREATE POLICY "Anyone can view comment likes"
  ON public.comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like comments"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);
