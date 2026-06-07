-- ============================================================
-- SELAH - Bible Books Seed Data
-- Migration: 003_seed_bible_books
-- All 66 books of the Bible
-- ============================================================

INSERT INTO public.bible_books (book_number, name, abbreviation, testament, genre, chapter_count, verse_count) VALUES
-- Old Testament
(1, 'Genesis', 'Gen', 'OT', 'Law', 50, 1533),
(2, 'Exodus', 'Exod', 'OT', 'Law', 40, 1213),
(3, 'Leviticus', 'Lev', 'OT', 'Law', 27, 859),
(4, 'Numbers', 'Num', 'OT', 'Law', 36, 1288),
(5, 'Deuteronomy', 'Deut', 'OT', 'Law', 34, 959),
(6, 'Joshua', 'Josh', 'OT', 'History', 24, 658),
(7, 'Judges', 'Judg', 'OT', 'History', 21, 618),
(8, 'Ruth', 'Ruth', 'OT', 'History', 4, 85),
(9, '1 Samuel', '1Sam', 'OT', 'History', 31, 810),
(10, '2 Samuel', '2Sam', 'OT', 'History', 24, 695),
(11, '1 Kings', '1Kgs', 'OT', 'History', 22, 816),
(12, '2 Kings', '2Kgs', 'OT', 'History', 25, 719),
(13, '1 Chronicles', '1Chr', 'OT', 'History', 29, 942),
(14, '2 Chronicles', '2Chr', 'OT', 'History', 36, 822),
(15, 'Ezra', 'Ezra', 'OT', 'History', 10, 280),
(16, 'Nehemiah', 'Neh', 'OT', 'History', 13, 406),
(17, 'Esther', 'Esth', 'OT', 'History', 10, 167),
(18, 'Job', 'Job', 'OT', 'Wisdom', 42, 1070),
(19, 'Psalms', 'Ps', 'OT', 'Poetry', 150, 2461),
(20, 'Proverbs', 'Prov', 'OT', 'Wisdom', 31, 915),
(21, 'Ecclesiastes', 'Eccl', 'OT', 'Wisdom', 12, 222),
(22, 'Song of Solomon', 'Song', 'OT', 'Poetry', 8, 117),
(23, 'Isaiah', 'Isa', 'OT', 'Prophecy', 66, 1292),
(24, 'Jeremiah', 'Jer', 'OT', 'Prophecy', 52, 1364),
(25, 'Lamentations', 'Lam', 'OT', 'Poetry', 5, 154),
(26, 'Ezekiel', 'Ezek', 'OT', 'Prophecy', 48, 1273),
(27, 'Daniel', 'Dan', 'OT', 'Prophecy', 12, 357),
(28, 'Hosea', 'Hos', 'OT', 'Prophecy', 14, 197),
(29, 'Joel', 'Joel', 'OT', 'Prophecy', 3, 73),
(30, 'Amos', 'Amos', 'OT', 'Prophecy', 9, 146),
(31, 'Obadiah', 'Obad', 'OT', 'Prophecy', 1, 21),
(32, 'Jonah', 'Jonah', 'OT', 'Prophecy', 4, 48),
(33, 'Micah', 'Mic', 'OT', 'Prophecy', 7, 105),
(34, 'Nahum', 'Nah', 'OT', 'Prophecy', 3, 47),
(35, 'Habakkuk', 'Hab', 'OT', 'Prophecy', 3, 56),
(36, 'Zephaniah', 'Zeph', 'OT', 'Prophecy', 3, 53),
(37, 'Haggai', 'Hag', 'OT', 'Prophecy', 2, 38),
(38, 'Zechariah', 'Zech', 'OT', 'Prophecy', 14, 211),
(39, 'Malachi', 'Mal', 'OT', 'Prophecy', 4, 55),
-- New Testament
(40, 'Matthew', 'Matt', 'NT', 'Gospel', 28, 1071),
(41, 'Mark', 'Mark', 'NT', 'Gospel', 16, 678),
(42, 'Luke', 'Luke', 'NT', 'Gospel', 24, 1151),
(43, 'John', 'John', 'NT', 'Gospel', 21, 879),
(44, 'Acts', 'Acts', 'NT', 'History', 28, 1007),
(45, 'Romans', 'Rom', 'NT', 'Epistle', 16, 433),
(46, '1 Corinthians', '1Cor', 'NT', 'Epistle', 16, 437),
(47, '2 Corinthians', '2Cor', 'NT', 'Epistle', 13, 257),
(48, 'Galatians', 'Gal', 'NT', 'Epistle', 6, 149),
(49, 'Ephesians', 'Eph', 'NT', 'Epistle', 6, 155),
(50, 'Philippians', 'Phil', 'NT', 'Epistle', 4, 104),
(51, 'Colossians', 'Col', 'NT', 'Epistle', 4, 95),
(52, '1 Thessalonians', '1Thess', 'NT', 'Epistle', 5, 89),
(53, '2 Thessalonians', '2Thess', 'NT', 'Epistle', 3, 47),
(54, '1 Timothy', '1Tim', 'NT', 'Epistle', 6, 113),
(55, '2 Timothy', '2Tim', 'NT', 'Epistle', 4, 83),
(56, 'Titus', 'Titus', 'NT', 'Epistle', 3, 46),
(57, 'Philemon', 'Phlm', 'NT', 'Epistle', 1, 25),
(58, 'Hebrews', 'Heb', 'NT', 'Epistle', 13, 303),
(59, 'James', 'Jas', 'NT', 'Epistle', 5, 108),
(60, '1 Peter', '1Pet', 'NT', 'Epistle', 5, 105),
(61, '2 Peter', '2Pet', 'NT', 'Epistle', 3, 61),
(62, '1 John', '1John', 'NT', 'Epistle', 5, 105),
(63, '2 John', '2John', 'NT', 'Epistle', 1, 13),
(64, '3 John', '3John', 'NT', 'Epistle', 1, 14),
(65, 'Jude', 'Jude', 'NT', 'Epistle', 1, 25),
(66, 'Revelation', 'Rev', 'NT', 'Prophecy', 22, 404)
ON CONFLICT (book_number) DO NOTHING;

-- Insert chapter data for all books
-- Genesis (50 chapters)
INSERT INTO public.bible_chapters (book_id, chapter_number, verse_count)
SELECT b.id, c.n, v.count FROM public.bible_books b,
(VALUES
  (1,31),(2,25),(3,24),(4,26),(5,32),(6,22),(7,24),(8,22),(9,29),(10,32),
  (11,32),(12,20),(13,18),(14,24),(15,21),(16,16),(17,27),(18,33),(19,38),(20,18),
  (21,34),(22,24),(23,20),(24,67),(25,34),(26,35),(27,46),(28,22),(29,35),(30,43),
  (31,55),(32,32),(33,20),(34,31),(35,29),(36,43),(37,36),(38,30),(39,23),(40,23),
  (41,57),(42,38),(43,34),(44,34),(45,28),(46,34),(47,31),(48,22),(49,33),(50,26)
) AS c(n, count),
LATERAL (SELECT c.count) v(count)
WHERE b.book_number = 1
ON CONFLICT (book_id, chapter_number) DO NOTHING;

-- Seed the verse of the day with some initial data
INSERT INTO public.verse_of_day (verse_reference, verse_text, reflection, scheduled_date) VALUES
('John 3:16', 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', 'This beloved verse captures the very heart of the gospel. God''s love for humanity is so profound that He gave His most precious gift — His only Son. In Christ, we find not condemnation, but the path to eternal life. Rest today in the assurance of God''s love for you personally.', CURRENT_DATE),
('Psalm 23:1', 'The LORD is my shepherd; I shall not want.', 'In the ancient world, a shepherd''s role was one of constant care and protection. David, himself a shepherd before becoming king, understood this relationship deeply. God is not a distant ruler but an intimate guide who knows our every need. What areas of your life do you need to trust more fully to the Shepherd?', CURRENT_DATE + 1),
('Jeremiah 29:11', 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.', 'Spoken to Israel in exile, this promise rings through the centuries to us today. Even in seasons of uncertainty or difficulty, God holds a purposeful plan. His thoughts toward us are of peace and hope. Take heart — your story is not over, and God''s plans for you are good.', CURRENT_DATE + 2),
('Philippians 4:13', 'I can do all things through Christ who strengthens me.', 'Paul wrote these words not from a place of triumph, but from prison. He had learned the secret of contentment in all circumstances — not through his own strength, but through Christ''s power working within him. Whatever challenge you face today, you do not face it alone.', CURRENT_DATE + 3),
('Romans 8:28', 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.', 'This is one of Scripture''s great reassurances. "All things" — not just the pleasant ones — are being worked together for good. God is a master weaver, taking even our darkest threads and incorporating them into a beautiful design. Trust the Weaver today.', CURRENT_DATE + 4),
('Proverbs 3:5-6', 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', 'The wisdom literature of the Bible returns again and again to this central truth: human understanding is limited, but God''s is infinite. True wisdom begins with surrendering our own reasoning to God''s perfect guidance. Where do you need to surrender control today?', CURRENT_DATE + 5),
('Isaiah 40:31', 'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.', 'Isaiah''s magnificent poetry speaks to the miraculous exchange available to those who wait on God. Our weakness is traded for His strength; our weariness for His energy; our limitations for His boundlessness. Are you feeling weary today? Come and wait upon the Lord.', CURRENT_DATE + 6)
ON CONFLICT (scheduled_date) DO NOTHING;

-- Seed initial reading plans
INSERT INTO public.reading_plans (title, description, duration_days, category, difficulty, is_featured, is_published, content, tags) VALUES
('Bible in a Year', 'Read through the entire Bible in 365 days with this comprehensive plan covering Old and New Testament passages daily.', 365, 'comprehensive', 'intermediate', true, true,
'[{"day":1,"title":"In the Beginning","readings":[{"book":"Genesis","chapters":[1,2]},{"book":"Matthew","chapters":[1]}]},{"day":2,"title":"The Fall","readings":[{"book":"Genesis","chapters":[3,4]},{"book":"Matthew","chapters":[2]}]}]'::jsonb,
ARRAY['comprehensive', 'yearly', 'old-testament', 'new-testament']),

('30 Days of Psalms', 'A month-long journey through the Psalms, exploring praise, lament, wisdom, and worship.', 30, 'prayer', 'beginner', true, true,
'[{"day":1,"title":"The Blessed Man","readings":[{"book":"Psalms","chapters":[1,2,3]}]},{"day":2,"title":"The Good Shepherd","readings":[{"book":"Psalms","chapters":[23,24,25]}]}]'::jsonb,
ARRAY['psalms', 'prayer', 'worship', 'beginner']),

('New Testament in 90 Days', 'Experience the full story of Jesus and the early church through a focused 90-day New Testament reading plan.', 90, 'new-testament', 'beginner', true, true,
'[{"day":1,"title":"The Gospel Begins","readings":[{"book":"Matthew","chapters":[1,2,3]}]},{"day":2,"title":"The Sermon on the Mount","readings":[{"book":"Matthew","chapters":[4,5,6]}]}]'::jsonb,
ARRAY['new-testament', 'gospels', 'acts', 'epistles']),

('Proverbs for Wisdom', 'One chapter of Proverbs each day for 31 days, building practical wisdom for everyday life.', 31, 'wisdom', 'beginner', false, true,
'[{"day":1,"title":"The Beginning of Wisdom","readings":[{"book":"Proverbs","chapters":[1]}]},{"day":2,"title":"Seeking Wisdom","readings":[{"book":"Proverbs","chapters":[2]}]}]'::jsonb,
ARRAY['wisdom', 'proverbs', 'practical', 'daily']),

('Life of Jesus', 'A 40-day study tracing Jesus''s life through all four Gospels, from birth to resurrection.', 40, 'topical', 'beginner', true, true,
'[{"day":1,"title":"Before the Beginning","readings":[{"book":"John","chapters":[1]}]},{"day":2,"title":"The Birth of Jesus","readings":[{"book":"Matthew","chapters":[1,2]},{"book":"Luke","chapters":[1,2]}]}]'::jsonb,
ARRAY['jesus', 'gospels', 'life-of-christ', 'foundational']),

('Sermon on the Mount', 'A 7-day deep dive into the most famous sermon ever preached, exploring what it means to live in the Kingdom of God.', 7, 'topical', 'intermediate', false, true,
'[{"day":1,"title":"The Beatitudes","readings":[{"book":"Matthew","chapters":[5]}]},{"day":2,"title":"Salt and Light","readings":[{"book":"Matthew","chapters":[5]},{"book":"Luke","chapters":[6]}]}]'::jsonb,
ARRAY['sermon-on-the-mount', 'jesus', 'beatitudes', 'kingdom']),

('Fruit of the Spirit', 'A 9-day journey through Galatians 5 and related passages, growing in love, joy, peace, and more.', 9, 'topical', 'beginner', false, true,
'[{"day":1,"title":"Love","readings":[{"book":"Galatians","chapters":[5]},{"book":"1 Corinthians","chapters":[13]}]},{"day":2,"title":"Joy","readings":[{"book":"Philippians","chapters":[4]},{"book":"Romans","chapters":[15]}]}]'::jsonb,
ARRAY['spiritual-growth', 'fruit-of-spirit', 'galatians', 'character']),

('Advent: Waiting for the Light', 'A 24-day Advent reading plan preparing your heart for Christmas through Old Testament prophecy and Gospel fulfillment.', 24, 'seasonal', 'beginner', false, true,
'[{"day":1,"title":"The Promise Begins","readings":[{"book":"Genesis","chapters":[3]},{"book":"Isaiah","chapters":[9]}]},{"day":2,"title":"A Voice in the Wilderness","readings":[{"book":"Isaiah","chapters":[40]},{"book":"Mark","chapters":[1]}]}]'::jsonb,
ARRAY['advent', 'christmas', 'prophecy', 'seasonal']);

-- Seed initial devotionals
INSERT INTO public.devotionals (title, slug, content, excerpt, key_verse, key_verse_reference, category, tags, reading_time_minutes, is_published, is_featured, published_at) VALUES
('The Art of Selah', 'the-art-of-selah',
'In the midst of life''s relentless pace, the ancient Hebrew word "Selah" calls us to something revolutionary: pause.

Found 71 times in the Psalms, Selah was a musical notation — a call to stop, breathe, and reflect on what had just been said. In a world drowning in noise and distraction, this ancient invitation has never been more needed.

**What Does Selah Mean?**

Scholars debate the precise meaning: some say it means "to lift up," others "to pause," and still others "to measure." But in practice, Selah was always a moment of intentional interruption — a breath between truth and the next truth, space for the heart to absorb what the mind had just received.

When the Psalmist writes, "God is our refuge and strength, an ever-present help in trouble. Therefore we will not fear... Selah" — he is not just taking a breath. He is inviting the reader into the profound weight of what was just declared.

**The Practice of Pause**

We live in what sociologists call "attention economy" — a world where every platform competes for the commodity of your focus. Silence has become radical. Stillness has become countercultural. And reflection? Almost subversive.

But the soul was not made for constant stimulation. We are creatures of rhythm — made to work and rest, to speak and be silent, to receive and to integrate.

The practice of Selah is not about doing nothing. It is about doing the most important thing: letting truth drop from your head to your heart.

**Practicing Selah Today**

1. **Before reading Scripture**, take three slow breaths. Ask God to open your heart, not just your eyes.

2. **During your reading**, when a verse arrests you — stop. Don''t rush to the next verse. Sit with that verse. Let it ask you questions.

3. **After your reading**, close the book. Sit for five minutes in silence. What did God say? What does He want you to carry into the day?

4. **Throughout the day**, create Selah moments — between meetings, in the car, before meals. Use these spaces to reconnect with the truth you received in the morning.

**A Closing Invitation**

Right now, before you close this devotional, practice Selah. Set a timer for two minutes. Close your eyes. Breathe slowly. Let the truth of this moment settle into your spirit.

*God is here. He is good. And He is inviting you to pause long enough to experience that.*

Selah.',
'In the midst of life''s relentless pace, the ancient Hebrew word "Selah" calls us to something revolutionary: pause.',
'God is our refuge and strength, an ever-present help in trouble.',
'Psalm 46:1',
'spiritual-disciplines', ARRAY['selah', 'reflection', 'contemplation', 'pause', 'prayer'], 7, true, true, NOW()),

('Finding God in the Ordinary', 'finding-god-in-the-ordinary',
'Jacob was fleeing for his life, exhausted and afraid. With a stone for a pillow and the open sky as his ceiling, he lay down in what seemed like an unremarkable place — just a stretch of desert between where he had been and where he was going.

Then he dreamed. And in that dream, heaven and earth were connected by a ladder, with angels ascending and descending. And at the top stood God Himself, speaking words of promise and presence.

When Jacob woke, he made a remarkable declaration: "Surely the LORD is in this place, and I was not aware of it."

**The Awareness Gap**

Jacob''s confession reveals something universal about the human experience: God is often present in ways we do not immediately perceive. We walk through sacred spaces without knowing they are sacred. We pass through holy moments without recognizing their holiness.

This is not because God is hiding. It is because we are not paying attention.

The ordinary is saturated with the presence of God. The morning light that falls through your window. The coffee cooling in your hands. The face of your child. The unexpected kindness of a stranger. These are not coincidences — they are invitations.

**Learning the Language of the Sacred**

Brother Lawrence, a 17th-century monk, discovered what he called "the practice of the presence of God." Working in the monastery kitchen — peeling potatoes, washing pots — he found the same joy in these mundane tasks as he did in formal prayer. Not because the tasks were special, but because he had trained his attention.

"We can do little things for God," he wrote. "I turn the cake that is frying on the pan for love of Him."

This is the art of sacred attention: doing ordinary things with extraordinary awareness.

**Three Questions for Today**

As you move through this day, ask yourself:

1. Where did I sense God''s presence in the last 24 hours?
2. What "ordinary" moments might actually be invitations?
3. How would my day change if I moved through it with Jacob''s awareness?

**A Stone for Your Altar**

After his dream, Jacob took the stone he had slept on and set it upright as an altar — a marker of where heaven and earth had touched. What stones might you set up today? A journal entry? A photograph? A moment of gratitude?

The extraordinary life of faith is not found in extraordinary circumstances. It is found in ordinary moments, perceived with extraordinary awareness.

Surely the LORD is in this place. Are you aware of it?',
'Jacob was fleeing for his life when he encountered God in the most unexpected place — teaching us that the ordinary is saturated with divine presence.',
'Surely the LORD is in this place, and I was not aware of it.',
'Genesis 28:16',
'spiritual-growth', ARRAY['presence', 'awareness', 'ordinary', 'jacob', 'sacred'], 8, true, true, NOW() - INTERVAL '1 day'),

('The Weight of Silence', 'the-weight-of-silence',
'Elijah had just experienced the greatest victory of his prophetic career — fire from heaven on Mount Carmel, the false prophets of Baal defeated, and rain ending a three-year drought. By any measure, it should have been his finest hour.

Instead, he ran. Exhausted, terrified, and suicidal under a broom tree, he told God, "It is enough, Lord. Take my life."

What follows is one of Scripture''s most tender portraits of divine care. God didn''t rebuke him. Didn''t remind him of what he had just accomplished. Instead, an angel touched him and said: "Arise and eat."

**Rest Before Revelation**

The pattern that follows is instructive: Elijah ate, rested, ate again, and then journeyed for forty days and nights to Horeb — the mountain of God. Only then, in the cave, did God come to him.

And when God came, He did not come in the wind that tore the mountains apart. He did not come in the earthquake. He did not come in the fire.

He came in a still, small voice. A gentle whisper.

**The Noise of Our Lives**

We live in a world that equates volume with importance. We confuse busyness with fruitfulness and noise with significance. We fill every silence with sound, every space with stimulation — and then wonder why we cannot hear God.

But God most often speaks in whispers. And whispers require a particular kind of listening.

**The Discipline of Silence**

Christian tradition has always recognized silence as a spiritual discipline. The Desert Fathers fled to the desert not to escape life, but to find it. Thomas Merton wrote that "silence is the language of God; all else is poor translation."

This is not easy in our world. Silence feels uncomfortable precisely because it strips away our distractions and forces us to confront ourselves — our fears, our failures, our longings. Silence is where we meet both ourselves and God honestly.

**A Practice of Sacred Silence**

Today''s invitation is simple, and it is hard:

Find five minutes of complete silence. No music. No podcast. No scrolling. Just you and the quiet.

Breathe slowly. Let the noise settle like sediment in still water. And then, listen. Not for dramatic words — but for the gentle whisper of the God who meets exhausted prophets under broom trees and speaks through the silence.

He is waiting to meet you there.',
'After Elijah''s greatest victory came his deepest despair — and God met him not in the dramatic, but in the gentle whisper of silence.',
'After the fire came a gentle whisper.',
'1 Kings 19:12',
'spiritual-disciplines', ARRAY['silence', 'elijah', 'rest', 'spiritual-disciplines', 'listening'], 6, true, false, NOW() - INTERVAL '2 days');
