import type { Difficulty, SubjectId } from "../types";
import { SUBJECT_MAP } from "../constants";

// ─── Subject Helpers ──────────────────────────────────────────────────────────

/**
 * Returns the display name for a given subject ID.
 */
export function getSubjectName(id: SubjectId): string {
  return SUBJECT_MAP[id]?.name ?? id;
}

// ─── Date / Time Helpers ──────────────────────────────────────────────────────

/**
 * Formats a duration in minutes to a human-readable string.
 * e.g. 90 → "1h 30m", 45 → "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Returns a relative time string for a given ISO date string.
 * e.g. "2 days ago", "just now"
 */
export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Score Helpers ────────────────────────────────────────────────────────────

/**
 * Returns a percentage string rounded to the nearest integer.
 */
export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Maps a numeric score (0–1) to a difficulty level.
 */
export function scoreToDifficulty(score: number): Difficulty {
  if (score >= 0.8) return "easy";
  if (score >= 0.5) return "medium";
  return "hard";
}
