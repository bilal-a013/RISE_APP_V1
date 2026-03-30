import { createClient } from '@/lib/supabase/server'
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

  return (
    <div className="rise-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/subjects">
          <div className="w-9 h-9 rounded-xl bg-white shadow flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9L11 14" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">{subject.name}</h1>
          <p className="text-xs text-slate-500">{topics.length} topics</p>
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-4">
        {topics.map((topic) => {
          const completedCount = topic.lessons.filter((l) => l.progress?.completed_at).length
          const total = topic.lessons.length
          const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0

          return (
            <div key={topic.id} className="rise-card">
              {/* Topic header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-gray-900">{topic.name}</h2>
                <span className="text-xs font-bold text-slate-400">
                  {completedCount}/{total}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-[#7C3AED] rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Lessons */}
              <div className="space-y-2">
                {topic.lessons.map((lesson) => {
                  const done = !!lesson.progress?.completed_at
                  const diffLevel = (lesson.progress?.difficulty_level ?? 'building') as DifficultyLevel

                  return (
                    <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                      <div className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                        done ? 'bg-gray-50' : 'bg-[#F3F0FF] hover:bg-[#EDE9FF]'
                      }`}>
                        {/* Status icon */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          done ? 'bg-green-100' : 'bg-white shadow-sm'
                        }`}>
                          {done ? (
                            <span className="text-sm">✅</span>
                          ) : (
                            <span className="text-sm">{lesson.type === 'learn' ? '📖' : '✏️'}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${done ? 'text-slate-400' : 'text-gray-900'}`}>
                            {lesson.title}
                          </p>
                          <p className="text-xs text-slate-400 capitalize">{lesson.type}</p>
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
