import Link from 'next/link'
import DifficultyBadge from '@/components/ui/DifficultyBadge'
import { logout } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/server'
import { isMathsSubject } from '@/lib/onboarding'
import type {
  DifficultyLevel,
  Lesson,
  LessonProgress,
  StudentSession,
  Subject,
  Topic,
} from '@rise/shared'

interface CurrentLesson {
  lesson: Lesson & { topic: Topic & { subject: Subject } }
  progress: LessonProgress | null
}

interface CompletedProgressRow extends LessonProgress {
  lesson: {
    topic: {
      subject: Pick<Subject, 'name' | 'slug' | 'icon'>
    } | null
  } | null
}

async function getCurrentLesson(userId: string): Promise<CurrentLesson | null> {
  const supabase = await createClient()

  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select(`
      *,
      lesson:lessons(
        *,
        topic:topics(
          *,
          subject:subjects(*)
        )
      )
    `)
    .eq('student_id', userId)
    .is('completed_at', null)
    .order('created_at', { ascending: false })
    .limit(18)

  const inProgressLesson = (progressRows ?? []).find((row) => isMathsSubject(row.lesson?.topic?.subject))
  if (inProgressLesson?.lesson) {
    return {
      lesson: inProgressLesson.lesson as CurrentLesson['lesson'],
      progress: inProgressLesson as LessonProgress,
    }
  }

  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      *,
      topic:topics(
        *,
        subject:subjects(*)
      )
    `)
    .eq('type', 'learn')
    .order('order_index', { ascending: true })
    .limit(40)

  const firstMathsLesson = (lessons ?? []).find((lesson) => isMathsSubject(lesson.topic?.subject))
  if (firstMathsLesson) {
    return { lesson: firstMathsLesson as CurrentLesson['lesson'], progress: null }
  }

  return null
}

async function getLastSession(userId: string): Promise<StudentSession | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('student_sessions')
    .select('*')
    .eq('student_id', userId)
    .order('session_date', { ascending: false })
    .limit(1)
    .single()

  return data
}

async function getMathsProgress(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('lesson_progress')
    .select(`
      *,
      lesson:lessons(
        topic:topics(
          subject:subjects(name, slug, icon)
        )
      )
    `)
    .eq('student_id', userId)
    .not('completed_at', 'is', null)

  return ((data ?? []) as CompletedProgressRow[]).filter((row) => isMathsSubject(row.lesson?.topic?.subject))
}

function greetingForHour() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [currentLesson, lastSession, completedProgress] = await Promise.all([
    getCurrentLesson(user.id),
    getLastSession(user.id),
    getMathsProgress(user.id),
  ])

  const userMetadata = (user.user_metadata ?? {}) as Record<string, unknown>
  const userName =
    typeof userMetadata.full_name === 'string' ? userMetadata.full_name.split(' ')[0] : 'there'
  const recommendedTopic =
    typeof userMetadata.recommended_topic === 'string' ? userMetadata.recommended_topic : ''
  const hasStartedLesson = Boolean(currentLesson?.progress)
  const streak = Math.max(1, Math.min(7, completedProgress.length || 1))
  const xp = completedProgress.length * 50
  const introCopy = lastSession
    ? `Last tutor session: ${new Date(lastSession.session_date).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })}.`
    : hasStartedLesson
      ? 'Continue your current lesson.'
      : 'Start with the lesson below or pick your own maths topic.'

  const topicHighlights = [
    recommendedTopic ? { label: recommendedTopic, summary: 'Suggested' } : null,
    { label: 'Algebra', summary: 'Equations' },
    { label: 'Number', summary: 'Fluency' },
    { label: 'Ratio', summary: 'Proportion' },
    { label: 'Geometry', summary: 'Angles' },
  ].filter(Boolean) as Array<{ label: string; summary: string }>

  return (
    <div className="rise-page">

      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-primary-200/30 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="rise-overline mb-2">Home</p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-secondary-900 lg:text-5xl">
            {greetingForHour()},{' '}
            <span className="rise-gradient-text">{userName}</span>
          </h1>
          <p className="mt-2 text-sm text-secondary-400">{introCopy}</p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="rise-btn-outline rounded-xl px-4 py-2 text-sm"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Main grid: lesson hero + stat cards */}
      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">

        {/* Current lesson card */}
        <div className="glass-card-solid p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rise-chip">
              {hasStartedLesson ? 'Continue lesson' : 'Start here'}
            </span>
            {recommendedTopic ? (
              <span className="rise-chip">{recommendedTopic}</span>
            ) : null}
          </div>

          {currentLesson ? (
            <Link href={`/lessons/${currentLesson.lesson.id}`} className="block">
              <div className="relative overflow-hidden rounded-xl border border-primary-200/30 bg-white/60">
                {hasStartedLesson ? (
                  <>
                    <div className="pointer-events-none select-none blur-[3px] p-5">
                      <LessonPreview lesson={currentLesson} />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5 pt-14"
                      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 40%, rgba(255,255,255,1) 100%)' }}
                    >
                      <div className="rise-btn-primary text-sm">Continue lesson</div>
                    </div>
                  </>
                ) : (
                  <div className="p-5">
                    <LessonPreview lesson={currentLesson} />
                    <div className="mt-5 rise-btn-primary text-sm">Start lesson</div>
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <Link href="/subjects" className="block">
              <div className="rounded-xl border border-dashed border-primary-300/50 bg-primary-50/50 px-5 py-10 text-center transition-all hover:bg-primary-50">
                <p className="rise-overline text-[10px] mb-2">No lesson queued</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-secondary-900">Pick a maths topic</h2>
                <div className="mt-5 inline-flex rise-btn-primary w-auto px-6 py-3 text-sm">
                  Open maths
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Stat cards column */}
        <div className="flex flex-col gap-3">
          <Link href="/progress?focus=streak" className="block">
            <div className="glass-card-solid rise-card-interactive p-5">
              <p className="rise-overline text-[10px] mb-3">Daily streak</p>
              <p className="text-5xl font-extrabold leading-none text-secondary-900">🔥 {streak}</p>
              <p className="mt-2 text-sm text-secondary-400">Open full progress.</p>
            </div>
          </Link>

          <Link href="/progress?focus=xp" className="block">
            <div className="glass-card-solid rise-card-interactive p-5">
              <p className="rise-overline text-[10px] mb-3">XP total</p>
              <p className="text-5xl font-extrabold leading-none text-secondary-900">⚡ {xp.toLocaleString()}</p>
              <p className="mt-2 text-sm text-secondary-400">See the full breakdown.</p>
            </div>
          </Link>

          <Link href="/subjects" className="block">
            <div className="rise-card-interactive p-5 rounded-2xl border border-primary-200/40 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60 mb-3">Choose yourself</p>
              <p className="text-2xl font-extrabold leading-tight tracking-tight text-white">Pick a different topic.</p>
              <p className="mt-2 text-sm text-white/70">Browse maths any time.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Maths topics section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-secondary-900">Maths topics</h2>
          <Link href="/subjects" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            Open maths →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {topicHighlights.map((topic) => (
            <Link key={topic.label} href="/subjects">
              <div className="glass-card rise-card-interactive h-full p-5">
                <p className="text-xl font-bold leading-tight text-secondary-900">{topic.label}</p>
                <p className="mt-2 text-sm text-secondary-400">{topic.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function LessonPreview({ lesson }: { lesson: CurrentLesson }) {
  const summary =
    lesson.lesson.content?.summary?.slice(0, 3) ?? [
      'Build fluency with the core method.',
      'Work through an exam-shaped example.',
      'Finish with a clear self-check.',
    ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rise-chip">
          {lesson.lesson.topic?.subject?.name ?? 'Maths'} · {lesson.lesson.topic?.name}
        </span>
        <DifficultyBadge
          level={(lesson.progress?.difficulty_level ?? 'building') as DifficultyLevel}
          size="sm"
        />
      </div>

      <div>
        <h3 className="text-3xl font-extrabold leading-tight tracking-tight text-secondary-900">
          {lesson.lesson.title}
        </h3>
        <p className="mt-1 text-sm text-secondary-400">
          {lesson.lesson.type === 'learn' ? 'Learn' : 'Practise'} · +50 XP on completion
        </p>
      </div>

      <div className="space-y-2">
        {summary.map((point, index) => (
          <div key={index} className="flex items-start gap-3 rounded-xl bg-primary-50/60 px-3 py-2.5 border border-primary-200/20">
            <span className="mt-0.5 text-sm font-semibold text-primary-600">•</span>
            <p className="text-sm text-secondary-700">{point}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
