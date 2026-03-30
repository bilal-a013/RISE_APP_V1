// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  yearGroup: YearGroup;
  examBoard: ExamBoard;
  createdAt: string;
}

// ─── Academic ─────────────────────────────────────────────────────────────────

export type YearGroup = "Year 10" | "Year 11";

export type ExamBoard = "AQA" | "Edexcel" | "OCR" | "WJEC" | "CCEA";

export type SubjectId =
  | "maths"
  | "english-language"
  | "english-literature"
  | "biology"
  | "chemistry"
  | "physics"
  | "combined-science"
  | "history"
  | "geography"
  | "french"
  | "spanish"
  | "german"
  | "computer-science"
  | "religious-studies"
  | "art-design"
  | "physical-education";

export interface Subject {
  id: SubjectId;
  name: string;
  examBoard?: ExamBoard;
}

// ─── Topics & Revision ────────────────────────────────────────────────────────

export interface Topic {
  id: string;
  subjectId: SubjectId;
  title: string;
  description?: string;
}

export interface RevisionCard {
  id: string;
  topicId: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
  lastReviewedAt?: string;
  nextReviewAt?: string;
}

export type Difficulty = "easy" | "medium" | "hard";

// ─── AI Tutor ─────────────────────────────────────────────────────────────────

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface TutorSession {
  id: string;
  userId: string;
  subjectId: SubjectId;
  topicId?: string;
  messages: TutorMessage[];
  createdAt: string;
}

// ─── Difficulty ───────────────────────────────────────────────────────────────

export type DifficultyLevel = 'building' | 'getting_there' | 'confident';

export interface DifficultyIndicator {
  level: DifficultyLevel;
  label: string;
  colour: string;
  description: string;
}

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyIndicator> = {
  building: {
    level: 'building',
    label: 'Building',
    colour: '#EF4444',
    description: 'Still finding it tricky — extra support included',
  },
  getting_there: {
    level: 'getting_there',
    label: 'Getting There',
    colour: '#F59E0B',
    description: 'Making good progress — standard pace',
  },
  confident: {
    level: 'confident',
    label: 'Confident',
    colour: '#10B981',
    description: 'Got this — challenge mode on',
  },
};

export function getDifficultyFromScore(score: number): DifficultyLevel {
  if (score >= 80) return 'confident';
  if (score >= 50) return 'getting_there';
  return 'building';
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface LessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
  time_spent_seconds: number;
  difficulty_level: DifficultyLevel;
  lesson_1_score: number | null;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: SubjectId;
  topicId?: string;
  durationMinutes: number;
  score?: number;
  completedAt: string;
}

export interface UserProgress {
  userId: string;
  subjectId: SubjectId;
  topicsCompleted: string[];
  totalStudyMinutes: number;
  averageScore?: number;
}
