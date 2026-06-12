-- Fix "Bible in a Year" plan: description says 365 days but duration_days was stored as 184.
-- The detail page padding logic will fill in the missing Day 185–365 as empty placeholder entries.
UPDATE reading_plans
SET duration_days = 365
WHERE title = 'Bible in a Year'
  AND duration_days < 365;
