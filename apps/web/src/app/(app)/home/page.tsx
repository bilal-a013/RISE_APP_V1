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
      <div className="mb-6 flex flex-col gap-4 border-b border-[#ede6fb] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#a39cb8]">Home</p>
          <h1 className="mt-2 text-[2.75rem] font-black leading-none text-[#1f1833]">
            {greetingForHour()}, {userName}
          </h1>
          <p className="mt-3 text-base font-medium text-[#6f6a84]">{introCopy}</p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="rounded-[0.95rem] border border-[#e4daf7] bg-white/80 px-4 py-2 text-sm font-black text-[#6a27cb] transition hover:bg-white"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rise-card p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-[999px] bg-[#f3e8ff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#8f2eff]">
              {hasStartedLesson ? 'Continue lesson' : 'Start here'}
            </span>
            {recommendedTopic ? (
              <span className="rounded-[999px] bg-[#faf7ff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#8f2eff]">
                {recommendedTopic}
              </span>
            ) : null}
          </div>

          {currentLesson ? (
            <Link href={`/lessons/${currentLesson.lesson.id}`} className="block">
              <div className="relative overflow-hidden rounded-[1.1rem] border border-[#ece2fb] bg-white p-5">
                {hasStartedLesson ? (
                  <>
                    <div className="pointer-events-none select-none blur-[3px]">
                      <LessonPreview lesson={currentLesson} />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.94)_38%,rgba(255,255,255,1)_100%)] p-5 pt-14">
                      <div className="rise-btn-primary text-sm">Continue lesson</div>
                    </div>
                  </>
                ) : (
                  <>
                    <LessonPreview lesson={currentLesson} />
                    <div className="mt-5 rise-btn-primary text-sm">Start lesson</div>
                  </>
                )}
              </div>
            </Link>
          ) : (
            <Link href="/subjects" className="block">
              <div className="rounded-[1.1rem] border border-dashed border-[#caaef2] bg-white px-5 py-8 text-center">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d88a7]">No lesson queued</p>
                <h2 className="mt-2 text-[2rem] font-black leading-none text-[#1d1830]">Pick a maths topic</h2>
                <div className="mt-5 inline-flex rounded-[0.95rem] bg-[#1f1737] px-5 py-3 text-sm font-black text-white">
                  Open maths
                </div>
              </div>
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/progress?focus=streak" className="block">
            <div className="rise-card rise-card-interactive p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a7a0bd]">Daily streak</p>
              <p className="mt-3 text-[2.4rem] font-black leading-none text-[#1f1833]">🔥 {streak}</p>
              <p className="mt-2 text-sm font-medium text-[#6f6a84]">Open full progress.</p>
            </div>
          </Link>

          <Link href="/progress?focus=xp" className="block">
            <div className="rise-card rise-card-interactive p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a7a0bd]">XP total</p>
              <p className="mt-3 text-[2.4rem] font-black leading-none text-[#1f1833]">⚡ {xp.toLocaleString()}</p>
              <p className="mt-2 text-sm font-medium text-[#6f6a84]">See the full breakdown.</p>
            </div>
          </Link>

          <Link href="/subjects" className="block">
            <div className="rise-card rise-card-interactive bg-[linear-gradient(180deg,#1d1830_0%,#100d1d_100%)] p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Choose yourself</p>
              <p className="mt-3 text-[2rem] font-black leading-none">Pick a different topic.</p>
              <p className="mt-2 text-sm font-medium text-white/70">Browse maths any time.</p>
            </div>
          </Link>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[2rem] font-black leading-none text-[#1f1c35]">Maths topics</h2>
          <Link href="/subjects" className="text-sm font-black text-[#8f2eff]">
            Open maths
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {topicHighlights.map((topic) => (
            <Link key={topic.label} href="/subjects">
              <div className="rise-card rise-card-interactive h-full p-5">
                <p className="text-[1.5rem] font-black leading-none text-[#201c37]">{topic.label}</p>
                <p className="mt-2 text-sm font-medium text-[#7f7b93]">{topic.summary}</p>
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
        <span className="rounded-[999px] bg-[#f5ecff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#a03af8]">
          {lesson.lesson.topic?.subject?.name ?? 'Maths'} · {lesson.lesson.topic?.name}
        </span>
        <DifficultyBadge
          level={(lesson.progress?.difficulty_level ?? 'building') as DifficultyLevel}
          size="sm"
        />
      </div>

      <div>
        <h3 className="text-[2rem] font-black leading-[0.95] text-[#1c1833]">{lesson.lesson.title}</h3>
        <p className="mt-2 text-sm font-medium text-[#6f6a84]">
          {lesson.lesson.type === 'learn' ? 'Learn' : 'Practise'} · +50 XP on completion
        </p>
      </div>

      <div className="space-y-2">
        {summary.map((point, index) => (
          <div key={index} className="flex items-start gap-3 rounded-[0.95rem] bg-[#faf7ff] px-3 py-3">
            <span className="mt-0.5 text-sm font-black text-[#8b35ef]">•</span>
            <p className="text-sm font-semibold text-[#3d3657]">{point}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
