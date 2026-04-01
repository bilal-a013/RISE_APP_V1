import { createClient } from '@/lib/supabase/server'
import { isMathsSubject } from '@/lib/onboarding'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DifficultyBadge from '@/components/ui/DifficultyBadge'
import type { DifficultyLevel, Lesson, LessonProgress, Topic } from '@rise/shared'

interface PageProps {
  params: { slug: string }
}

async function getTopicsWithProgress(subjectSlug: string, userId: string | null) {
  const supabase = await createClient()

  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', subjectSlug)
    .single()

  if (!subject) return null

  const { data: topics } = await supabase
    .from('topics')
    .select(`
      *,
      lessons(*)
    `)
    .eq('subject_id', subject.id)
    .order('order_index', { ascending: true })

  if (!topics) return { subject, topics: [] }

  // Fetch progress for authenticated users
  let progressMap: Record<string, LessonProgress> = {}
  if (userId) {
    const lessonIds = topics.flatMap((t) => (t.lessons as Lesson[]).map((l) => l.id))
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', userId)
      .in('lesson_id', lessonIds)

    progressMap = Object.fromEntries((progress ?? []).map((p) => [p.lesson_id, p]))
  }

  return {
    subject,
    topics: (topics as Array<Topic & { lessons: Lesson[] }>).map((topic) => ({
      ...topic,
      lessons: topic.lessons
        .sort((a, b) => a.order_index - b.order_index)
        .map((lesson) => ({
          ...lesson,
          progress: progressMap[lesson.id] ?? null,
        })),
    })),
  }
}

export default async function SubjectPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const result = await getTopicsWithProgress(params.slug, user?.id ?? null)

  if (!result) notFound()

  const { subject, topics } = result
  if (!isMathsSubject(subject)) notFound()

  return (
    <div className="rise-page rise-page-wide">

      {/* Page header */}
      <div className="mb-6 flex items-start gap-4 border-b border-primary-200/30 pb-6">
        <Link href="/subjects">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 border border-primary-200/50 transition-all hover:bg-primary-100">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9L11 14" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="rise-overline mb-2">Maths overview</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-secondary-900">{subject.name}</h1>
          <p className="mt-2 max-w-2xl text-base text-secondary-400">
            Browse the maths topics, inspect lesson completion, and open exactly the lesson you want next.
          </p>
        </div>
        <div className="hidden glass-card px-5 py-4 text-right lg:block">
          <p className="rise-overline text-[10px] mb-2">Topics</p>
          <p className="text-3xl font-extrabold text-primary-600">{topics.length}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {topics.map((topic) => {
          const completedCount = topic.lessons.filter((l) => l.progress?.completed_at).length
          const total = topic.lessons.length
          const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0

          return (
            <div key={topic.id} className="glass-card-solid p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold leading-tight text-secondary-900">{topic.name}</h2>
                <span className="text-xs font-semibold text-secondary-300">
                  {completedCount}/{total}
                </span>
              </div>

              <div className="mb-4 h-2 overflow-hidden rounded-full bg-primary-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #C4B5FD 0%, #8B5CF6 45%, #7C3AED 100%)',
                  }}
                />
              </div>

              <div className="space-y-2">
                {topic.lessons.map((lesson) => {
                  const done = !!lesson.progress?.completed_at
                  const diffLevel = (lesson.progress?.difficulty_level ?? 'building') as DifficultyLevel

                  return (
                    <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                      <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                        done
                          ? 'bg-white/40 border-primary-100/30'
                          : 'bg-primary-50/50 border-primary-200/30 hover:bg-primary-50 hover:border-primary-300/40'
                      }`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                          done ? 'bg-green-50 border-green-200/50' : 'bg-white/80 border-primary-200/30'
                        }`}>
                          {done ? (
                            <span className="text-sm">✅</span>
                          ) : (
                            <span className="text-sm">{lesson.type === 'learn' ? '📖' : '✏️'}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`truncate text-sm font-semibold ${done ? 'text-secondary-300' : 'text-secondary-900'}`}>
                            {lesson.title}
                          </p>
                          <p className="text-xs capitalize text-secondary-300">{lesson.type}</p>
                        </div>

                        {lesson.progress && (
                          <DifficultyBadge level={diffLevel} size="sm" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
