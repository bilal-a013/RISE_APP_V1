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

export interface LessonBlock {
  type: 'concept' | 'rule' | 'example'
  heading: string
  body: string
  formula?: string
  steps?: string[]
  answer?: string
}

export type InteractiveType =
  | 'foil_grid'
  | 'balance_scale'
  | 'fraction_bar'
  | 'graph_plotter'
  | 'number_line'
  | 'probability_tree'
  | 'venn_diagram'
  | 'generic_mcq'

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

export interface Lesson {
  id: string
  topic_id: string
  title: string
  slug: string
  type: LessonType
  order_index: number
  content: LessonContent | null
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
