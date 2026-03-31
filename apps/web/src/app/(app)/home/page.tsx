import Link from 'next/link'
import DifficultyBadge from '@/components/ui/DifficultyBadge'
import { logout } from '@/app/auth/actions'
import { createClient } from '@/lib/supabase/server'
import {
  getAgeRangeLabel,
  getDashboardRecommendation,
  getStudyStyleLabel,
  getTargetGradeLabel,
  getWorkingLevelLabel,
  isMathsSubject,
} from '@/lib/onboarding'
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
  const recommendation = getDashboardRecommendation(userMetadata)
  const streak = Math.max(1, Math.min(7, completedProgress.length || 1))
  const xp = completedProgress.length * 50
  const userName = userMetadata.full_name?.toString().split(' ')[0] ?? 'there'
  const onboardingMode = userMetadata.onboarding_mode === 'tutor_code' ? 'tutor_code' : 'new_student'
  const recommendedTopic =
    typeof userMetadata.recommended_topic === 'string' ? userMetadata.recommended_topic : ''
  const targetGradeLabel = getTargetGradeLabel(userMetadata.target_grade)
  const workingLevelLabel = getWorkingLevelLabel(userMetadata.working_level)
  const ageRangeLabel = getAgeRangeLabel(userMetadata.age_range)
  const studyStyleLabel = getStudyStyleLabel(userMetadata.study_style)
  const hasStartedLesson = Boolean(currentLesson?.progress)
  const pathSummary =
    onboardingMode === 'tutor_code'
      ? `Tutor-curated path`
      : `${studyStyleLabel} style`
  const introCopy = lastSession
    ? `Last session: ${new Date(lastSession.session_date).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })}. Next step is ready.`
    : hasStartedLesson
    ? 'Pick up exactly where you left off.'
    : 'A focused starting point is ready for you.'

  return (
    <div className="rise-page rise-page-wide">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#a39cb8]">Home</p>
          <h1 className="mt-1.5 text-[2.8rem] font-black leading-[0.9] text-[#1f1833] xl:text-[3.6rem]">
            {greetingForHour()}, {userName}
          </h1>
          {/* Long-term goal — inline, concise, near the top */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-2">
            <span className="rounded-[999px] bg-[#ede4ff] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#7C3AED]">
              {targetGradeLabel}
            </span>
            <span className="text-sm font-medium text-[#847d9c]">
              {workingLevelLabel}
            </span>
            {ageRangeLabel && (
              <>
                <span className="text-[#c4bcd6]">·</span>
                <span className="text-sm font-medium text-[#847d9c]">{ageRangeLabel}</span>
              </>
            )}
            <span className="text-[#c4bcd6]">·</span>
            <span className="text-sm font-medium text-[#847d9c]">{pathSummary}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/progress" className="rise-chip hidden lg:inline-flex">Progress</Link>
          <Link href="/subjects" className="rise-chip hidden lg:inline-flex">Browse maths</Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-[999px] px-3 py-2 text-xs font-black text-[#9993b4] transition hover:text-[#6d28d9]"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* ── Dominant lesson hero ─────────────────────────────── */}
      {currentLesson ? (
        <Link href={`/lessons/${currentLesson.lesson.id}`} className="block">
          <div className="rise-lesson-hero transition-all hover:opacity-[0.97]">

            {/* Hero header */}
            <div className="px-6 pb-0 pt-7 xl:px-10 xl:pt-9">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">
                {recommendation.eyebrow}
              </p>
              <h2 className="mt-2 max-w-3xl text-[2.4rem] font-black leading-[0.9] text-white xl:text-[3.4rem]">
                {recommendation.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-white/55 xl:text-base">
                {introCopy}
              </p>
            </div>

            {/* Hero content: lesson preview + action panel */}
            <div className="mt-6 gap-4 px-6 pb-0 xl:grid xl:grid-cols-[minmax(0,1fr)_270px] xl:px-10">

              {/* Milky glass lesson preview */}
              <div className="rise-lesson-glass p-5 xl:p-6">
                <LessonPreview lesson={currentLesson} blurred={hasStartedLesson} />
              </div>

              {/* Right: focus info + CTA */}
              <div className="mt-4 flex flex-col gap-3 xl:mt-0">
                <div className="flex-1 rounded-[1.15rem] border border-white/[0.08] bg-white/[0.06] p-5 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.20em] text-white/38">Focus</p>
                  <p className="mt-2 text-xl font-black leading-tight text-white">
                    {recommendedTopic || currentLesson.lesson.topic?.name || 'Maths'}
                  </p>
                  <p className="mt-2 text-xs font-medium leading-relaxed text-white/48">
                    {recommendation.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-[999px] bg-white/[0.09] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                      {currentLesson.lesson.topic?.subject?.name ?? 'Maths'}
                    </span>
                    <DifficultyBadge
                      level={(currentLesson.progress?.difficulty_level ?? 'building') as DifficultyLevel}
                      size="sm"
                    />
                  </div>
                </div>

                <div
                  className="rounded-[1.15rem] p-5 text-center"
                  style={{
                    background: 'linear-gradient(180deg, #ffe45c 0%, #ffd317 100%)',
                    boxShadow: '0 12px 28px rgba(252,211,77,0.30)',
                  }}
                >
                  <p className="text-sm font-black text-gray-900">
                    {hasStartedLesson ? 'Continue lesson →' : 'Start lesson →'}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-gray-700/65">+50 XP on completion</p>
                </div>
              </div>
            </div>

            {/* Hero breadcrumb footer */}
            <div className="mt-5 flex flex-wrap items-center gap-2 px-6 pb-7 xl:px-10 xl:pb-9">
              <span className="rounded-[999px] bg-white/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-white/36">
                {currentLesson.lesson.topic?.subject?.name ?? 'Maths'} · {currentLesson.lesson.topic?.name}
              </span>
              <span className="rounded-[999px] bg-white/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-white/36">
                {currentLesson.lesson.type === 'learn' ? 'Learn' : 'Practise'}
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <Link href="/subjects" className="block">
          <div className="rise-lesson-hero px-6 py-14 text-center xl:px-16">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/38">No lesson queued</p>
            <h2 className="mt-3 text-[2.4rem] font-black leading-[0.9] text-white xl:text-[3.2rem]">
              Open a maths topic and begin.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-relaxed text-white/50">
              Choose a topic, or let the app guide the first recommendation.
            </p>
            <div className="mt-7 inline-flex rounded-[0.95rem] bg-white/[0.10] px-7 py-3.5 text-sm font-black text-white/80 backdrop-blur-sm">
              Open maths hub →
            </div>
          </div>
        </Link>
      )}

      {/* ── Quiet secondary strip ─────────────────────────────── */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <Link
          href="/progress?focus=streak"
          className="flex items-center gap-2 rounded-[999px] border border-[#ece3fb] bg-white/80 px-4 py-2 text-sm font-black text-[#4b3a7a] shadow-[0_6px_16px_rgba(71,46,143,0.06)] transition hover:bg-white"
        >
          <span>🔥</span>
          <span>{streak} day streak</span>
        </Link>

        <Link
          href="/progress?focus=xp"
          className="flex items-center gap-2 rounded-[999px] border border-[#ece3fb] bg-white/80 px-4 py-2 text-sm font-black text-[#4b3a7a] shadow-[0_6px_16px_rgba(71,46,143,0.06)] transition hover:bg-white"
        >
          <span>⚡</span>
          <span>{xp.toLocaleString()} XP</span>
        </Link>

        {lastSession && (
          <span className="flex items-center gap-2 rounded-[999px] border border-[#ece3fb] bg-white/80 px-4 py-2 text-sm font-medium text-[#7b74a0] shadow-[0_6px_16px_rgba(71,46,143,0.05)]">
            <span className="text-[#9b84c8]">Last session</span>
            <span className="font-black text-[#4b3a7a]">
              {new Date(lastSession.session_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </span>
        )}

        <Link
          href="/subjects"
          className="ml-auto flex items-center gap-2 rounded-[999px] border border-[#ece3fb] bg-white/80 px-4 py-2 text-sm font-black text-[#7C3AED] shadow-[0_6px_16px_rgba(71,46,143,0.06)] transition hover:bg-white lg:ml-0"
        >
          Browse all maths →
        </Link>
      </div>
    </div>
  )
}

function LessonPreview({ lesson, blurred = false }: { lesson: CurrentLesson; blurred?: boolean }) {
  const summary =
    lesson.lesson.content?.summary?.slice(0, 3) ?? [
      'Build fluency with the core method.',
      'Work through an exam-shaped example.',
      'Finish with a clear self-check.',
    ]

  return (
    <div className={blurred ? 'blur-[4px] opacity-75' : ''}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-[999px] bg-[#f5ecff] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#a03af8]">
          {lesson.lesson.topic?.subject?.name ?? 'Maths'} · {lesson.lesson.topic?.name}
        </span>
        <DifficultyBadge
          level={(lesson.progress?.difficulty_level ?? 'building') as DifficultyLevel}
          size="sm"
        />
      </div>

      <h3 className="text-[2rem] font-black leading-[0.92] text-[#1c1833] xl:text-[2.6rem]">
        {lesson.lesson.title}
      </h3>
      <p className="mt-1.5 text-xs font-medium text-[#7f7899]">
        {lesson.lesson.type === 'learn' ? 'Learn' : 'Practise'} · +50 XP on completion
      </p>

      <div className="mt-4 space-y-2.5">
        {summary.map((point, index) => (
          <div key={index} className="flex items-start gap-3 rounded-[0.85rem] bg-[#faf7ff] px-4 py-3">
            <span className="mt-0.5 text-xs font-black text-[#8b35ef]">•</span>
            <p className="text-sm font-semibold leading-snug text-[#3d3657]">{point}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
