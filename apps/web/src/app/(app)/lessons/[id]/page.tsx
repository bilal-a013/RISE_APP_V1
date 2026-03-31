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
  const recommendedTopic =
    typeof user?.user_metadata?.recommended_topic === 'string'
      ? user.user_metadata.recommended_topic
      : ''
  const onboardingMode = user?.user_metadata?.onboarding_mode === 'tutor_code' ? 'tutor_code' : 'new_student'

  // Fall back to mock content when Supabase content is null
  const content = lesson.content ?? getMockContent(lesson.slug)
  const lessonWithContent = { ...lesson, content }

  return (
    <div className="rise-page rise-page-wide">
      <div className="mb-6 border-b border-[#ede6fb] pb-6">
        <div className="flex items-center gap-3">
        <Link href={lesson.topic?.subject?.slug ? `/subjects/${lesson.topic.subject.slug}` : '/subjects'}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ecff] shadow-[0_10px_20px_rgba(124,58,237,0.10)]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9L11 14" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-xs font-black uppercase tracking-[0.22em] text-[#a7a4b8]">
              {lesson.topic?.subject?.name}
            </p>
            <p className="text-sm font-bold text-[#c0bccf]">
              {progress?.completed_at ? 'Completed' : '1 / 8'}
            </p>
          </div>
          <h1 className="mt-2 text-[2rem] font-black leading-[1.05] text-[#1c1930]">{lesson.title}</h1>
        </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
        <div className="rise-soft-panel px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[#eedfff] text-sm font-black text-[#7C3AED]">
              {onboardingMode === 'tutor_code' ? 'T' : 'A'}
            </div>
            <div>
              <p className="text-sm font-medium leading-relaxed text-[#8f2eff]">
                {onboardingMode === 'tutor_code'
                  ? 'This lesson is part of the tutor-shaped path, so it is designed to keep the student moving in the same direction they worked on together.'
                  : recommendedTopic
                  ? `RISE thinks ${recommendedTopic.toLowerCase()} is the strongest next move, and this lesson is part of that direction.`
                  : 'RISE has picked this as a strong next maths step based on the student profile and progress so far.'}
              </p>
              <p className="mt-2 text-sm font-medium text-[#7d7892]">
                Work through the explanation, try the interactive question, then self-assess so the next recommendation stays accurate.
              </p>
            </div>
          </div>
        </div>

        <div className="rise-card bg-[linear-gradient(180deg,#241a4a_0%,#18142f_100%)] p-5 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Lesson details</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rise-chip capitalize">
              {lesson.type === 'learn' ? '📖 Learn' : '✏️ Practise'}
            </span>
            <DifficultyBadge level={diffLevel} size="sm" />
          </div>
          <p className="mt-4 rounded-full bg-[#fff3ca] px-3 py-2 text-xs font-black text-[#7b5200]">
            ⚡ +50 XP on completion
          </p>
        </div>
      </div>

      {lessonWithContent.content ? (
        <div className="max-w-5xl">
          <LessonContent lesson={lessonWithContent} difficultyLevel={diffLevel} />
        </div>
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
