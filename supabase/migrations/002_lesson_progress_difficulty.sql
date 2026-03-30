-- ============================================================
-- RISE — Migration: Add difficulty tracking to lesson_progress
-- Migration: 002_lesson_progress_difficulty.sql
-- ============================================================

ALTER TABLE public.lesson_progress
ADD COLUMN IF NOT EXISTS difficulty_level text
DEFAULT 'building'
CHECK (difficulty_level IN ('building', 'getting_there', 'confident'));

ALTER TABLE public.lesson_progress
ADD COLUMN IF NOT EXISTS lesson_1_score integer DEFAULT NULL;

COMMENT ON COLUMN public.lesson_progress.difficulty_level IS
'building = red, getting_there = yellow, confident = green.
Lesson 1 always defaults to building.
Lesson 2 is set automatically based on lesson_1_score after lesson 1 completion.';
