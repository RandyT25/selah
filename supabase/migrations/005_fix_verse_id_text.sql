-- Migration 005: Ensure verse_id is TEXT (idempotent — safe to run multiple times)
-- Run this in Supabase Dashboard → SQL Editor if highlights/bookmarks fail

-- Drop FK constraints (ignore error if already dropped)
ALTER TABLE public.verse_highlights DROP CONSTRAINT IF EXISTS verse_highlights_verse_id_fkey;
ALTER TABLE public.verse_bookmarks  DROP CONSTRAINT IF EXISTS verse_bookmarks_verse_id_fkey;
ALTER TABLE public.verse_notes      DROP CONSTRAINT IF EXISTS verse_notes_verse_id_fkey;

-- Change column type to TEXT (idempotent for TEXT → TEXT)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'verse_highlights'
      AND column_name = 'verse_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.verse_highlights ALTER COLUMN verse_id TYPE TEXT USING verse_id::TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'verse_bookmarks'
      AND column_name = 'verse_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.verse_bookmarks ALTER COLUMN verse_id TYPE TEXT USING verse_id::TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'verse_notes'
      AND column_name = 'verse_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.verse_notes ALTER COLUMN verse_id TYPE TEXT USING verse_id::TEXT;
  END IF;
END $$;
