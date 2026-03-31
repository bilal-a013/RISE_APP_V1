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
      <div className="mb-6 flex items-start gap-4 border-b border-[#ede6fb] pb-6">
        <Link href="/subjects">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ecff] shadow-[0_10px_20px_rgba(124,58,237,0.10)]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9L11 14" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#a39cb8]">Maths overview</p>
          <h1 className="mt-2 text-[2.4rem] font-black leading-none text-[#221d37]">{subject.name}</h1>
          <p className="mt-2 max-w-2xl text-base font-medium text-[#8d88a7]">
            Browse the maths topics, inspect lesson completion, and open exactly the lesson the student wants next.
          </p>
        </div>
        <div className="hidden rounded-[1rem] bg-[#f7f2ff] px-5 py-4 text-right lg:block">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#aa9fd0]">Topics</p>
          <p className="mt-2 text-3xl font-black text-[#7C3AED]">{topics.length}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {topics.map((topic) => {
          const completedCount = topic.lessons.filter((l) => l.progress?.completed_at).length
          const total = topic.lessons.length
          const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0

          return (
            <div key={topic.id} className="rise-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[1.35rem] font-black leading-none text-[#231d39]">{topic.name}</h2>
                <span className="text-xs font-bold text-[#968faf]">
                  {completedCount}/{total}
                </span>
              </div>

              <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#eee8fb]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#c17bff_0%,#962aff_45%,#7C3AED_100%)] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="space-y-2">
                {topic.lessons.map((lesson) => {
                  const done = !!lesson.progress?.completed_at
                  const diffLevel = (lesson.progress?.difficulty_level ?? 'building') as DifficultyLevel

                  return (
                    <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                      <div className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                        done ? 'bg-[#f8f5fd]' : 'bg-[#f4ecff] hover:bg-[#ece0ff]'
                      }`}>
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
                          <p className={`truncate text-sm font-bold ${done ? 'text-slate-400' : 'text-[#241d39]'}`}>
                            {lesson.title}
                          </p>
                          <p className="text-xs capitalize text-slate-400">{lesson.type}</p>
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
