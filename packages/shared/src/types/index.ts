// ─── Difficulty ───────────────────────────────────────────────────────────────

export type DifficultyLevel = 'building' | 'getting_there' | 'confident'

export interface DifficultyIndicator {
  level: DifficultyLevel
  label: string
  emoji: string
  color: string
  tailwindBg: string
  tailwindText: string
  tailwindBorder: string
}

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyIndicator> = {
  building: {
    level: 'building',
    label: 'Building',
    emoji: '🔴',
    color: '#EF4444',
    tailwindBg: 'bg-red-100',
    tailwindText: 'text-red-700',
    tailwindBorder: 'border-red-200',
  },
  getting_there: {
    level: 'getting_there',
    label: 'Getting There',
    emoji: '🟡',
    color: '#F59E0B',
    tailwindBg: 'bg-yellow-100',
    tailwindText: 'text-yellow-700',
    tailwindBorder: 'border-yellow-200',
  },
  confident: {
    level: 'confident',
    label: 'Confident',
    emoji: '🟢',
    color: '#10B981',
    tailwindBg: 'bg-green-100',
    tailwindText: 'text-green-700',
    tailwindBorder: 'border-green-200',
  },
}

// ─── Database Types ────────────────────────────────────────────────────────────

export interface Subject {
  id: string
  name: string
  slug: string
  icon: string | null
  created_at: string
}

export interface Topic {
  id: string
  subject_id: string
  name: string
  slug: string
  order_index: number
  created_at: string
}

export type LessonType = 'learn' | 'practise'

// ─── Interactive Types ─────────────────────────────────────────────────────────

export type InteractiveType =
  | 'foil_grid'
  | 'balance_scale'
  | 'fraction_bar'
  | 'graph_plotter'
  | 'number_line'
  | 'probability_tree'
  | 'venn_diagram'
  | 'generic_mcq'

// ─── Legacy Lesson Content (v1) ───────────────────────────────────────────────
// Kept for backward compatibility with existing Supabase data.
// New lessons should use LearnLessonContent or PractiseLessonContent (version 2).

export interface LessonBlock {
  type: 'concept' | 'rule' | 'example'
  heading: string
  body: string
  formula?: string
  steps?: string[]
  answer?: string
}

export interface TryIt {
  question: string
  interactive_config: Record<string, unknown>
  answer: string
  worked_solution: string[]
}

export interface LessonContent {
  hook: string
  blocks: LessonBlock[]
  interactive_type: InteractiveType
  interactive_config: Record<string, unknown>
  try_it: TryIt
  summary: string[]
}

// ─── Rich Lesson Content (v2) ─────────────────────────────────────────────────
// The canonical lesson content format for Edexcel GCSE Maths.
//
// Every subtopic is split into exactly two lessons:
//   1. LearnLessonContent  — teaches the concept
//   2. PractiseLessonContent — builds fluency with 5 graded questions
//
// Support-level adaptation: difficulty level controls scaffolding intensity,
// not which lesson the student is in or what the topic objective is.

/** Scaffolding shown conditionally based on support level. */
export interface LearnScaffolding {
  /** Shown only to 'building' students — simpler explanation of the concept. */
  simplified_explanation?: string
  /** Shown only to 'building' students — additional step-by-step hints. */
  extra_hints?: string[]
  /** Shown only to 'confident' students — stretch / extension note. */
  extension_note?: string
}

/** A single question in a practise lesson. */
export interface PracticeQuestion {
  question: string
  answer: string
  worked_solution: string[]
  /** If provided, renders an interactive MCQ for this question. */
  interactive_type?: InteractiveType
  interactive_config?: Record<string, unknown>
  /** Shown to 'building' students as a prompt before they attempt the question. */
  hint?: string
}

/** A common mistake entry in a practise lesson. */
export interface CommonMistake {
  /** What the student does wrong. */
  mistake: string
  /** Why this is incorrect. */
  why_wrong: string
  /** The correct approach. */
  correction: string
}

/**
 * Learn lesson content (version 2).
 *
 * Structure:
 *  1. intro — topic context + what the student will learn
 *  2. why_it_matters — 2–3 bullet points
 *  3. explanation — clear body + optional formula + key terms
 *  4. visual — prebuilt interactive/visual element config
 *  5. worked_example — full step-by-step model solution
 *  6. summary — 3–5 key points to remember
 *  7. scaffolding — conditional support content per difficulty level
 */
export interface LearnLessonContent {
  version: 2
  type: 'learn'
  intro: {
    topic_name: string
    what_you_will_learn: string
  }
  /** 2–3 concise reasons why this topic matters (maths, exams, real-world). */
  why_it_matters: string[]
  explanation: {
    body: string
    formula?: string
    key_terms?: Array<{ term: string; definition: string }>
  }
  visual: {
    interactive_type: InteractiveType
    config: Record<string, unknown>
    /** Instructional caption shown below the visual. */
    caption?: string
  }
  worked_example: {
    question: string
    steps: string[]
    answer: string
  }
  summary: string[]
  scaffolding?: LearnScaffolding
}

/**
 * Practise lesson content (version 2).
 *
 * Structure:
 *  1. orientation — one-sentence reminder of what is being practised
 *  2. worked_example — a model question before the student starts
 *  3. questions — exactly 5 questions, ordered easier → harder
 *  4. common_mistakes — 2–3 typical errors with explanation
 *  5. summary — method checklist / final reminders
 */
export interface PractiseLessonContent {
  version: 2
  type: 'practise'
  /** Short reminder of what this practice session is about. */
  orientation: string
  worked_example: {
    question: string
    steps: string[]
    answer: string
  }
  /** Exactly 5 questions, ordered from easier to harder. */
  questions: PracticeQuestion[]
  /** 2–3 typical mistakes with explanation and correction. */
  common_mistakes: CommonMistake[]
  summary: string[]
}

/**
 * Union of all valid lesson content formats.
 * Use isLearnContent / isPractiseContent / isLegacyContent type guards
 * to narrow to the specific format before rendering.
 */
export type AnyLessonContent = LessonContent | LearnLessonContent | PractiseLessonContent

// ─── Type Guards ──────────────────────────────────────────────────────────────

/** Returns true if content is a v2 Learn lesson. */
export function isLearnContent(c: AnyLessonContent): c is LearnLessonContent {
  return (
    typeof c === 'object' &&
    c !== null &&
    'version' in c &&
    (c as { version?: number }).version === 2 &&
    (c as { type?: string }).type === 'learn'
  )
}

/** Returns true if content is a v2 Practise lesson. */
export function isPractiseContent(c: AnyLessonContent): c is PractiseLessonContent {
  return (
    typeof c === 'object' &&
    c !== null &&
    'version' in c &&
    (c as { version?: number }).version === 2 &&
    (c as { type?: string }).type === 'practise'
  )
}

/** Returns true if content is legacy v1 format. */
export function isLegacyContent(c: AnyLessonContent): c is LessonContent {
  return !isLearnContent(c) && !isPractiseContent(c)
}

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Lesson {
  id: string
  topic_id: string
  title: string
  slug: string
  type: LessonType
  order_index: number
  content: AnyLessonContent | null
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  year_group: number | null
  tutor_id: string | null
  created_at: string
}

export interface LessonProgress {
  id: string
  student_id: string
  lesson_id: string
  difficulty_level: DifficultyLevel
  lesson_1_score: number | null
  completed_at: string | null
  created_at: string
}

export interface StudentSession {
  id: string
  student_id: string
  tutor_id: string
  session_date: string
  topics_covered: string[]
  notes: string | null
  created_at: string
}

// ─── Joined / View Types ───────────────────────────────────────────────────────

export interface LessonWithProgress extends Lesson {
  progress: LessonProgress | null
}

export interface TopicWithLessons extends Topic {
  lessons: LessonWithProgress[]
}

export interface SubjectWithTopics extends Subject {
  topics: TopicWithLessons[]
}
