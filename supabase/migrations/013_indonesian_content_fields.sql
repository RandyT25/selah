-- Add Indonesian language fields to verse_of_day
alter table verse_of_day
  add column if not exists verse_text_id text,
  add column if not exists reflection_id text;

-- Add Indonesian language fields to devotionals
alter table devotionals
  add column if not exists title_id text,
  add column if not exists excerpt_id text,
  add column if not exists content_id text,
  add column if not exists key_verse_id text;
