import { createClient } from '@/lib/supabase/server'
import type { StudentSession } from '@/lib/student-session'

export type StudentAppActivityType =
  | 'app_opened'
  | 'home_viewed'
  | 'homework_viewed'
  | 'practice_started'
  | 'practice_completed'
  | 'lesson_started'
  | 'lesson_completed'
  | 'quiz_completed'

export interface StudentAppActivity {
  id: string
  activity_type: StudentAppActivityType
  title?: string | null
  description?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
}

export interface StudentProgressSummary {
  id: string
  child_profile_id: string
  subject?: string | null
  topic?: string | null
  skill?: string | null
  status?: string | null
  confidence_level?: string | null
  score?: number | null
  attempts?: number | null
  last_practised_at?: string | null
  updated_at?: string | null
  created_at?: string | null
}

export interface LessonAttempt {
  id: string
  child_profile_id: string
  lesson_id?: string | null
  subject?: string | null
  topic?: string | null
  activity_title?: string | null
  score?: number | null
  total_questions?: number | null
  correct_answers?: number | null
  time_spent_seconds?: number | null
  weak_areas?: string[] | null
  completed_at?: string | null
  metadata?: Record<string, unknown> | null
}

export async function recordStudentAppActivity(
  session: StudentSession,
  input: {
    activityType: StudentAppActivityType
    title?: string
    description?: string
    metadata?: Record<string, unknown>
  }
): Promise<StudentAppActivity | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('record_student_app_activity', {
    lookup_child_profile_id: session.childProfileId,
    lookup_tutor_key_id: session.tutorKeyId,
    input_activity_type: input.activityType,
    input_title: input.title ?? null,
    input_description: input.description ?? null,
    input_metadata: input.metadata ?? {},
  })

  if (error) {
    throw error
  }

  return data as StudentAppActivity | null
}

export async function getRecentStudentAppActivity(
  session: StudentSession,
  limit = 6
): Promise<StudentAppActivity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_student_app_activity', {
    lookup_child_profile_id: session.childProfileId,
    lookup_tutor_key_id: session.tutorKeyId,
    input_limit: limit,
  })

  if (error) {
    throw error
  }

  return Array.isArray(data) ? (data as StudentAppActivity[]) : []
}

export async function upsertStudentProgressSummary(
  session: StudentSession,
  input: {
    subject: string
    topic: string
    skill?: string
    status?: string
    confidenceLevel?: string
    score?: number
    attemptsIncrement?: number
    lastPractisedAt?: string
  }
): Promise<StudentProgressSummary | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('upsert_student_progress', {
    lookup_child_profile_id: session.childProfileId,
    lookup_tutor_key_id: session.tutorKeyId,
    input_subject: input.subject,
    input_topic: input.topic,
    input_skill: input.skill ?? null,
    input_status: input.status ?? null,
    input_confidence_level: input.confidenceLevel ?? null,
    input_score: input.score ?? null,
    input_attempts_increment: input.attemptsIncrement ?? 1,
    input_last_practised_at: input.lastPractisedAt ?? new Date().toISOString(),
  })

  if (error) {
    throw error
  }

  return data as StudentProgressSummary | null
}

export async function recordLessonAttempt(
  session: StudentSession,
  input: {
    lessonId?: string
    subject?: string
    topic?: string
    activityTitle?: string
    score?: number
    totalQuestions?: number
    correctAnswers?: number
    timeSpentSeconds?: number
    weakAreas?: string[]
    metadata?: Record<string, unknown>
  }
): Promise<LessonAttempt | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('record_lesson_attempt', {
    lookup_child_profile_id: session.childProfileId,
    lookup_tutor_key_id: session.tutorKeyId,
    input_lesson_id: input.lessonId ?? null,
    input_subject: input.subject ?? null,
    input_topic: input.topic ?? null,
    input_activity_title: input.activityTitle ?? null,
    input_score: input.score ?? null,
    input_total_questions: input.totalQuestions ?? null,
    input_correct_answers: input.correctAnswers ?? null,
    input_time_spent_seconds: input.timeSpentSeconds ?? null,
    input_weak_areas: input.weakAreas ?? [],
    input_metadata: input.metadata ?? {},
  })

  if (error) {
    throw error
  }

  return data as LessonAttempt | null
}
