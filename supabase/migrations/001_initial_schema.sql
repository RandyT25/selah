-- ============================================================
-- SELAH Bible Application - Complete Database Schema
-- Migration: 001_initial_schema
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  streak_count INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bible_translation TEXT NOT NULL DEFAULT 'KJV',
  font_size INTEGER NOT NULL DEFAULT 18 CHECK (font_size BETWEEN 12 AND 36),
  font_family TEXT NOT NULL DEFAULT 'serif' CHECK (font_family IN ('serif', 'sans', 'mono')),
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system', 'sepia')),
  line_spacing TEXT NOT NULL DEFAULT 'normal' CHECK (line_spacing IN ('compact', 'normal', 'relaxed', 'loose')),
  show_verse_numbers BOOLEAN NOT NULL DEFAULT true,
  show_chapter_numbers BOOLEAN NOT NULL DEFAULT true,
  reading_reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  reading_reminder_time TIME,
  prayer_reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  prayer_reminder_time TIME,
  push_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
  email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BIBLE BOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bible_books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_number INTEGER NOT NULL UNIQUE CHECK (book_number BETWEEN 1 AND 66),
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  testament TEXT NOT NULL CHECK (testament IN ('OT', 'NT')),
  genre TEXT NOT NULL,
  chapter_count INTEGER NOT NULL,
  verse_count INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BIBLE CHAPTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bible_chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id UUID REFERENCES public.bible_books(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL,
  verse_count INTEGER NOT NULL DEFAULT 0,
  cached_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(book_id, chapter_number)
);

-- ============================================================
-- BIBLE VERSES (Cached from API or seeded)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bible_verses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id UUID REFERENCES public.bible_books(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.bible_chapters(id) ON DELETE CASCADE NOT NULL,
  translation TEXT NOT NULL DEFAULT 'KJV',
  verse_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  reference TEXT NOT NULL,
  api_id TEXT,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(chapter_id, translation, verse_number)
);

-- Full-text search index on verse text
CREATE INDEX IF NOT EXISTS bible_verses_text_search ON public.bible_verses
  USING gin(to_tsvector('english', text));
CREATE INDEX IF NOT EXISTS bible_verses_book_chapter ON public.bible_verses(book_id, chapter_id);
CREATE INDEX IF NOT EXISTS bible_verses_translation ON public.bible_verses(translation);

-- ============================================================
-- VERSE HIGHLIGHTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.verse_highlights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  verse_id UUID REFERENCES public.bible_verses(id) ON DELETE CASCADE NOT NULL,
  color TEXT NOT NULL DEFAULT 'yellow' CHECK (color IN ('yellow', 'green', 'blue', 'pink', 'purple', 'orange')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

CREATE INDEX IF NOT EXISTS verse_highlights_user_id ON public.verse_highlights(user_id);
CREATE INDEX IF NOT EXISTS verse_highlights_verse_id ON public.verse_highlights(verse_id);

-- ============================================================
-- VERSE BOOKMARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.verse_bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  verse_id UUID REFERENCES public.bible_verses(id) ON DELETE CASCADE NOT NULL,
  collection_name TEXT NOT NULL DEFAULT 'Default',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

CREATE INDEX IF NOT EXISTS verse_bookmarks_user_id ON public.verse_bookmarks(user_id);

-- ============================================================
-- VERSE NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.verse_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  verse_id UUID REFERENCES public.bible_verses(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS verse_notes_user_id ON public.verse_notes(user_id);
CREATE INDEX IF NOT EXISTS verse_notes_verse_id ON public.verse_notes(verse_id);

-- ============================================================
-- READING PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reading_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  duration_days INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subscriber_count INTEGER NOT NULL DEFAULT 0,
  content JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reading_plans_featured ON public.reading_plans(is_featured) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS reading_plans_category ON public.reading_plans(category) WHERE is_published = true;

-- ============================================================
-- PLAN PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.plan_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.reading_plans(id) ON DELETE CASCADE NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 1,
  completed_days INTEGER[] DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_read_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, plan_id)
);

CREATE INDEX IF NOT EXISTS plan_progress_user_id ON public.plan_progress(user_id);
CREATE INDEX IF NOT EXISTS plan_progress_active ON public.plan_progress(user_id) WHERE is_active = true;

-- ============================================================
-- DEVOTIONALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.devotionals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  key_verse TEXT,
  key_verse_reference TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  reading_time_minutes INTEGER NOT NULL DEFAULT 5,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS devotionals_published ON public.devotionals(published_at DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS devotionals_featured ON public.devotionals(is_featured) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS devotionals_slug ON public.devotionals(slug);

-- ============================================================
-- JOURNAL ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  content_html TEXT,
  type TEXT NOT NULL DEFAULT 'reflection' CHECK (type IN ('reflection', 'prayer', 'gratitude', 'sermon_notes', 'study', 'general')),
  mood TEXT CHECK (mood IN ('joyful', 'peaceful', 'hopeful', 'grateful', 'struggling', 'confused', 'anxious', 'sad', 'neutral')),
  tags TEXT[] DEFAULT '{}',
  verse_references TEXT[] DEFAULT '{}',
  is_private BOOLEAN NOT NULL DEFAULT true,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_created_at ON public.journal_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS journal_entries_type ON public.journal_entries(user_id, type);
CREATE INDEX IF NOT EXISTS journal_entries_text_search ON public.journal_entries
  USING gin(to_tsvector('english', coalesce(title, '') || ' ' || content));

-- ============================================================
-- PRAYER REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'personal' CHECK (category IN ('personal', 'family', 'health', 'financial', 'relationships', 'work', 'spiritual', 'community', 'world', 'thanksgiving', 'other')),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_answered BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  prayer_count INTEGER NOT NULL DEFAULT 0,
  answer_note TEXT,
  answered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS prayer_requests_user_id ON public.prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS prayer_requests_public ON public.prayer_requests(created_at DESC) WHERE is_public = true;

-- Prayer Interactions (who prayed for a request)
CREATE TABLE IF NOT EXISTS public.prayer_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prayer_request_id UUID REFERENCES public.prayer_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(prayer_request_id, user_id)
);

-- ============================================================
-- FRIENDSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

CREATE INDEX IF NOT EXISTS friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS friendships_addressee ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS friendships_status ON public.friendships(status);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('devotional', 'prayer_request', 'journal_entry', 'reading_plan', 'verse')),
  entity_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  like_count INTEGER NOT NULL DEFAULT 0,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS comments_entity ON public.comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS comments_parent_id ON public.comments(parent_id);

-- Comment Likes
CREATE TABLE IF NOT EXISTS public.comment_likes (
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'verse_of_day', 'reading_reminder', 'prayer_reminder',
    'friend_request', 'friend_accepted', 'comment_reply',
    'prayer_prayed', 'plan_completed', 'streak_milestone',
    'devotional_published', 'system'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id ON public.notifications(user_id, is_read, created_at DESC);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'annual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ANALYTICS EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS analytics_events_user_id ON public.analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_type ON public.analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_created_at ON public.analytics_events(created_at DESC);

-- ============================================================
-- READING HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reading_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.bible_books(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.bible_chapters(id) ON DELETE CASCADE NOT NULL,
  translation TEXT NOT NULL DEFAULT 'KJV',
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, chapter_id, translation)
);

CREATE INDEX IF NOT EXISTS reading_history_user_id ON public.reading_history(user_id, read_at DESC);

-- ============================================================
-- VERSE OF THE DAY (Admin curated)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.verse_of_day (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  verse_reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  reflection TEXT,
  scheduled_date DATE NOT NULL UNIQUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS verse_of_day_date ON public.verse_of_day(scheduled_date);

-- ============================================================
-- PUSH NOTIFICATION SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- ============================================================
-- AI CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  context_verse TEXT,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_conversations_user_id ON public.ai_conversations(user_id, created_at DESC);

-- ============================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER verse_highlights_updated_at BEFORE UPDATE ON public.verse_highlights
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER verse_notes_updated_at BEFORE UPDATE ON public.verse_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER reading_plans_updated_at BEFORE UPDATE ON public.reading_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER devotionals_updated_at BEFORE UPDATE ON public.devotionals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER prayer_requests_updated_at BEFORE UPDATE ON public.prayer_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER friendships_updated_at BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update prayer count when someone prays
CREATE OR REPLACE FUNCTION public.handle_prayer_interaction()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.prayer_requests
    SET prayer_count = prayer_count + 1
    WHERE id = NEW.prayer_request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.prayer_requests
    SET prayer_count = GREATEST(prayer_count - 1, 0)
    WHERE id = OLD.prayer_request_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prayer_interaction_count
  AFTER INSERT OR DELETE ON public.prayer_interactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_prayer_interaction();

-- Update comment like count
CREATE OR REPLACE FUNCTION public.handle_comment_like()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_like_count
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_like();

-- Update word count on journal entry
CREATE OR REPLACE FUNCTION public.handle_journal_word_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_word_count
  BEFORE INSERT OR UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_journal_word_count();

-- Update reading plan subscriber count
CREATE OR REPLACE FUNCTION public.handle_plan_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reading_plans SET subscriber_count = subscriber_count + 1 WHERE id = NEW.plan_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reading_plans SET subscriber_count = GREATEST(subscriber_count - 1, 0) WHERE id = OLD.plan_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plan_subscriber_count
  AFTER INSERT OR DELETE ON public.plan_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_plan_subscriber_count();
