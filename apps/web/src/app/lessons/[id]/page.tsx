import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DifficultyBadge from '@/components/ui/DifficultyBadge'
import LessonContent from '@/components/lesson/LessonContent'
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
  if (userId) {
    const { data } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_id', userId)
      .eq('lesson_id', lessonId)
      .single()
    progress = data
  }

  return { lesson: lesson as Lesson & { topic: Topic & { subject: Subject } }, progress }
}

export default async function LessonPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const result = await getLessonData(params.id, user?.id ?? null)
  if (!result) notFound()

  const { lesson, progress } = result
  const diffLevel: DifficultyLevel = progress?.difficulty_level ?? 'building'

  return (
    <div className="rise-page">
      {/* Back button + meta */}
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/subjects/${lesson.topic?.subject?.slug}`}>
          <div className="w-9 h-9 rounded-xl bg-white shadow flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9L11 14" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider truncate">
            {lesson.topic?.subject?.name} · {lesson.topic?.name}
          </p>
          <h1 className="text-lg font-black text-gray-900 leading-tight">{lesson.title}</h1>
        </div>
      </div>

      {/* Type + Difficulty row */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-bold bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full capitalize">
          {lesson.type === 'learn' ? '📖 Learn' : '✏️ Practise'}
        </span>
        <DifficultyBadge level={diffLevel} size="sm" />
      </div>

      {/* Lesson content */}
      {lesson.content ? (
        <LessonContent lesson={lesson} difficultyLevel={diffLevel} />
      ) : (
        <div className="rise-card text-center py-12">
          <span className="text-3xl mb-3 block">🔧</span>
          <p className="font-black text-gray-900">Content coming soon</p>
          <p className="text-sm text-slate-500 mt-1">This lesson is being prepared</p>
        </div>
      )}
    </div>
  )
}
