import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DifficultyBadge from '@/components/ui/DifficultyBadge'
import LessonContent from '@/components/lesson/LessonContent'
import { getMockContent } from '@/lib/mockLessons'
import type { DifficultyLevel, Lesson, LessonProgress, Topic, Subject } from '@rise/shared'

interface PageProps {
  params: { id: string }
}

async function getLessonData(lessonId: string, userId: string | null) {
  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`
      *,
      topic:topics(
        *,
        subject:subjects(*)
      )
    `)
    .eq('id', lessonId)
    .single()

  if (!lesson) return null

  let progress: LessonProgress | null = null
  let hasSessionForTopic = false

  if (userId) {
    const [progressResult, sessionsResult] = await Promise.all([
      supabase
        .from('lesson_progress')
        .select('*')
        .eq('student_id', userId)
        .eq('lesson_id', lessonId)
        .single(),
      supabase
        .from('student_sessions')
        .select('topics_covered')
        .eq('student_id', userId),
    ])

    progress = progressResult.data

    const topicName: string = (lesson as Lesson & { topic: Topic }).topic?.name ?? ''
    const sessions = sessionsResult.data ?? []
    hasSessionForTopic = sessions.some(
      (s) =>
        Array.isArray(s.topics_covered) &&
        s.topics_covered.some(
          (t: string) => typeof t === 'string' && t.toLowerCase() === topicName.toLowerCase()
        )
    )
  }

  return {
    lesson: lesson as Lesson & { topic: Topic & { subject: Subject } },
    progress,
    hasSessionForTopic,
  }
}

export default async function LessonPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const result = await getLessonData(params.id, user?.id ?? null)
  if (!result) notFound()

  const { lesson, progress, hasSessionForTopic } = result
  const diffLevel: DifficultyLevel = progress?.difficulty_level ?? 'building'

  // Fall back to mock content when Supabase content is null
  const content = lesson.content ?? getMockContent(lesson.slug)
  const lessonWithContent = { ...lesson, content }

  return (
    <div className="rise-page rise-page-wide">

      {/* Page header */}
      <div className="mb-6 border-b border-primary-200/30 pb-6">
        <div className="flex items-center gap-3">
          <Link href={lesson.topic?.subject?.slug ? `/subjects/${lesson.topic.subject.slug}` : '/subjects'}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 border border-primary-200/50 transition-all hover:bg-primary-100">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 4L6 9L11 14" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="rise-overline text-[10px]">
                {lesson.topic?.subject?.name}
              </p>
              <p className="text-sm text-secondary-300">
                {progress?.completed_at ? 'Completed' : 'In progress'}
              </p>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight text-secondary-900">{lesson.title}</h1>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)]">
        {/* Tutor banner — only shown when real student_sessions data links this topic */}
        {hasSessionForTopic ? (
          <div className="glass-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 border border-primary-200/40 text-sm font-semibold text-primary-600">
                T
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-900 mb-1">Covered in a recent session</p>
                <p className="text-sm leading-relaxed text-secondary-600">
                  Your tutor worked through{' '}
                  <span className="font-medium text-secondary-900">{lesson.topic?.name}</span>{' '}
                  with you. This lesson reinforces what you covered together.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 border border-primary-200/40">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="#7C3AED" strokeWidth="1.5" />
                  <path d="M9 6v4M9 12v.5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-900 mb-1">How this lesson works</p>
                <p className="text-sm leading-relaxed text-secondary-600">
                  Work through the content at your own pace. Use the interactive questions to test yourself, then self-assess at the end so your next recommendation stays accurate.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card-solid p-5">
          <p className="rise-overline text-[10px] mb-4">Lesson details</p>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rise-chip capitalize">
              {lesson.type === 'learn' ? '📖 Learn' : '✏️ Practise'}
            </span>
            <DifficultyBadge level={diffLevel} size="sm" />
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-200/50 px-3 py-2">
            <p className="text-xs font-semibold text-amber-700">⚡ +50 XP on completion</p>
          </div>
        </div>
      </div>

      {/* Lesson content */}
      {lessonWithContent.content ? (
        <div className="max-w-5xl">
          <LessonContent lesson={lessonWithContent} difficultyLevel={diffLevel} />
        </div>
      ) : (
        <div className="glass-card-solid text-center py-12">
          <span className="text-4xl mb-3 block">🔧</span>
          <p className="font-bold text-secondary-900">Content coming soon</p>
          <p className="text-sm text-secondary-400 mt-1">This lesson is being prepared</p>
        </div>
      )}
    </div>
  )
}
