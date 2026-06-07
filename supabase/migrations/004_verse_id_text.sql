-- verse_id was UUID FK → bible_verses(id) which breaks when using the free
-- Bible API (verse IDs are strings like "free-Genesis-1-1", not UUIDs).
-- Change to TEXT so any stable verse identifier can be stored.

ALTER TABLE public.verse_highlights
  DROP CONSTRAINT IF EXISTS verse_highlights_verse_id_fkey;
ALTER TABLE public.verse_highlights
  ALTER COLUMN verse_id TYPE TEXT;

ALTER TABLE public.verse_bookmarks
  DROP CONSTRAINT IF EXISTS verse_bookmarks_verse_id_fkey;
ALTER TABLE public.verse_bookmarks
  ALTER COLUMN verse_id TYPE TEXT;

ALTER TABLE public.verse_notes
  DROP CONSTRAINT IF EXISTS verse_notes_verse_id_fkey;
ALTER TABLE public.verse_notes
  ALTER COLUMN verse_id TYPE TEXT;
