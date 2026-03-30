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

// ─── Progress ─────────────────────────────────────────────────────────────────

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
