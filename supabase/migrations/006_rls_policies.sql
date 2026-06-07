-- Migration 006: RLS policies + verse_id TEXT (run in Supabase Dashboard → SQL Editor)
-- This fixes 403 Forbidden errors on highlights, bookmarks, and notes.

-- ── Step 1: Change verse_id to TEXT (idempotent) ───────────────────────────
ALTER TABLE public.verse_highlights DROP CONSTRAINT IF EXISTS verse_highlights_verse_id_fkey;
ALTER TABLE public.verse_bookmarks  DROP CONSTRAINT IF EXISTS verse_bookmarks_verse_id_fkey;
ALTER TABLE public.verse_notes      DROP CONSTRAINT IF EXISTS verse_notes_verse_id_fkey;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='verse_highlights'
      AND column_name='verse_id' AND data_type='uuid') THEN
    ALTER TABLE public.verse_highlights ALTER COLUMN verse_id TYPE TEXT USING verse_id::TEXT;
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='verse_bookmarks'
      AND column_name='verse_id' AND data_type='uuid') THEN
    ALTER TABLE public.verse_bookmarks ALTER COLUMN verse_id TYPE TEXT USING verse_id::TEXT;
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='verse_notes'
      AND column_name='verse_id' AND data_type='uuid') THEN
    ALTER TABLE public.verse_notes ALTER COLUMN verse_id TYPE TEXT USING verse_id::TEXT;
  END IF;
END $$;

-- ── Step 2: Enable RLS ─────────────────────────────────────────────────────
ALTER TABLE public.verse_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_bookmarks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_notes      ENABLE ROW LEVEL SECURITY;

-- ── Step 3: Drop any old policies (idempotent) ────────────────────────────
DROP POLICY IF EXISTS "Users can manage own highlights" ON public.verse_highlights;
DROP POLICY IF EXISTS "Users can manage own bookmarks"  ON public.verse_bookmarks;
DROP POLICY IF EXISTS "Users can manage own notes"      ON public.verse_notes;

-- ── Step 4: Create policies — authenticated users own their rows ──────────
CREATE POLICY "Users can manage own highlights"
  ON public.verse_highlights FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks"
  ON public.verse_bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own notes"
  ON public.verse_notes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
