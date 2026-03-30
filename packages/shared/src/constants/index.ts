import type { ExamBoard, Subject, SubjectId, YearGroup } from "../types";

// ─── Year Groups ──────────────────────────────────────────────────────────────

export const YEAR_GROUPS: YearGroup[] = ["Year 10", "Year 11"];

// ─── Exam Boards ──────────────────────────────────────────────────────────────

export const EXAM_BOARDS: ExamBoard[] = [
  "AQA",
  "Edexcel",
  "OCR",
  "WJEC",
  "CCEA",
];

// ─── Subjects ─────────────────────────────────────────────────────────────────

export const SUBJECTS: Subject[] = [
  { id: "maths", name: "Mathematics" },
  { id: "english-language", name: "English Language" },
  { id: "english-literature", name: "English Literature" },
  { id: "biology", name: "Biology" },
  { id: "chemistry", name: "Chemistry" },
  { id: "physics", name: "Physics" },
  { id: "combined-science", name: "Combined Science" },
  { id: "history", name: "History" },
  { id: "geography", name: "Geography" },
  { id: "french", name: "French" },
  { id: "spanish", name: "Spanish" },
  { id: "german", name: "German" },
  { id: "computer-science", name: "Computer Science" },
  { id: "religious-studies", name: "Religious Studies" },
  { id: "art-design", name: "Art & Design" },
  { id: "physical-education", name: "Physical Education" },
];

export const SUBJECT_MAP = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s])
) as Record<SubjectId, Subject>;

// ─── Difficulty Labels ────────────────────────────────────────────────────────

export const DIFFICULTY_LABELS = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
} as const;

// ─── App Config ───────────────────────────────────────────────────────────────

export const APP_NAME = "RISE";
export const APP_TAGLINE = "Revise smarter. Rise higher.";
